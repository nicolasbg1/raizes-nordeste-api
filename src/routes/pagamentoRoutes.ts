import { Router } from 'express';
import * as pagamentoController from '../controllers/pagamentoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasPagamento = Router();

/**
 * @openapi
 * tags:
 *   - name: Pagamentos
 *     description: pagamento mock (simulado) dos pedidos
 */

/**
 * @openapi
 * /pagamentos/{pedidoId}:
 *   post:
 *     summary: processa o pagamento mock do pedido
 *     description: ate R$500 aprova, acima recusa (regra so p/ facilitar os testes). Quando aprova o pedido vai p/ EM_PREPARO.
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formaPagamento: { type: string, example: MOCK }
 *     responses:
 *       200:
 *         description: retorno do pagamento (APROVADO ou RECUSADO)
 *       409:
 *         description: pedido nao esta como RECEBIDO
 */
rotasPagamento.post(
  '/:pedidoId',
  autenticar,
  autorizarPerfil(['CLIENTE', 'ATENDENTE', 'GERENTE']),
  pagamentoController.processar
);

/**
 * @openapi
 * /pagamentos/{pedidoId}:
 *   get:
 *     summary: consulta o pagamento do pedido
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: dados do pagamento
 *       404:
 *         description: pagamento nao encontrado
 */
rotasPagamento.get('/:pedidoId', autenticar, pagamentoController.consultar);

export default rotasPagamento;
