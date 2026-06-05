import { z } from 'zod';
import * as unidadeRepository from '../repositories/unidadeRepository';
import { AppError } from '../utils/erros';

const schemaCriar = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  endereco: z.string().min(5, 'Endereço inválido'),
  cidade: z.string().min(2, 'Cidade inválida')
});

export async function listarUnidades() {
  return unidadeRepository.buscarTodas();
}

export async function buscarUnidade(id: number) {
  const unidade = await unidadeRepository.buscarPorId(id);

  if (!unidade) {
    throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada');
  }

  return unidade;
}

export async function criarUnidade(body: unknown) {
  const dados = schemaCriar.parse(body);
  return unidadeRepository.criar(dados);
}

export async function buscarCardapioUnidade(id: number) {
  // verifica se a unidade existe antes de buscar o cardapio
  const unidade = await unidadeRepository.buscarPorId(id);

  if (!unidade) {
    throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada');
  }

  const itens = await unidadeRepository.buscarCardapio(id);

  return {
    unidadeId: id,
    unidade: unidade.nome,
    itens
  };
}
