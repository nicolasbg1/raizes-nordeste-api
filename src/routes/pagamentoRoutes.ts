import { Router } from 'express';
import * as pagamentoController from '../controllers/pagamentoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasPagamento = Router();

// processar pagamento mock do pedido / cliente, atendente ou gerente
rotasPagamento.post(
  '/:pedidoId',
  autenticar,
  autorizarPerfil(['CLIENTE', 'ATENDENTE', 'GERENTE']),
  pagamentoController.processar
);

// consultar status do pagamento / a posse e checada la no service
rotasPagamento.get('/:pedidoId', autenticar, pagamentoController.consultar);

export default rotasPagamento;
