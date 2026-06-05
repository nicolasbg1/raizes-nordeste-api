import { Request, Response, NextFunction } from 'express';
import * as unidadeService from '../services/unidadeService';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const unidades = await unidadeService.listarUnidades();
    return res.status(200).json(unidades);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const unidade = await unidadeService.buscarUnidade(id);
    return res.status(200).json(unidade);
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const novaUnidade = await unidadeService.criarUnidade(req.body);
    return res.status(201).json(novaUnidade);
  } catch (err) {
    next(err);
  }
}

export async function cardapio(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const resultado = await unidadeService.buscarCardapioUnidade(id);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}
