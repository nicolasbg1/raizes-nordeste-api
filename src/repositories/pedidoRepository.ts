import prisma from '../utils/database';
import { CanalPedido, StatusPedido } from '@prisma/client';

interface ItemNovoPedido {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

interface DadosNovoPedido {
  clienteId: number;
  unidadeId: number;
  canalPedido: CanalPedido;
  total: number;
  itens: ItemNovoPedido[];
}

// cria o pedido junto com os itens
export async function criar(dados: DadosNovoPedido) {
  return prisma.pedido.create({
    data: {
      clienteId: dados.clienteId,
      unidadeId: dados.unidadeId,
      canalPedido: dados.canalPedido,
      total: dados.total,
      itens: {
        create: dados.itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario
        }))
      }
    },
    include: { itens: true }
  });
}

export async function buscarPorId(id: number) {
  return prisma.pedido.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          produto: { select: { id: true, nome: true, categoria: true } }
        }
      },
      pagamento: true,
      cliente: { select: { id: true, nome: true, email: true } },
      unidade: { select: { id: true, nome: true, cidade: true } }
    }
  });
}

interface FiltrosPedido {
  canalPedido?: CanalPedido;
  status?: StatusPedido;
  clienteId?: number;
}

export async function buscarTodos(filtros: FiltrosPedido, page: number, limit: number) {
  const skip = (page - 1) * limit;

  // monta o where dinamicamente conforme os filtros estabkelecidos
  const where: FiltrosPedido = {};
  if (filtros.canalPedido) where.canalPedido = filtros.canalPedido;
  if (filtros.status) where.status = filtros.status;
  // cliente so enxerga os proprios pedidos
  if (filtros.clienteId) where.clienteId = filtros.clienteId;

  const pedidos = await prisma.pedido.findMany({
    where,
    skip,
    take: limit,
    orderBy: { criadoEm: 'desc' },
    include: {
      itens: true,
      cliente: { select: { id: true, nome: true } }
    }
  });

  const total = await prisma.pedido.count({ where });

  return { pedidos, total };
}

export async function atualizarStatus(id: number, status: StatusPedido) {
  return prisma.pedido.update({
    where: { id },
    data: { status }
  });
}

// registra acoes sensiveis do pedido na tabela de auditoria
export async function registrarLog(
  usuarioId: number,
  acao: string,
  entidadeId: number,
  detalhes: string
) {
  return prisma.logAuditoria.create({
    data: {
      usuarioId,
      acao,
      entidade: 'Pedido',
      entidadeId,
      detalhes
    }
  });
}
