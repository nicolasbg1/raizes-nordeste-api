import prisma from '../utils/database';

// busca todas as unidades ativas
export async function buscarTodas() {
  return prisma.unidade.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' }
  });
}

export async function buscarPorId(id: number) {
  return prisma.unidade.findUnique({
    where: { id }
  });
}

export async function criar(dados: { nome: string; endereco: string; cidade: string }) {
  return prisma.unidade.create({ data: dados });
}

// busca o cardapio da unidade com os produtos disponiveis
export async function buscarCardapio(unidadeId: number) {
  return prisma.cardapioUnidade.findMany({
    where: {
      unidadeId,
      disponivel: true
    },
    include: {
      produto: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
          categoria: true
        }
      }
    }
  });
}
