import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRouter.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[PGG-API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Fallback for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found on Portal Gospel Guineense API' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  ==============================================================
   PORTAL GOSPEL GUINEENSE (PGG) - SERVIÇO BACKEND REST API
  ==============================================================
   Servidor ativo em:    http://localhost:${PORT}
   Endpoints da API:     http://localhost:${PORT}/api
   Verificação (Health): http://localhost:${PORT}/api/health
   Base de Dados:        server/data/db.json
  ==============================================================
  `);
});
