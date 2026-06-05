import { Request, Response, NextFunction } from 'express';
import * as produtoService from '../services/produtoService';

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    // seem validacao de query params so pega os valores

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const resultado = await produtoService.listarProdutos(page, limit);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function buscar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const produto = await produtoService.buscarProduto(id);
    return res.status(200).json(produto);
  } catch (err) {
    next(err);
  }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const novoProduto = await produtoService.criarProduto(req.body);
    return res.status(201).json(novoProduto);
  } catch (err) {
    next(err);
  }
}

export async function editar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const produtoAtualizado = await produtoService.editarProduto(id, req.body);
    return res.status(200).json(produtoAtualizado);
  } catch (err) {
    next(err);
  }
}
