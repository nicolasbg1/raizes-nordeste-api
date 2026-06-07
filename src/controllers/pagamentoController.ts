import { Request, Response, NextFunction } from 'express';
import * as pagamentoService from '../services/pagamentoService';

export async function processar(req: Request, res: Response, next: NextFunction) {
  try {
    const pedidoId = parseInt(req.params.pedidoId as string);
    const usuario = (req as any).usuario;
    const resultado = await pagamentoService.processarPagamento(pedidoId, req.body, usuario);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function consultar(req: Request, res: Response, next: NextFunction) {
  try {
    const pedidoId = parseInt(req.params.pedidoId as string);
    const usuario = (req as any).usuario;
    const pagamento = await pagamentoService.consultarPagamento(pedidoId, usuario);
    return res.status(200).json(pagamento);
  } catch (err) {
    next(err);
  }
}
