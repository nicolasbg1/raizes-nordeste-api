# Raizes do Nordeste API

API back-end da rede de lanchonetes Raizes do Nordeste, projeto da faculdade Uninter.

A API gerencia usuarios e perfis de acesso, unidades da rede, produtos e cardapio,
estoque por unidade, pedidos multicanal (APP, TOTEM, BALCAO, PICKUP, WEB), pagamento
simulado e programa de fidelidade.

## Requisitos

- Node.js 20+
- Docker (para subir o banco PostgreSQL)
- npm

## Variaveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

| Variavel | Descricao |
|----------|-----------|
| `DB_USER` | Usuario do banco PostgreSQL |
| `DB_PASS` | Senha do banco |
| `DB_HOST` | Host do banco (localhost no ambiente local) |
| `DB_PORT` | Porta do banco (mapeada no docker-compose) |
| `DB_NAME` | Nome do banco de dados |
| `JWT_SECRET` | Chave secreta usada para assinar os tokens JWT |
| `JWT_EXPIRA_EM` | Tempo de expiracao do token (ex: 24h) |
| `PORT` | Porta em que a API roda |
| `NODE_ENV` | Ambiente de execucao (development / production) |

Para gerar um `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Instalacao

1. Clone o repositorio e instale as dependencias:

```bash
npm install
```

2. Configure o `.env` conforme a secao acima.

## Banco de dados

1. Suba o banco PostgreSQL com Docker:

```bash
docker-compose up -d
```

2. Gere o Prisma Client e rode as migrations para criar as tabelas:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Popule o banco com dados iniciais (seed):

```bash
npm run seed
```

O seed cria automaticamente:

- Usuario admin: `admin@raizesnordeste.com` / `admin123`
- Usuario gerente: `gerente@raizesnordeste.com` / `gerente123`
- Usuario cliente (para testes): `cliente@teste.com` / `cliente123`
- 2 unidades em Fortaleza
- 5 produtos com estoque inicial no cardapio de cada unidade

## Executando a API

```bash
npm run dev
```

A API roda em `http://localhost:3000` (ou na porta definida em `PORT`).

## Documentacao Swagger

Com a API rodando, a documentacao interativa fica disponivel em:

```
http://localhost:3000/api-docs
```

Para testar os endpoints protegidos pelo Swagger, faca o login em `/auth/login`,
copie o `accessToken` retornado e clique no botao **Authorize**, colando o token.

## Testes (colecao Postman)

O arquivo `raizes-nordeste.postman_collection.json` na raiz do projeto contem as
requisicoes organizadas em pastas (Auth, Unidades, Produtos, Cardapio, Estoque,
Pedidos, Pagamentos, Fidelidade e Erros).

A colecao usa as variaveis `{{baseUrl}}` (ja preenchida com `http://localhost:3000`)
e `{{token}}`. Nao precisa configurar ambiente: é so importar o arquivo e usar.

Cada requisicao de **Login** salva o token automaticamente na variavel `{{token}}`,
entao as outras requisicoes ja saem autenticadas. Tem 3 logins na pasta Auth porque
cada perfil tem permissoes diferentes:

- **Login (cliente)**: pedidos, pagamento, fidelidade e os cenarios de erro
- **Login (admin)**: criar unidade/produto e mexer no estoque
- **Login (gerente)**: atualizar status do pedido

Se cair um **403**, é porque o token logado nao tem aquela permissao - é so rodar o
Login do perfil certo antes e mandar de novo.

Ordem sugerida para reproduzir o fluxo principal:

1. **Auth > Login (cliente)** - autentica e guarda o token
2. **Unidades > Listar unidades** e **Produtos > Listar produtos** - pegar os ids
3. **Pedidos > Criar pedido** - cria o pedido informando o `canalPedido`
4. **Pagamentos > Processar pagamento mock** - paga o pedido (aprovado ate R$500)
5. **Pedidos > Detalhe do pedido** - confere o status atualizado para `EM_PREPARO`
6. **Fidelidade > Saldo de pontos** - confere os pontos acumulados
7. **Erros** - cenarios de validacao e permissao (401, 403, 409, 422)

## Dados coletados (LGPD)

Os dados pessoais coletados e a finalidade de cada um:

- Nome e e-mail: usados para autenticacao e identificacao do usuario
- Senha: guardada com hash (bcrypt), nunca em texto plano e nunca retornada nas respostas
- Histórico de pedidos e pontos: usados para o programa de fidelidade e auditoria

O cadastro do cliente tem o campo `aceitaFidelidade`, que registra o consentimento
para participar do programa de pontos. Sem esse consentimento os pontos nao sao
acumulados. As acoes sensiveis (criar pedido, mudar status, cancelar, pagamento)
ficam registradas na tabela de auditoria, mas sem guardar senha ou token.

## Promoções e campanhas

As promoções ainda nao tem endpoint proprio, mas a regra de como aplicar ja esta
pensada e funciona junto com o programa de fidelidade. A ideia:

- O cliente acumula 1 ponto a cada R$10 em pedidos aprovados
- No resgate, 100 pontos viram R$10 de desconto (rota `/fidelidade/resgatar`)
- O desconto fica registrado no historico de pontos e seria aplicado pelo atendente
  no momento de fechar a conta, descontando do total do pedido
- Uma campanha (ex: "ponto em dobro no fim de semana") entraria como uma regra a mais
  no calculo do acumulo, sem mudar o resto do fluxo

Resumindo: a base de pontos/desconto ja existe e a promocao seria so uma variacao
da regra de acumulo.

## Notas de desempenho e disponibilidade

Alguns pontos pensados pros requisitos nao funcionais:

- **Desempenho:** as buscas mais usadas usam indices. O email do usuario é unico,
  e estoque e cardapio tem chave unica por (unidadeId, produtoId), o que o Postgres
  ja indexa. As listagens de produtos e pedidos usam paginacao (`page` e `limit`)
  pra nao trazer tudo de uma vez em horario de pico.
- **Disponibilidade:** o banco roda no Docker com `restart: unless-stopped`, entao
  ele volta sozinho se cair. Em producao daria pra rodar mais de uma instancia da API
  atras de um load balancer, mas isso ficou de fora do escopo do trabalho.
- **Tolerancia a falha no pagamento:** o pagamento é mock, mas o fluxo ja trata o
  erro. Se o gateway recusar, o pedido continua em RECEBIDO e da pra tentar pagar de
  novo na mesma rota (a tabela de pagamento usa upsert). Num cenario real entrariaa um
  retry com algumas tentativas e, se nao desse, o pedido seria cancelado avisando o
  cliente.

## Estrutura do projeto

```
src/
├── controllers/    # recebem a requisicao e chamam os services
├── services/       # regras de negocio e validacoes
├── repositories/   # acesso ao banco via Prisma
├── middlewares/    # autenticacao, autorizacao e tratamento de erros
├── routes/         # definicao das rotas e documentacao OpenAPI
├── docs/           # configuracao do Swagger
├── utils/          # token, hash de senha, pagamento mock, erros
└── server.ts       # ponto de entrada da aplicacao
prisma/             # schema, migrations e seed
```
