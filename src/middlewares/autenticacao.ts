import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/token';
import { criarErro } from '../utils/erros';

//verifica o jwt antes de entrar na rota
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      criarErro('TOKEN_AUSENTE', 'Token de autenticação não fornecido', req.originalUrl)
    );
  }

  const token = authHeader.split(' ')[1];
  const payload = verificarToken(token);

  if (!payload) {
    return res.status(401).json(
      criarErro('TOKEN_INVALIDO', 'Token inválido ou expirado', req.originalUrl)
    );
  }

  // ajuste para n precisar usar interface global
  (req as any).usuario = payload;
  next();
}
