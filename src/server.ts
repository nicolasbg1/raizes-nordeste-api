import express from 'express';
import dotenv from 'dotenv';


dotenv.config();

// monta a string de conexao com o banco a partir das variaveis separadas
const { DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME } = process.env;
process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Aplicação rodando... ', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
