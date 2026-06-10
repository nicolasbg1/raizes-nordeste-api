import { Router } from 'express';
import * as pedidoController from '../controllers/pedidoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasPedido = Router();

/**
 * @openapi
 * tags:
 *   - name: Pedidos
 *     description: pedidos dos varios canais (app, totem, balcao, etc)
 */

/**
 * @openapi
 * /pedidos:
 *   post:
 *     summary: cria um pedido (cliente ou atendente)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canalPedido: { type: string, example: TOTEM, description: obrigatorio - APP, TOTEM, BALCAO, PICKUP ou WEB }
 *               unidadeId: { type: integer }
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produtoId: { type: integer }
 *                     quantidade: { type: integer }
 *     responses:
 *       201:
 *         description: pedido criado
 *       409:
 *         description: estoque insuficiente
 *       422:
 *         description: canalPedido faltando ou invalido
 */
rotasPedido.post(
  '/',
  autenticar,
  autorizarPerfil(['CLIENTE', 'ATENDENTE']),
  pedidoController.criar
);

/**
 * @openapi
 * /pedidos:
 *   get:
 *     summary: lista pedidos (cliente ve so os dele) com filtros
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: canalPedido
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: lista paginada de pedidos
 */
rotasPedido.get('/', autenticar, pedidoController.listar);

/**
 * @openapi
 * /pedidos/{id}:
 *   get:
 *     summary: detalhe do pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: pedido com os itens
 *       404:
 *         description: pedido nao encontrado
 */
rotasPedido.get('/:id', autenticar, pedidoController.buscar);

/**
 * @openapi
 * /pedidos/{id}/status:
 *   patch:
 *     summary: atualiza o status do pedido (cozinha, atendente, gerente)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, example: EM_PREPARO }
 *     responses:
 *       200:
 *         description: status atualizado
 *       409:
 *         description: transicao de status invalida
 */
rotasPedido.patch(
  '/:id/status',
  autenticar,
  autorizarPerfil(['COZINHA', 'ATENDENTE', 'GERENTE']),
  pedidoController.atualizarStatus
);

/**
 * @openapi
 * /pedidos/{id}:
 *   delete:
 *     summary: cancela pedido (cliente ou gerente)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: pedido cancelado
 *       409:
 *         description: pedido pronto/entregue nao pode cancelar
 */
rotasPedido.delete(
  '/:id',
  autenticar,
  autorizarPerfil(['CLIENTE', 'GERENTE']),
  pedidoController.cancelar
);

export default rotasPedido;
