import { Request, Response, NextFunction } from 'express';
import * as estoqueService from '../services/estoqueService';

export async function consultar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidadeId = parseInt(req.params.unidadeId as string);
    const resultado = await estoqueService.consultarEstoque(unidadeId);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}



export async function movimentar(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await estoqueService.movimentarEstoque(req.body);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}
