import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { rotasAuth, rotasUnidade, rotasProduto, rotasEstoque, rotasPedido, rotasPagamento, rotasFidelidade } from './routes';
import { erroGlobal } from './middlewares';
import { especificacaoSwagger } from './docs/swagger';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Aplicação rodando... ', version: '1.0.0' });
});

// documentacao da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(especificacaoSwagger));

app.use('/auth', rotasAuth);
app.use('/unidades', rotasUnidade);
app.use('/produtos', rotasProduto);
app.use('/estoque', rotasEstoque);
app.use('/pedidos', rotasPedido);
app.use('/pagamentos', rotasPagamento);

app.use('/fidelidade', rotasFidelidade);


// tratamento de erros / final das rotas
app.use(erroGlobal);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
