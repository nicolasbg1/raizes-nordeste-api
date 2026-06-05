import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao_dev_nao_usar_em_producao';
const JWT_EXPIRA_EM = process.env.JWT_EXPIRA_EM || '24h';

export interface PayloadToken {
  id: number;
  email: string;
  perfil: string;
}

// gera o token pro usuario logado
export function gerarToken(payload: PayloadToken): string {
  const opcoes: any = { expiresIn: JWT_EXPIRA_EM };
  return jwt.sign(payload, JWT_SECRET, opcoes);
}

// retorna null se o token for invalido./expirado
export function verificarToken(token: string): PayloadToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PayloadToken;
    return decoded;
  } catch (err) {
    return null;
  }
}
