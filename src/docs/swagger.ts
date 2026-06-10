import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// config do swagger. ele le os comentarios @openapi que estao nos arquivos de rota
const opcoes: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raizes do Nordeste API',
      version: '1.0.0',
      description: 'API da rede de lanchonetes Raizes do Nordeste (projeto Uninter). Pedidos multicanal, estoque, pagamento mock e fidelidade.'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    components: {
      securitySchemes: {
        // pra mandar o token: Authorization: Bearer <token>
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // formato padrao de erro que a api retorna
        Erro: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
            timestamp: { type: 'string' },
            path: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, '..', 'routes', '*.{ts,js}')]
};

export const especificacaoSwagger = swaggerJsdoc(opcoes);
