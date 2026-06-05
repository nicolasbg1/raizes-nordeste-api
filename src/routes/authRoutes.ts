import { Router } from 'express';
import * as authController from '../controllers/authController';
import { autenticar } from '../middlewares/autenticacao';

const rotasAuth = Router();

rotasAuth.post('/login', authController.login);
rotasAuth.post('/registro', authController.registro);
rotasAuth.get('/perfil', autenticar, authController.perfil);

export default rotasAuth;
