import { z } from 'zod';
import * as produtoRepository from '../repositories/produtoRepository';
import { AppError } from '../utils/erros';

const schemaCriar = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  preco: z.number().positive('Preço deve ser maior que zero'),
  categoria: z.string().min(2, 'Categoria inválida')
});

const schemaEditar = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  preco: z.number().positive().optional(),
  categoria: z.string().min(2).optional(),
  ativo: z.boolean().optional()
});

export async function listarProdutos(page: number, limit: number) {
  const { produtos, total } = await produtoRepository.buscarTodos(page, limit);

  const totalPages = Math.ceil(total / limit);

  return {
    data: produtos,
    page,
    limit,
    total,
    totalPages
  };
}

export async function buscarProduto(id: number) {
  const produto = await produtoRepository.buscarPorId(id);

  if (!produto) {
    throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
  }

  return produto;
}

export async function criarProduto(body: unknown) {
  const dados = schemaCriar.parse(body);
  return produtoRepository.criar(dados);
}

export async function editarProduto(id: number, body: unknown) {
  const produto = await produtoRepository.buscarPorId(id);

  if (!produto) {
    throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
  }

  const dados = schemaEditar.parse(body);
  return produtoRepository.atualizar(id, dados);
}
