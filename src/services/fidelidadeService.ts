import { z } from 'zod';
import prisma from '../utils/database';
import * as fidelidadeRepository from '../repositories/fidelidadeRepository';
import { AppError } from '../utils/erros';

// resgate em multiplo de 100 pontos / 100 pontos valem R$10 de desconto
const PONTOS_POR_RESGATE = 100;
const VALOR_DESCONTO_RESGATE = 10;

const schemaResgate = z.object({
  pontos: z.number().int().positive('Informe a quantidade de pontos a resgatar')
});

export async function consultarSaldo(clienteId: number) {
  const saldo = await fidelidadeRepository.buscarSaldo(clienteId);

  return {
    clienteId,
    pontos: saldo?.pontos ?? 0
  };
}

export async function consultarHistorico(clienteId: number) {
  const historico = await fidelidadeRepository.buscarHistorico(clienteId);
  return { clienteId, historico };
}

// chamado quando o pagamento e aprovado // cada R$10 do pedido vira 1 ponto
// so acumula se o cliente aceitou o programa de fidelidade  (consentimento LGPD)
export async function acumularPontos(clienteId: number, valorPedido: number) {
  const cliente = await prisma.usuario.findUnique({ where: { id: clienteId } });

  // sem consentimento n pontua
  if (!cliente || !cliente.aceitaFidelidade) {
    return null;
  }

  const pontos = Math.floor(valorPedido / 10);
  if (pontos <= 0) {
    return null;
  }

  return fidelidadeRepository.acumular(
    clienteId,
    pontos,
    `Acúmulo por pedido aprovado (R$ ${valorPedido})`
  );
}

export async function resgatarPontos(clienteId: number, body: unknown) {
  const dados = schemaResgate.parse(body);

  // o resgate tem que ser em bloco de 100 pontos
  if (dados.pontos % PONTOS_POR_RESGATE !== 0) {
    throw new AppError(422, 'RESGATE_INVALIDO', `O resgate deve ser em múltiplos de ${PONTOS_POR_RESGATE} pontos`);
  }

  const cliente = await prisma.usuario.findUnique({ where: { id: clienteId } });
  if (!cliente || !cliente.aceitaFidelidade) {
    throw new AppError(403, 'SEM_CONSENTIMENTO', 'Cliente não aderiu ao programa de fidelidade');
  }

  const saldoAtual = await fidelidadeRepository.buscarSaldo(clienteId);
  const pontosDisponiveis = saldoAtual?.pontos ?? 0;

  if (pontosDisponiveis < dados.pontos) {
    throw new AppError(409, 'PONTOS_INSUFICIENTES', 'Saldo de pontos insuficiente para o resgate', [
      { field: 'pontos', issue: `Disponível: ${pontosDisponiveis}` }
    ]);
  }

  // valor do desconto que o resgate gera
  const descontoReais = (dados.pontos / PONTOS_POR_RESGATE) * VALOR_DESCONTO_RESGATE;

  const saldo = await fidelidadeRepository.resgatar(
    clienteId,
    dados.pontos,
    `Resgate de ${dados.pontos} pontos = R$ ${descontoReais} de desconto`
  );

  // o desconto so fica registrado , nao aplica automatico em nenhum pedido
  return {
    pontosResgatados: dados.pontos,
    descontoReais,
    saldoRestante: saldo.pontos,
    observacao: 'Desconto gerado e registrado. Aplicação no pedido deve ser feita manualmente.'
  };
}
