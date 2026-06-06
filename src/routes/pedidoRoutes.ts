import { Router } from 'express';
import * as pedidoController from '../controllers/pedidoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasPedido = Router();

// criar pedido,. cliente faz o proprio, atendente faz pelo balcao
rotasPedido.post(
  '/',
  autenticar,
  autorizarPerfil(['CLIENTE', 'ATENDENTE']),
  pedidoController.criar
);

// listar e consultar / precisa esta autenticado
rotasPedido.get('/', autenticar, pedidoController.listar);
rotasPedido.get('/:id', autenticar, pedidoController.buscar);

// mudanca de status / cozinha, atendente e gerente
rotasPedido.patch(
  '/:id/status',
  autenticar,
  autorizarPerfil(['COZINHA', 'ATENDENTE', 'GERENTE']),
  pedidoController.atualizarStatus
);

// cancelar pedido / cliente ou gerente
rotasPedido.delete(
  '/:id',
  autenticar,
  autorizarPerfil(['CLIENTE', 'GERENTE']),
  pedidoController.cancelar
);

export default rotasPedido;
