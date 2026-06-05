import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { criarErro, AppError } from '../utils/erros';

//captura de erros global
export function erroGlobal(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const details = err.issues.map(e => ({
      field: e.path.join('.'),
      issue: e.message
    }));
    return res.status(422).json(
      criarErro('DADOS_INVALIDOS', 'Os dados enviados são inválidos', req.path, details)
    );
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      criarErro(err.errorCode, err.message, req.path, err.details)
    );
  }

  if (err.name === 'SyntaxError') {
    return res.status(400).json(
      criarErro('JSON_INVALIDO', 'O corpo da requisição contém JSON inválido', req.path)
    );
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json(
    criarErro('ERRO_INTERNO', 'Erro interno do servidor', req.path)
  );
}
