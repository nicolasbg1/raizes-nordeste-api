import { Router } from 'express';
import * as authController from '../controllers/authController';
import { autenticar } from '../middlewares/autenticacao';

const rotasAuth = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: login, cadastro e perfil
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: faz login e devolve o token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: cliente@teste.com }
 *               senha: { type: string, example: cliente123 }
 *     responses:
 *       200:
 *         description: logado, retorna o accessToken
 *       401:
 *         description: email ou senha invalidos
 */
rotasAuth.post('/login', authController.login);

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     summary: cadastro de cliente novo
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *               aceitaFidelidade: { type: boolean, description: consentimento do programa de pontos (LGPD) }
 *     responses:
 *       201:
 *         description: cliente cadastrado
 *       409:
 *         description: email ja cadastrado
 */
rotasAuth.post('/registro', authController.registro);

/**
 * @openapi
 * /auth/perfil:
 *   get:
 *     summary: dados do usuario logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: dados do usuario
 *       401:
 *         description: sem token
 */
rotasAuth.get('/perfil', autenticar, authController.perfil);

export default rotasAuth;
