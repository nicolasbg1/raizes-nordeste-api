import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await authService.login(req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function registro(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await authService.registro(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function perfil(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = (req as any).usuario;
    const resultado = await authService.perfil(usuario.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}
