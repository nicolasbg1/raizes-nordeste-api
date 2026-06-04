// SEED de informações

import { PrismaClient, PerfilUsuario } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;
const connectionString = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed...');


  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@raizesnordeste.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@raizesnordeste.com',
      senha: senhaAdmin,
      perfil: PerfilUsuario.ADMIN,
    },
  });
  console.log('Admin criado:', admin.email);

  const senhaGerente = await bcrypt.hash('gerente123', 10);
  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@raizesnordeste.com' },
    update: {},
    create: {
      nome: 'Carlos Gerente',
      email: 'gerente@raizesnordeste.com',
      senha: senhaGerente,
      perfil: PerfilUsuario.GERENTE,
    },
  });
  console.log('Gerente criado:', gerente.email);

  const senhaCliente = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      nome: 'Maria Silva',
      email: 'cliente@teste.com',
      senha: senhaCliente,
      perfil: PerfilUsuario.CLIENTE,
      aceitaFidelidade: true,
    },
  });
  console.log('Cliente criado:', cliente.email);


  const unidadeCentro = await prisma.unidade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Raizes do Nordeste - Centro',
      endereco: 'Rua Floriano Peixoto, 100',
      cidade: 'Fortaleza',
    },
  });
  console.log('Unidade criada:', unidadeCentro.nome);

  const unidadeAldeota = await prisma.unidade.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Raizes do Nordeste - Aldeota',
      endereco: 'Av. Santos Dumont, 540',
      cidade: 'Fortaleza',
    },
  });
  console.log('yUnidade criada:', unidadeAldeota.nome);


  const produtos = [
    { nome: 'Baião de Dois', descricao: 'Arroz com feijão verde, queijo coalho e carne seca', preco: 32.90, categoria: 'Prato Principal' },
    { nome: 'Carne de Sol na Chapa', descricao: 'Carne de sol grelhada com manteiga de garrafa', preco: 42.50, categoria: 'Prato Principal' },
    { nome: 'Tapioca Nordestina', descricao: 'Tapioca recheada com carne seca e queijo', preco: 18.00, categoria: 'Lanche' },
    { nome: 'Suco de Cajá', descricao: 'Suco natural de cajá 500ml', preco: 9.90, categoria: 'Bebida' },
    { nome: 'Pudim de Leite', descricao: 'Pudim de leite condensado com calda de caramelo', preco: 12.00, categoria: 'Sobremesa' },
  ];

  const produtosCriados = [];
  for (const p of produtos) {
    const existe = await prisma.produto.findFirst({ where: { nome: p.nome } });
    if (existe) {
      produtosCriados.push(existe);
      continue;
    }
    const produto = await prisma.produto.create({ data: p });
    produtosCriados.push(produto);
    console.log('Produto criado:', produto.nome);
  }


  for (const unidade of [unidadeCentro, unidadeAldeota]) {
    for (const produto of produtosCriados) {
      await prisma.cardapioUnidade.upsert({
        where: { unidadeId_produtoId: { unidadeId: unidade.id, produtoId: produto.id } },
        update: {},
        create: { unidadeId: unidade.id, produtoId: produto.id, disponivel: true },
      });

      await prisma.estoqueUnidade.upsert({
        where: { unidadeId_produtoId: { unidadeId: unidade.id, produtoId: produto.id } },
        update: {},
        create: { unidadeId: unidade.id, produtoId: produto.id, quantidade: 50 },
      });
    }
  }

  console.log('Cardapiio e estoque configurados para as 2 unidades');
  console.log('Seed finalizado!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
