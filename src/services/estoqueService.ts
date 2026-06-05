import { z } from 'zod';
import * as estoqueRepository from '../repositories/estoqueRepository';
import * as unidadeRepository from '../repositories/unidadeRepository';
import * as produtoRepository from '../repositories/produtoRepository';
import { AppError } from '../utils/erros';

const schemaMovimentar = z.object({
  unidadeId: z.number().int().positive(),
  produtoId: z.number().int().positive(),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.number().int().positive('Quantidade deve ser maior que zero'),
  motivo: z.string().optional()
});

export async function consultarEstoque(unidadeId: number) {
  const unidade = await unidadeRepository.buscarPorId(unidadeId);

  if (!unidade) {
    throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada');
  }

  const itens = await estoqueRepository.buscarPorUnidade(unidadeId);

  return {
    unidadeId,
    unidade: unidade.nome,
    itens
  };
}

export async function movimentarEstoque(body: unknown) {
  const dados = schemaMovimentar.parse(body);


  const produto = await produtoRepository.buscarPorId(dados.produtoId);
  if (!produto) {
    throw new AppError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
  }


  const unidade = await unidadeRepository.buscarPorId(dados.unidadeId);
  if (!unidade) {
    throw new AppError(404, 'UNIDADE_NAO_ENCONTRADA', 'Unidade não encontrada');
  }

  if (dados.tipo === 'SAIDA') {
    const estoqueAtual = await estoqueRepository.buscarPorUnidadeProduto(
      dados.unidadeId,
      dados.produtoId
    );

    const qtdAtual = estoqueAtual?.quantidade ?? 0;

    if (qtdAtual < dados.quantidade) {
      throw new AppError(409, 'ESTOQUE_INSUFICIENTE', 'Quantidade insuficiente em estoque', [
        { field: 'quantidade', issue: `Disponível: ${qtdAtual}` }
      ]);
    }
  }


  return estoqueRepository.movimentar(
    dados.unidadeId,
    dados.produtoId,
    dados.tipo,
    dados.quantidade,
    dados.motivo
  );
}
