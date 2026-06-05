import { z } from 'zod';
import prisma from '../utils/database';
import { hashSenha, compararSenha } from '../utils/senha';
import { gerarToken } from '../utils/token';
import { AppError } from '../utils/erros';

const schemaLogin = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória')
});

const schemaRegistro = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  aceitaFidelidade: z.boolean().optional().default(false)
});

export async function login(body: unknown) {
  const dados = schemaLogin.parse(body);

  const usuario = await prisma.usuario.findUnique({
    where: { email: dados.email }
  });

  // retorna o mesmo erro nos dois casos ( segurança)
  if (!usuario || !usuario.ativo) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos');
  }

  const senhaCorreta = await compararSenha(dados.senha, usuario.senha);
  if (!senhaCorreta) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos');
  }

  const token = gerarToken({
    id: usuario.id,
    email: usuario.email,
    perfil: usuario.perfil
  });

  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: '24h',
    user: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    }
  };
}

export async function registro(body: unknown) {
  const dados = schemaRegistro.parse(body);

  const emailExistente = await prisma.usuario.findUnique({
    where: { email: dados.email }
  });

  if (emailExistente) {
    throw new AppError(409, 'EMAIL_JA_CADASTRADO', 'Este e-mail já está em uso');
  }

  const senhaHash = await hashSenha(dados.senha);

  const novoUsuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      perfil: 'CLIENTE',
      aceitaFidelidade: dados.aceitaFidelidade
    }
  });

  // sem a senha no retorno
  return {
    id: novoUsuario.id,
    nome: novoUsuario.nome,
    email: novoUsuario.email,
    perfil: novoUsuario.perfil,
    aceitaFidelidade: novoUsuario.aceitaFidelidade,
    criadoEm: novoUsuario.criadoEm
  };
}

export async function perfil(usuarioId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado');
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    aceitaFidelidade: usuario.aceitaFidelidade,
    criadoEm: usuario.criadoEm
  };
}
