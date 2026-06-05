import { Router } from 'express';
import * as produtoController from '../controllers/produtoController';
import { autenticar } from '../middlewares/autenticacao';
import { autorizarPerfil } from '../middlewares/autorizacao';

const rotasProduto = Router();

// consulta publica
rotasProduto.get('/', produtoController.listar);
rotasProduto.get('/:id', produtoController.buscar);

// criar e editar exigem autenticacao e perfil admin/gerente
rotasProduto.post('/', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), produtoController.criar);
rotasProduto.put('/:id', autenticar, autorizarPerfil(['ADMIN', 'GERENTE']), produtoController.editar);

export default rotasProduto;
