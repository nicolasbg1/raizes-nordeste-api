import prisma from '../utils/database';

export async function buscarSaldo(clienteId: number) {
  return prisma.pontosCliente.findUnique({ where: { clienteId } });
}

export async function buscarHistorico(clienteId: number) {
  return prisma.historicoPontos.findMany({
    where: { clienteId },
    orderBy: { criadoEm: 'desc' }
  });
}

// soma os pontos no saldo do cliente e grava no historico  /tipo ACUMULO
export async function acumular(clienteId: number, pontos: number, descricao: string) {
  const saldo = await prisma.pontosCliente.upsert({
    where: { clienteId },
    update: { pontos: { increment: pontos } },
    create: { clienteId, pontos }
  });

  await prisma.historicoPontos.create({
    data: { clienteId, pontos, tipo: 'ACUMULO', descricao }
  });

  return saldo;
}

// tira os pontos do saldo e grava no historico / tipo RESGATE
export async function resgatar(clienteId: number, pontos: number, descricao: string) {
  const saldo = await prisma.pontosCliente.update({
    where: { clienteId },
    data: { pontos: { decrement: pontos } }
  });

  await prisma.historicoPontos.create({
    data: { clienteId, pontos, tipo: 'RESGATE', descricao }
  });

  return saldo;
}
