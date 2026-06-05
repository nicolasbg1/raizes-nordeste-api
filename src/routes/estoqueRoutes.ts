import { Router } from 'express';
import * as estoqueController from '../controllers/estoqueController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasEstoque = Router();

// consulta de estoque admin, gerente e atendente podem ver
rotasEstoque.get(
  '/:unidadeId',
  autenticar,
  autorizarPerfil(['ADMIN', 'GERENTE', 'ATENDENTE']),
  estoqueController.consultar
);

// movimentar estoque ; so admin e gerente
rotasEstoque.post(
  '/movimentar',
  autenticar,
  autorizarPerfil(['ADMIN', 'GERENTE']),
  estoqueController.movimentar
);

export default rotasEstoque;
