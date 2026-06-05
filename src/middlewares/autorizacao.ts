import { Request, Response, NextFunction } from 'express';
import { criarErro } from '../utils/erros';

// uso: autorizarPerfil(['ADMIN', 'GERENTE'])
export function autorizarPerfil(perfisPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario;

    if (!usuario) {
      return res.status(401).json(
        criarErro('NAO_AUTENTICADO', 'Usuário não autenticado', req.originalUrl)
      );
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
      return res.status(403).json(
        criarErro('SEM_PERMISSAO', 'Você não tem permissão para acessar este recurso', req.originalUrl)
      );
    }

    next();
  };
}
