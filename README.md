# Raizes do Nordeste API

API back-end para a rede de lanchonetes Raizes do Nordeste.

## Requisitos

- Node.js 20+
- Docker
- npm

## Como rodar

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

3. Preencha o `.env` com suas informações (usuário, senha e nome do banco).

Para gerar um JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

4. Suba o banco com Docker:
```bash
docker-compose up -d
```

5. Rode a API:
```bash
npm run dev
```

A API vai rodar em `http://localhost:3000`
