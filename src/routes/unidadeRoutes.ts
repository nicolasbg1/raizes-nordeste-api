import { Router } from 'express';
import * as unidadeController from '../controllers/unidadeController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasUnidade = Router();

// rotas publicas
rotasUnidade.get('/', unidadeController.listar);
rotasUnidade.get('/:id', unidadeController.buscar);
rotasUnidade.get('/:id/cardapio', unidadeController.cardapio);

// apenas admin e gerente podem criar unidades
rotasUnidade.post('/', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), unidadeController.criar);

export default rotasUnidade;
