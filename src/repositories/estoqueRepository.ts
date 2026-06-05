import prisma from '../utils/database';
import { TipoMovimentacao } from '@prisma/client';

// retorna o estoque completo de uma unidade
export async function buscarPorUnidade(unidadeId: number) {
  return prisma.estoqueUnidade.findMany({
    where: { unidadeId },
    include: {
      produto: {
        select: { id: true, nome: true, categoria: true, preco: true }
      }
    }
  });
}

export async function buscarPorUnidadeProduto(unidadeId: number, produtoId: number) {
  return prisma.estoqueUnidade.findUnique({
    where: {
      unidadeId_produtoId: { unidadeId, produtoId }
    }
  });
}

// registra a movimentacao e atualiza a quantidade em estoque
export async function movimentar(
  unidadeId: number,
  produtoId: number,
  tipo: TipoMovimentacao,
  quantidade: number,
  motivo?: string
) {
  // verifica se ja existe registro de estoque pra esse produto/unidade
  const estoqueExistente = await buscarPorUnidadeProduto(unidadeId, produtoId);

  const novaQtd = tipo === 'ENTRADA'
    ? (estoqueExistente?.quantidade ?? 0) + quantidade
    : (estoqueExistente?.quantidade ?? 0) - quantidade;

  // cria // atualiza o registro de estoque
  const estoque = await prisma.estoqueUnidade.upsert({
    where: {
      unidadeId_produtoId: { unidadeId, produtoId }
    },
    update: { quantidade: novaQtd },
    create: { unidadeId, produtoId, quantidade: novaQtd }
  });

  // registra a movimentacao para historico
  await prisma.movimentacaoEstoque.create({
    data: {
      estoqueId: estoque.id,
      tipo,
      quantidade,
      motivo
    }
  });

  return estoque;
}
