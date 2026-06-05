import prisma from '../utils/database';

export async function buscarTodos(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    skip,
    take: limit,
    orderBy: { nome: 'asc' }
  });

  const total = await prisma.produto.count({ where: { ativo: true } });

  return { produtos, total };
}

export async function buscarPorId(id: number) {
  return prisma.produto.findUnique({ where: { id } });
}

export async function criar(dados: {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
}) {
  return prisma.produto.create({ data: dados });
}

export async function atualizar(id: number, dados: {
  nome?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  ativo?: boolean;
}) {
  return prisma.produto.update({ where: { id }, data: dados });
}
