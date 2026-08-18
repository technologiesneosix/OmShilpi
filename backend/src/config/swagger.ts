import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi';

export function setupSwagger(app: Express): void {
  const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Om Shilpi Jewellers API Documentation',
  };

  // Raw JSON specification endpoint for clients/Postman import (mounted BEFORE swaggerUi middleware)
  app.get('/api/docs/json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(openApiSpec);
  });

  // Mount Swagger UI at /api/docs and alias /api-docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, options));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, options));
}
