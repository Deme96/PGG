import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRouter.ts';
import { getAdminSession, getBearerToken } from './auth/adminAuth.ts';
import { canAccessAdminPath } from './auth/adminPermissions.ts';
import { musicUploadsDirectory } from './middleware/musicUpload.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(
  '/api/uploads',
  express.static(musicUploadsDirectory, {
    dotfiles: 'deny',
    index: false,
    setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff')
  })
);

app.use('/api', (req, res, next) => {
  const path = req.path;
  const publicRead =
    req.method === 'GET' &&
    /^\/(health|settings|articles(?:\/[^/]+)?|videos(?:\/[^/]+)?|artists(?:\/[^/]+)?|carousel-slides|pings)$/.test(path);
  const publicSubmission =
    req.method === 'POST' &&
    (
      path === '/auth/login' ||
      path === '/auth/register' ||
      path === '/pings/record' ||
      path === '/coverage-requests' ||
      path === '/music-requests' ||
      /^\/(articles|videos)\/[^/]+\/view$/.test(path)
    );

  if (publicRead || publicSubmission) return next();

  const user = getAdminSession(getBearerToken(req.header('authorization')));
  if (!user) return res.status(401).json({ error: 'É necessário iniciar sessão como administrador.' });
  if (!canAccessAdminPath(user, path)) {
    return res.status(403).json({ error: 'A sua conta não tem privilégios para esta área.' });
  }
  res.locals.adminUser = user;
  next();
});

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
