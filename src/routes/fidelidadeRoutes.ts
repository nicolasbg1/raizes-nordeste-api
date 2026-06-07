import { Router } from 'express';
import * as fidelidadeController from '../controllers/fidelidadeController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasFidelidade = Router();

// todas as rota de fidelidade sao do cliente logado
rotasFidelidade.get('/saldo', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.saldo);
rotasFidelidade.get('/historico', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.historico);
rotasFidelidade.post('/resgatar', autenticar, autorizarPerfil(['CLIENTE']), fidelidadeController.resgatar);

export default rotasFidelidade;
