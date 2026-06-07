import prisma from '../utils/database';
import { StatusPagamento } from '@prisma/client';

export async function buscarPorPedido(pedidoId: number) {
  return prisma.pagamento.findUnique({ where: { pedidoId } });
}

interface DadosPagamento {
  pedidoId: number;
  status: StatusPagamento;
  valor: number;
  formaPagamento: string;
  transacaoId: string;
  processadoEm: Date;
}

// grava o retorno do gateway / usa upsert pra deixar tentar pagar de novo no mesmo pedido
export async function salvar(dados: DadosPagamento) {
  return prisma.pagamento.upsert({
    where: { pedidoId: dados.pedidoId },
    update: {
      status: dados.status,
      valor: dados.valor,
      formaPagamento: dados.formaPagamento,
      transacaoId: dados.transacaoId,
      processadoEm: dados.processadoEm
    },
    create: {
      pedidoId: dados.pedidoId,
      status: dados.status,
      valor: dados.valor,
      formaPagamento: dados.formaPagamento,
      transacaoId: dados.transacaoId,
      processadoEm: dados.processadoEm
    }
  });
}
