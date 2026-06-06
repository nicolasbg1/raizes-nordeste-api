import { Request, Response, NextFunction } from 'express';
import * as pedidoService from '../services/pedidoService';

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = (req as any).usuario;
    const pedido = await pedidoService.criarPedido(req.body, usuario);
    return res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const canalPedido = req.query.canalPedido as string | undefined;
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const usuario = (req as any).usuario;

    const resultado = await pedidoService.listarPedidos(canalPedido, status, page, limit, usuario);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const usuario = (req as any).usuario;
    const pedido = await pedidoService.buscarPedido(id, usuario);
    return res.status(200).json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function atualizarStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const usuario = (req as any).usuario;
    const pedido = await pedidoService.atualizarStatus(id, req.body, usuario.id);
    return res.status(200).json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function cancelar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const usuario = (req as any).usuario;
    const pedido = await pedidoService.cancelarPedido(id, usuario);
    return res.status(200).json(pedido);
  } catch (err) {
    next(err);
  }
}
