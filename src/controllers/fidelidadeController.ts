import { Request, Response, NextFunction } from 'express';
import * as fidelidadeService from '../services/fidelidadeService';

export async function saldo(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = (req as any).usuario;
    const resultado = await fidelidadeService.consultarSaldo(usuario.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function historico(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = (req as any).usuario;
    const resultado = await fidelidadeService.consultarHistorico(usuario.id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function resgatar(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = (req as any).usuario;
    const resultado = await fidelidadeService.resgatarPontos(usuario.id, req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}
