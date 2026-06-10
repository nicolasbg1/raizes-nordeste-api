import { Router } from 'express';
import * as produtoController from '../controllers/produtoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasProduto = Router();

/**
 * @openapi
 * tags:
 *   - name: Produtos
 *     description: produtos do cardapio
 */

/**
 * @openapi
 * /produtos:
 *   get:
 *     summary: lista produtos com paginacao (publico)
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: lista paginada (data, page, limit, total, totalPages)
 */
rotasProduto.get('/', produtoController.listar);

/**
 * @openapi
 * /produtos/{id}:
 *   get:
 *     summary: detalhe do produto
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: dados do produto
 *       404:
 *         description: produto nao encontrado
 */
rotasProduto.get('/:id', produtoController.buscar);

/**
 * @openapi
 * /produtos:
 *   post:
 *     summary: cria produto (admin/gerente)
 *     tags: [Produtos]
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
 *               descricao: { type: string }
 *               preco: { type: number }
 *               categoria: { type: string }
 *     responses:
 *       201:
 *         description: produto criado
 *       403:
 *         description: sem permissao
 */
rotasProduto.post('/', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), produtoController.criar);

/**
 * @openapi
 * /produtos/{id}:
 *   put:
 *     summary: edita produto (admin/gerente)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: produto atualizado
 *       404:
 *         description: produto nao encontrado
 */
rotasProduto.put('/:id', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), produtoController.editar);

export default rotasProduto;
