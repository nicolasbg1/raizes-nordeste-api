import { Router } from 'express';
import * as unidadeController from '../controllers/unidadeController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasUnidade = Router();

/**
 * @openapi
 * tags:
 *   - name: Unidades
 *     description: unidades da rede e cardapio
 */

/**
 * @openapi
 * /unidades:
 *   get:
 *     summary: lista todas as unidades (publico)
 *     tags: [Unidades]
 *     responses:
 *       200:
 *         description: lista de unidades
 */
rotasUnidade.get('/', unidadeController.listar);

/**
 * @openapi
 * /unidades/{id}:
 *   get:
 *     summary: detalhes de uma unidade
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: dados da unidade
 *       404:
 *         description: unidade nao encontrada
 */
rotasUnidade.get('/:id', unidadeController.buscar);

/**
 * @openapi
 * /unidades/{id}/cardapio:
 *   get:
 *     summary: cardapio da unidade (publico)
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: itens do cardapio
 */
rotasUnidade.get('/:id/cardapio', unidadeController.cardapio);

/**
 * @openapi
 * /unidades:
 *   post:
 *     summary: cria unidade (so admin e gerente)
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               endereco: { type: string }
 *               cidade: { type: string }
 *     responses:
 *       201:
 *         description: unidade criada
 *       403:
 *         description: sem permissao
 */
rotasUnidade.post('/', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), unidadeController.criar);

export default rotasUnidade;
