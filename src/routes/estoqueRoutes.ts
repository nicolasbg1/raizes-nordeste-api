import { Router } from 'express';
import * as estoqueController from '../controllers/estoqueController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasEstoque = Router();

/**
 * @openapi
 * tags:
 *   - name: Estoque
 *     description: consulta e movimentacao de estoque
 */

/**
 * @openapi
 * /estoque/{unidadeId}:
 *   get:
 *     summary: consulta o estoque da unidade
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: itens em estoque
 *       403:
 *         description: sem permissao
 */
rotasEstoque.get(
  '/:unidadeId',
  autenticar,
  autorizarPerfil(['ADMIN', 'GERENTE', 'ATENDENTE']),
  estoqueController.consultar
);

/**
 * @openapi
 * /estoque/movimentar:
 *   post:
 *     summary: entrada ou saida de estoque (admin/gerente)
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unidadeId: { type: integer }
 *               produtoId: { type: integer }
 *               tipo: { type: string, example: ENTRADA }
 *               quantidade: { type: integer }
 *               motivo: { type: string }
 *     responses:
 *       200:
 *         description: movimentacao registrada
 *       409:
 *         description: estoque insuficiente na saida
 */
rotasEstoque.post(
  '/movimentar',
  autenticar,
  autorizarPerfil(['ADMIN', 'GERENTE']),
  estoqueController.movimentar
);

export default rotasEstoque;
