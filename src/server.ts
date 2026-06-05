import express from 'express';
import dotenv from 'dotenv';
import { rotasAuth, rotasUnidade, rotasProduto, rotasEstoque } from './routes';
import { erroGlobal } from './middlewares';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Aplicação rodando... ', version: '1.0.0' });
});

app.use('/auth', rotasAuth);
app.use('/unidades', rotasUnidade);
app.use('/produtos', rotasProduto);
app.use('/estoque', rotasEstoque);


// tratamento de erros / final das rotas
app.use(erroGlobal);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
