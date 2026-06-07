//simulacao do gateway de pagamento externo / mock

import { StatusPagamento } from '@prisma/client';

export interface RetornoMock {
  transacaoId: string;
  status: StatusPagamento;
  valor: number;
  formaPagamento: string;
  processadoEm: string;
}

// regra de teste / pedido ate R$500 aprova e acima disso recusa
const LIMITE_APROVACAO = 500;

function esperar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processarPagamentoMock(
  valor: number,
  formaPagamento: string
): Promise<RetornoMock> {
  // aqui seria a chamada real pro gateway como por exemplo a abacatepay, stripe etc 
  //simula tempo de redee
  const delay = 1000 + Math.floor(Math.random() * 1000);
  await esperar(delay);

  const status: StatusPagamento = valor <= LIMITE_APROVACAO ? 'APROVADO' : 'RECUSADO';

  return {
    transacaoId: `mock-${Date.now()}`,
    status,
    valor,
    formaPagamento,
    processadoEm: new Date().toISOString()
  };
}
