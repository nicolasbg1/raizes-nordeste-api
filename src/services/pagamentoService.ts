import { z } from 'zod';
import * as pagamentoRepository from '../repositories/pagamentoRepository';
import * as pedidoRepository from '../repositories/pedidoRepository';
import * as fidelidadeService from './fidelidadeService';
import { processarPagamentoMock } from '../utils/pagamentoMock';
import { AppError } from '../utils/erros';

interface UsuarioLogado {
  id: number;
  perfil: string;
}

const schemaPagamento = z.object({
  formaPagamento: z.string().optional()
});

export async function processarPagamento(pedidoId: number, body: unknown, usuario: UsuarioLogado) {
  const dados = schemaPagamento.parse(body);
  const formaPagamento = dados.formaPagamento ?? 'MOCK';

  const pedido = await pedidoRepository.buscarPorId(pedidoId);
  if (!pedido) {
    throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  }

  // cliente so paga o pedido dele mesmo
  if (usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Você não tem permissão para pagar este pedido');
  }

  // so da pra pagar pedido que acabou de ser recebido / evita pagar cancelado ou ja pago
  if (pedido.status !== 'RECEBIDO') {
    throw new AppError(409, 'PEDIDO_NAO_PAGAVEL', `Pedido com status ${pedido.status} não pode ser pago`);
  }

  const valor = Number(pedido.total);

  // dispara o gateway mock / tem delay de 1-2s simulando a rede
  const retorno = await processarPagamentoMock(valor, formaPagamento);


  const pagamento = await pagamentoRepository.salvar({
    pedidoId,
    status: retorno.status,
    valor,
    formaPagamento,
    transacaoId: retorno.transacaoId,
    processadoEm: new Date(retorno.processadoEm)
  });

  if (retorno.status === 'APROVADO') {
    // pagamento aprovado entao o pedido ja vai pra preparo
    await pedidoRepository.atualizarStatus(pedidoId, 'EM_PREPARO');
    await pedidoRepository.registrarLog(
      usuario.id,
      'PAGAMENTO_APROVADO',
      pedidoId,
      `Pagamento ${retorno.transacaoId} aprovado no valor de ${valor}`
    );

    // acumula os pontos de fidelidade  (respeita o consentimento do cliente)
    await fidelidadeService.acumularPontos(pedido.clienteId, valor);
  } else {
    // ESCOLHA: quando recusa o pedido fica em RECEBIDO pra poder tentar pagar de novo
    // resolvi nao cancelar automatico pra n perder o pedido do cliente
    await pedidoRepository.registrarLog(
      usuario.id,
      'PAGAMENTO_RECUSADO',
      pedidoId,
      `Pagamento ${retorno.transacaoId} recusado (valor ${valor} acima do limite)`
    );
  }

  return {
    pedidoId,
    statusPagamento: pagamento.status,
    statusPedido: retorno.status === 'APROVADO' ? 'EM_PREPARO' : pedido.status,
    transacaoId: pagamento.transacaoId,
    valor: Number(pagamento.valor),
    formaPagamento: pagamento.formaPagamento,
    processadoEm: pagamento.processadoEm
  };
}

export async function consultarPagamento(pedidoId: number, usuario: UsuarioLogado) {
  const pedido = await pedidoRepository.buscarPorId(pedidoId);
  if (!pedido) {
    throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  }

  // cliente so consulta o pagamento do pedido dele
  if (usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Você não tem permissão para acessar este pagamento');
  }

  const pagamento = await pagamentoRepository.buscarPorPedido(pedidoId);
  if (!pagamento) {
    throw new AppError(404, 'PAGAMENTO_NAO_ENCONTRADO', 'Nenhum pagamento registrado para este pedido');
  }

  return pagamento;
}
