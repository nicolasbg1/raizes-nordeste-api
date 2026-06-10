import { Router } from 'express';
import * as fidelidadeController from '../controllers/fidelidadeController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasFidelidade = Router();

/**
 * @openapi
 * tags:
 *   - name: Fidelidade
 *     description: programa de pontos do cliente
 */

/**
 * @openapi
 * /fidelidade/saldo:
 *   get:
 *     summary: saldo de pontos do cliente logado
 *     tags: [Fidelidade]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: saldo de pontos
 */
rotasFidelidade.get('/saldo', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.saldo);

/**
 * @openapi
 * /fidelidade/historico:
 *   get:
 *     summary: historico de pontos (acumulo e resgate)
 *     tags: [Fidelidade]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: lista de movimentacoes
 */
rotasFidelidade.get('/historico', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.historico);

/**
 * @openapi
 * /fidelidade/resgatar:
 *   post:
 *     summary: resgata pontos por desconto
 *     description: resgate em multiplos de 100 pontos, cada 100 = R$10 de desconto. O desconto so fica registrado, nao aplica sozinho no pedido.
 *     tags: [Fidelidade]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pontos: { type: integer, example: 100 }
 *     responses:
 *       200:
 *         description: resgate feito
 *       409:
 *         description: pontos insuficientes
 *       422:
 *         description: quantidade nao é multiplo de 100
 */
rotasFidelidade.post('/resgatar', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.resgatar);

export default rotasFidelidade;
