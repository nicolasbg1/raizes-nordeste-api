import { z } from 'zod';
import { CanalPedido, StatusPedido } from '@prisma/client';
import * as pedidoRepository from '../repositories/pedidoRepository';
import * as produtoRepository from '../repositories/produtoRepository';
import * as unidadeRepository from '../repositories/unidadeRepository';
import * as estoqueRepository from '../repositories/estoqueRepository';
import { AppError } from '../utils/erros';

const schemaItem = z.object({
  produtoId: z.number().int().positive(),
  quantidade: z.number().int().positive('Quantidade deve ser maior que zero')
});

const schemaCriar = z.object({
  // canalPedido e obrigatorioe se vier ausente ou fora do enum ja retorna 422
  canalPedido: z.enum(['APP', 'TOTEM', 'BALCAO', 'PICKUP', 'WEB']),
  unidadeId: z.number().int().positive(),
  clienteId: z.number().int().positive().optional(),
  itens: z.array(schemaItem).min(1, 'O pedido precisa ter pelo menos um item')
});

const schemaStatus = z.object({
  status: z.enum(['RECEBIDO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'])
});

interface ItemPedido {
  produtoId: number;
  quantidade: number;
}

// dados do usuario logado vindos do token
interface UsuarioLogado {
  id: number;
  perfil: string;
}

//verficar estoques de produtos
async function verificarEstoque(unidadeId: number, itens: ItemPedido[]) {
  for (const item of itens) {
    const estoque = await estoqueRepository.buscarPorUnidadeProduto(unidadeId, item.produtoId);
    const disponivel = estoque?.quantidade ?? 0;

    if (disponivel < item.quantidade) {
      throw new AppError(
        409,
        'ESTOQUE_INSUFICIENTE',
        'Não há quantidade suficiente para um ou mais itens',
        [{ field: `produtoId ${item.produtoId}`, issue: `Disponível: ${disponivel}` }]
      );
    }
  }
}

async function calcularTotal(itens: ItemPedido[]) {
  let total = 0;
  const itensComPreco = [];

  for (const item of itens) {
    const produto = await produtoRepository.buscarPorId(item.produtoId);

    if (!produto) {
      throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', `Produto ${item.produtoId} não encontrado`);
    }

    const precoUnitario = Number(produto.preco);
    total += precoUnitario * item.quantidade;

    itensComPreco.push({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario
    });
  }

  return { total, itensComPreco };
}

// regra de transicao de status em switch/case simples
// nao pode voltar status e nao pode cancelar pedido pronto / entregue
function transicaoValida(atual: StatusPedido, novo: StatusPedido): boolean {
  switch (atual) {
    case 'RECEBIDO':
      return novo === 'EM_PREPARO' || novo === 'CANCELADO';
    case 'EM_PREPARO':
      return novo === 'PRONTO' || novo === 'CANCELADO';
    case 'PRONTO':
      return novo === 'ENTREGUE';
    case 'ENTREGUE':
      return false;
    case 'CANCELADO':
      return false;
    default:
      return false;
  }
}

export async function criarPedido(body: unknown, usuario: UsuarioLogado) {
  const dados = schemaCriar.parse(body);

  const unidade = await unidadeRepository.buscarPorId(dados.unidadeId);
  if (!unidade) {
    throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada');
  }

  // calcula o total com base no   preco atual dos produtos (404 se algum produto nao existir)
  const { total, itensComPreco } = await calcularTotal(dados.itens);

  // verifica estoque antes de criar o pedido (409 se faltar)
  await verificarEstoque(dados.unidadeId, dados.itens);

  console.log('total calculado do pedido:', total);

  // cliente so cria pedido pra si mesmo ./ atendente pode lancar pra outro cliente
  const ehStaff = usuario.perfil === 'ATENDENTE' || usuario.perfil === 'GERENTE';
  const clienteId = ehStaff ? (dados.clienteId ?? usuario.id) : usuario.id;

  const pedido = await pedidoRepository.criar({
    clienteId,
    unidadeId: dados.unidadeId,
    canalPedido: dados.canalPedido as CanalPedido,
    total,
    itens: itensComPreco
  });

  // da baixa no estoque de cada item depois que o pedido foi criado
  for (const item of itensComPreco) {
    await estoqueRepository.movimentar(
      dados.unidadeId,
      item.produtoId,
      'SAIDA',
      item.quantidade,
      `Pedido #${pedido.id}`
    );
  }

  await pedidoRepository.registrarLog(
    usuario.id,
    'CRIACAO_PEDIDO',
    pedido.id,
    `Pedido criado pelo canal ${dados.canalPedido} no valor de ${total}`
  );

  return pedidoRepository.buscarPorId(pedido.id);
}

export async function listarPedidos(
  canalPedido: string | undefined,
  status: string | undefined,
  page: number,
  limit: number,
  usuario: UsuarioLogado
) {
  // cliente so lista os proprios pedidos; staff ve todos
  const clienteId = usuario.perfil === 'CLIENTE' ? usuario.id : undefined;

  const { pedidos, total } = await pedidoRepository.buscarTodos(
    {
      canalPedido: canalPedido as CanalPedido | undefined,
      status: status as StatusPedido | undefined,
      clienteId
    },
    page,
    limit
  );

  const totalPages = Math.ceil(total / limit);

  return {
    data: pedidos,
    page,
    limit,
    total,
    totalPages
  };
}

export async function buscarPedido(id: number, usuario: UsuarioLogado) {
  const pedido = await pedidoRepository.buscarPorId(id);

  if (!pedido) {
    throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  }

  // cliente nao pode ver pedido de outro cliente
  if (usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Você não tem permissão para acessar este pedido');
  }

  return pedido;
}

export async function atualizarStatus(id: number, body: unknown, usuarioId: number) {
  const pedido = await pedidoRepository.buscarPorId(id);

  if (!pedido) {
    throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  }

  const dados = schemaStatus.parse(body);
  const novoStatus = dados.status as StatusPedido;

  if (!transicaoValida(pedido.status, novoStatus)) {
    throw new AppError(
      409,
      'TRANSICAO_INVALIDA',
      `Não é possível mudar o status de ${pedido.status} para ${novoStatus}`
    );
  }

  const atualizado = await pedidoRepository.atualizarStatus(id, novoStatus);

  // registra a mudanca de status na auditoria
  await pedidoRepository.registrarLog(
    usuarioId,
    'MUDANCA_STATUS',
    id,
    `Status alterado de ${pedido.status} para ${novoStatus}`
  );

  return atualizado;
}

export async function cancelarPedido(id: number, usuario: UsuarioLogado) {
  const pedido = await pedidoRepository.buscarPorId(id);

  if (!pedido) {
    throw new AppError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  }

  // cliente so cancela o proprio pedido; gerente pode cancelar qualquer um
  if (usuario.perfil === 'CLIENTE' && pedido.clienteId !== usuario.id) {
    throw new AppError(403, 'SEM_PERMISSAO', 'Você não tem permissão para cancelar este pedido');
  }

  // so da pra cancelar pedido que ainda nao ficou pronto/entregue
  if (pedido.status !== 'RECEBIDO' && pedido.status !== 'EM_PREPARO') {
    throw new AppError(
      409,
      'PEDIDO_NAO_CANCELAVEL',
      `Pedido com status ${pedido.status} não pode ser cancelado`
    );
  }

  const cancelado = await pedidoRepository.atualizarStatus(id, 'CANCELADO');

  await pedidoRepository.registrarLog(
    usuario.id,
    'CANCELAMENTO_PEDIDO',
    id,
    `Pedido cancelado (status anterior: ${pedido.status})`
  );

  return cancelado;
}
