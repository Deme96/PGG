import { Router, Request, Response, type RequestHandler } from 'express';
import { db } from '../db/database.ts';
import {
  createAdminSession,
  createPasswordCredentials,
  getAdminSession,
  getBearerToken,
  isRootAdmin,
  revokeAdminSession,
  revokeUserSessions,
  sanitizeUser,
  userPasswordMatches,
  ROOT_ADMIN_EMAIL
} from '../auth/adminAuth.ts';
import type { AdminPermission, User } from '../types/index.ts';
import {
  getMusicUploadFiles,
  isValidMusicUpload,
  parseMusicUpload,
  removeMusicUpload,
  saveMusicUpload
} from '../middleware/musicUpload.ts';
import { parseImageUpload, saveImageUpload } from '../middleware/imageUpload.ts';

const routeHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  try {
    void Promise.resolve(handler(req, res, next)).catch(next);
  } catch (error) {
    next(error);
  }
};

export const apiRouter = new Proxy(Router(), {
  get(target, property, receiver) {
    const method = Reflect.get(target, property, receiver);
    if (typeof method !== 'function' || !['get', 'post', 'put', 'delete'].includes(String(property))) {
      return method;
    }
    return (...args: unknown[]) => Reflect.apply(
      method,
      target,
      args.map((argument, index) =>
        index > 0 && typeof argument === 'function'
          ? routeHandler(argument as RequestHandler)
          : argument
      )
    );
  }
});
type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

const userRoles: User['role'][] = ['admin', 'journalist', 'artist', 'follower'];
const adminPermissions: AdminPermission[] = [
  'departments',
  'hr',
  'patrimony',
  'correspondence',
  'finances',
  'settings'
];

function isValidUserRole(value: unknown): value is User['role'] {
  return userRoles.some(role => role === value);
}

function parseAdminPermissions(value: unknown): AdminPermission[] | null {
  if (!Array.isArray(value) || value.some(permission => !adminPermissions.includes(permission))) return null;
  return [...new Set(value)] as AdminPermission[];
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidAvatar(value: unknown): value is string | undefined {
  if (value === undefined || value === '') return true;
  if (typeof value !== 'string' || value.length > 2048) return false;
  if (value.startsWith('/api/uploads/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

// =================== HEALTH CHECK ===================
apiRouter.post('/uploads/image', parseImageUpload, async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'Selecione uma imagem.' });
    return;
  }
  try {
    const url = await saveImageUpload(req.file);
    res.status(201).json({ url });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Falha ao guardar a imagem.'
    });
  }
});

apiRouter.get('/health', async (req: Request, res: Response) => {
  await db.getSettings();
  res.json({
    status: 'online',
    portal: 'Portal Gospel Guineense API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// =================== SITE SETTINGS ===================
apiRouter.get('/settings', async (req: Request, res: Response) => {
  res.json(await db.getSettings());
});

apiRouter.put('/settings', async (req: Request, res: Response) => {
  const updated = await db.updateSettings(req.body);
  res.json(updated);
});

// =================== ARTICLES ===================
apiRouter.get('/articles', async (req: Request, res: Response) => {
  res.json(await db.getCollection('articles'));
});

apiRouter.get('/articles/:id', async (req: Request, res: Response) => {
  const item = await db.findById('articles', req.params.id);
  if (!item) return res.status(404).json({ error: 'Article not found' });
  res.json(item);
});

apiRouter.post('/articles', async (req: Request, res: Response) => {
  const newArticle = await db.insert('articles', { ...req.body, views: 0 }, 'news');
  await db.addLog('Criação de Artigo', 'Notícias', `Publicado: ${(newArticle as any).title_pt}`);
  res.status(201).json(newArticle);
});

apiRouter.put('/articles/:id', async (req: Request, res: Response) => {
  const updated = await db.update('articles', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Article not found' });
  await db.addLog('Edição de Artigo', 'Notícias', `Atualizado artigo ${req.params.id}`);
  res.json(updated);
});

apiRouter.delete('/articles/:id', async (req: Request, res: Response) => {
  const success = await db.delete('articles', req.params.id);
  if (!success) return res.status(404).json({ error: 'Article not found' });
  await db.addLog('Eliminação de Artigo', 'Notícias', `Removido artigo ${req.params.id}`);
  res.json({ message: 'Deleted successfully' });
});

apiRouter.post('/articles/:id/view', async (req: Request, res: Response) => {
  const art = await db.findById<any>('articles', req.params.id);
  if (!art) return res.status(404).json({ error: 'Article not found' });
  const updated = await db.update('articles', req.params.id, { views: (art.views || 0) + 1 });
  res.json(updated);
});

// =================== VIDEOS ===================
apiRouter.get('/videos', async (req: Request, res: Response) => {
  res.json(await db.getCollection('videos'));
});

apiRouter.get('/videos/:id', async (req: Request, res: Response) => {
  const item = await db.findById('videos', req.params.id);
  if (!item) return res.status(404).json({ error: 'Video not found' });
  res.json(item);
});

apiRouter.post('/videos', async (req: Request, res: Response) => {
  const newVideo = await db.insert('videos', { ...req.body, views: 0 }, 'vid');
  await db.addLog('Criação de Vídeo', 'Vídeos', `Vídeo adicionado: ${(newVideo as any).title_pt}`);
  res.status(201).json(newVideo);
});

apiRouter.put('/videos/:id', async (req: Request, res: Response) => {
  const updated = await db.update('videos', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Video not found' });
  res.json(updated);
});

apiRouter.delete('/videos/:id', async (req: Request, res: Response) => {
  const success = await db.delete('videos', req.params.id);
  if (!success) return res.status(404).json({ error: 'Video not found' });
  res.json({ message: 'Deleted successfully' });
});

apiRouter.post('/videos/:id/view', async (req: Request, res: Response) => {
  const vid = await db.findById<any>('videos', req.params.id);
  if (!vid) return res.status(404).json({ error: 'Video not found' });
  const updated = await db.update('videos', req.params.id, { views: (vid.views || 0) + 1 });
  res.json(updated);
});

// =================== ARTISTS ===================
apiRouter.get('/artists', async (req: Request, res: Response) => {
  res.json(await db.getCollection('artists'));
});

apiRouter.get('/artists/:id', async (req: Request, res: Response) => {
  const item = await db.findById('artists', req.params.id);
  if (!item) return res.status(404).json({ error: 'Artist not found' });
  res.json(item);
});

apiRouter.post('/artists', async (req: Request, res: Response) => {
  const newArtist = await db.insert('artists', req.body, 'art');
  await db.addLog('Criação de Artista', 'Artistas', `Adicionado artista: ${(newArtist as any).name}`);
  res.status(201).json(newArtist);
});

apiRouter.put('/artists/:id', async (req: Request, res: Response) => {
  const updated = await db.update('artists', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Artist not found' });
  res.json(updated);
});

apiRouter.delete('/artists/:id', async (req: Request, res: Response) => {
  const success = await db.delete('artists', req.params.id);
  if (!success) return res.status(404).json({ error: 'Artist not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== CAROUSEL SLIDES ===================
apiRouter.get('/carousel-slides', async (req: Request, res: Response) => {
  res.json(await db.getCollection('carousel_slides'));
});

apiRouter.post('/carousel-slides', async (req: Request, res: Response) => {
  const newSlide = await db.insert('carousel_slides', req.body, 'slide');
  res.status(201).json(newSlide);
});

apiRouter.put('/carousel-slides/:id', async (req: Request, res: Response) => {
  const updated = await db.update('carousel_slides', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Slide not found' });
  res.json(updated);
});

apiRouter.delete('/carousel-slides/:id', async (req: Request, res: Response) => {
  const success = await db.delete('carousel_slides', req.params.id);
  if (!success) return res.status(404).json({ error: 'Slide not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== DEPARTMENTS ===================
apiRouter.get('/departments', async (req: Request, res: Response) => {
  res.json(await db.getCollection('departments'));
});

apiRouter.put('/departments/:id', async (req: Request, res: Response) => {
  const updated = await db.update('departments', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Department not found' });
  await db.addLog('Atualização de Departamento', 'Departamentos', `Departamento ${req.params.id} atualizado`);
  res.json(updated);
});

// =================== STAFF ===================
apiRouter.get('/staff', async (req: Request, res: Response) => {
  res.json(await db.getCollection('staff'));
});

apiRouter.post('/staff', async (req: Request, res: Response) => {
  const newStaff = await db.insert('staff', req.body, 'stf');
  await db.addLog('Admissão de Colaborador', 'Recursos Humanos', `Adicionado: ${(newStaff as any).name}`);
  res.status(201).json(newStaff);
});

apiRouter.put('/staff/:id', async (req: Request, res: Response) => {
  const updated = await db.update('staff', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff not found' });
  res.json(updated);
});

apiRouter.delete('/staff/:id', async (req: Request, res: Response) => {
  const success = await db.delete('staff', req.params.id);
  if (!success) return res.status(404).json({ error: 'Staff not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== SCHEDULES ===================
apiRouter.get('/schedules', async (req: Request, res: Response) => {
  res.json(await db.getCollection('schedules'));
});

apiRouter.post('/schedules', async (req: Request, res: Response) => {
  const newSchedule = await db.insert('schedules', req.body, 'sch');
  await db.addLog('Nova Escala de Serviço', 'Recursos Humanos', `Escala agendada: ${(newSchedule as any).serviceName}`);
  res.status(201).json(newSchedule);
});

apiRouter.put('/schedules/:id', async (req: Request, res: Response) => {
  const updated = await db.update('schedules', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Schedule not found' });
  res.json(updated);
});

apiRouter.delete('/schedules/:id', async (req: Request, res: Response) => {
  const success = await db.delete('schedules', req.params.id);
  if (!success) return res.status(404).json({ error: 'Schedule not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== COVERAGE REQUESTS ===================
apiRouter.get('/coverage-requests', async (req: Request, res: Response) => {
  res.json(await db.getCollection('coverage_requests'));
});

apiRouter.post('/coverage-requests', async (req: Request, res: Response) => {
  const newReq = await db.insert(
    'coverage_requests',
    {
      ...req.body,
      status: 'Pendente',
      createdAt: new Date().toISOString().substring(0, 10)
    },
    'cov'
  );
  await db.addLog('Novo Pedido de Cobertura', 'Correspondências', `Recebido pedido: ${(newReq as any).eventTitle}`);
  res.status(201).json(newReq);
});

apiRouter.put('/coverage-requests/:id', async (req: Request, res: Response) => {
  const updated = await db.update('coverage_requests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coverage request not found' });
  res.json(updated);
});

apiRouter.delete('/coverage-requests/:id', async (req: Request, res: Response) => {
  const success = await db.delete('coverage_requests', req.params.id);
  if (!success) return res.status(404).json({ error: 'Coverage request not found' });
  res.json({ message: 'Deleted successfully' });
});

// APPROVE & GENERATE SCHEDULE ENDPOINT
apiRouter.post('/coverage-requests/:id/approve', async (req: Request, res: Response) => {
  const { staffId, assignedDate, assignedTime } = req.body;
  const result = await db.approveCoverageRequest(req.params.id, staffId, assignedDate, assignedTime);
  if (!result) return res.status(404).json({ error: 'Coverage request not found' });
  res.json(result);
});

// =================== PARTNERSHIPS ===================
apiRouter.get('/partnerships', async (req: Request, res: Response) => {
  res.json(await db.getCollection('partnerships'));
});

apiRouter.post('/partnerships', async (req: Request, res: Response) => {
  const newPart = await db.insert('partnerships', req.body, 'part');
  await db.addLog('Nova Parceria', 'Correspondências', `Acordo com: ${(newPart as any).partnerName}`);
  res.status(201).json(newPart);
});

apiRouter.put('/partnerships/:id', async (req: Request, res: Response) => {
  const updated = await db.update('partnerships', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Partnership not found' });
  res.json(updated);
});

apiRouter.delete('/partnerships/:id', async (req: Request, res: Response) => {
  const success = await db.delete('partnerships', req.params.id);
  if (!success) return res.status(404).json({ error: 'Partnership not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== MUSIC REQUESTS ===================
apiRouter.get('/music-requests', async (req: Request, res: Response) => {
  res.json(await db.getCollection('music_requests'));
});

apiRouter.post('/music-requests', parseMusicUpload, async (req: Request, res: Response, next) => {
  const { audio, coverImage } = getMusicUploadFiles(req);
  if (!String(req.body.artistName || '').trim() || !String(req.body.contactPhone || '').trim() || !String(req.body.songTitle || '').trim()) {
    return res.status(400).json({ error: 'Nome do artista, telefone e título da música são obrigatórios.' });
  }
  if (audio && !isValidMusicUpload(audio, 'audio')) {
    return res.status(400).json({ error: 'O áudio deve ser um ficheiro MP3, WAV, M4A ou AAC válido.' });
  }
  if (coverImage && coverImage.size > 5 * 1024 * 1024) {
    return res.status(413).json({ error: 'A imagem de capa deve ter no máximo 5 MB.' });
  }
  if (coverImage && !isValidMusicUpload(coverImage, 'coverImage')) {
    return res.status(400).json({ error: 'A capa deve ser uma imagem JPG, PNG ou WebP válida.' });
  }

  const savedUploads: string[] = [];
  try {
    const audioUrl = audio ? await saveMusicUpload(audio) : req.body.audioUrl;
    if (audioUrl && audio) savedUploads.push(audioUrl);
    const coverImageUrl = coverImage ? await saveMusicUpload(coverImage) : undefined;
    if (coverImageUrl) savedUploads.push(coverImageUrl);

    const newMusic = await db.insert(
      'music_requests',
      {
        ...req.body,
        audioUrl,
        coverImageUrl,
        status: 'Pendente',
        requestedDate: new Date().toISOString().substring(0, 10)
      },
      'mus'
    );
    await db.addLog('Submissão Zona do Artista', 'Correspondências', `Novo louvor: ${(newMusic as any).songTitle} por ${(newMusic as any).artistName}`);
    return res.status(201).json(newMusic);
  } catch (error) {
    try {
      await Promise.all(savedUploads.map(removeMusicUpload));
    } catch (cleanupError) {
      console.error('[PGG-API] Falha ao limpar ficheiros de um pedido de música incompleto:', cleanupError);
    }
    return next(error);
  }
});

apiRouter.put('/music-requests/:id', async (req: Request, res: Response) => {
  const updated = await db.update('music_requests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Music request not found' });
  res.json(updated);
});

apiRouter.delete('/music-requests/:id', async (req: Request, res: Response) => {
  const success = await db.delete('music_requests', req.params.id);
  if (!success) return res.status(404).json({ error: 'Music request not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== BOOKMARKS ===================
apiRouter.get('/bookmarks/user/:userId', async (req: Request, res: Response) => {
  const allBookmarks = await db.getCollection<any>('bookmarks');
  const userBookmarks = allBookmarks.filter(b => b.userId === req.params.userId);
  const articles = await db.getCollection<any>('articles');
  const savedArticles = articles.filter(a => userBookmarks.some(b => b.articleId === a.id));
  res.json({ bookmarks: userBookmarks, articles: savedArticles });
});

apiRouter.post('/bookmarks/toggle', async (req: Request, res: Response) => {
  const { userId, articleId } = req.body;
  const bookmarks = await db.getCollection<any>('bookmarks');
  const index = bookmarks.findIndex(b => b.userId === userId && b.articleId === articleId);

  if (index >= 0) {
    await db.delete('bookmarks', bookmarks[index].id);
    return res.json({ bookmarked: false });
  } else {
    const newBm = await db.insert('bookmarks', {
      userId,
      articleId,
      savedAt: new Date().toISOString().substring(0, 10)
    }, 'bm');
    return res.json({ bookmarked: true, bookmark: newBm });
  }
});

// =================== FINANCES ===================
apiRouter.get('/finances', async (req: Request, res: Response) => {
  res.json(await db.getCollection('finances'));
});

apiRouter.get('/finances/summary', async (req: Request, res: Response) => {
  const finances = await db.getCollection<any>('finances');
  const totalIncome = finances
    .filter(f => f.type === 'Entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'Saída')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  res.json({
    totalIncome,
    totalExpense,
    currentBalance,
    currency: 'XOF',
    count: finances.length
  });
});

apiRouter.post('/finances', async (req: Request, res: Response) => {
  const newFin = await db.insert<any>('finances', req.body, 'fin');
  await db.addLog(
    'Movimento Financeiro',
    'Finanças',
    `${(newFin as any).type}: ${(newFin as any).amount.toLocaleString()} XOF (${(newFin as any).category})`
  );
  res.status(201).json(newFin);
});

apiRouter.put('/finances/:id', async (req: Request, res: Response) => {
  const updated = await db.update('finances', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Finance entry not found' });
  res.json(updated);
});

apiRouter.delete('/finances/:id', async (req: Request, res: Response) => {
  const success = await db.delete('finances', req.params.id);
  if (!success) return res.status(404).json({ error: 'Finance entry not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== ASSETS ===================
apiRouter.get('/assets', async (req: Request, res: Response) => {
  res.json(await db.getCollection('assets'));
});

apiRouter.post('/assets', async (req: Request, res: Response) => {
  const newAsset = await db.insert('assets', req.body, 'ast');
  res.status(201).json(newAsset);
});

apiRouter.put('/assets/:id', async (req: Request, res: Response) => {
  const updated = await db.update('assets', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Asset not found' });
  res.json(updated);
});

apiRouter.delete('/assets/:id', async (req: Request, res: Response) => {
  const success = await db.delete('assets', req.params.id);
  if (!success) return res.status(404).json({ error: 'Asset not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== LIABILITIES ===================
apiRouter.get('/liabilities', async (req: Request, res: Response) => {
  res.json(await db.getCollection('liabilities'));
});

apiRouter.post('/liabilities', async (req: Request, res: Response) => {
  const newLiab = await db.insert('liabilities', req.body, 'liab');
  res.status(201).json(newLiab);
});

apiRouter.put('/liabilities/:id', async (req: Request, res: Response) => {
  const updated = await db.update('liabilities', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Liability not found' });
  res.json(updated);
});

apiRouter.delete('/liabilities/:id', async (req: Request, res: Response) => {
  const success = await db.delete('liabilities', req.params.id);
  if (!success) return res.status(404).json({ error: 'Liability not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== TASKS ===================
apiRouter.get('/tasks', async (req: Request, res: Response) => {
  res.json(await db.getCollection('tasks'));
});

apiRouter.post('/tasks', async (req: Request, res: Response) => {
  const newTask = await db.insert('tasks', req.body, 'tsk');
  res.status(201).json(newTask);
});

apiRouter.put('/tasks/:id', async (req: Request, res: Response) => {
  const updated = await db.update('tasks', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

apiRouter.delete('/tasks/:id', async (req: Request, res: Response) => {
  const success = await db.delete('tasks', req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== LOGS ===================
apiRouter.get('/logs', async (req: Request, res: Response) => {
  res.json(await db.getCollection('logs'));
});

apiRouter.post('/logs', async (req: Request, res: Response) => {
  const { action, module, details, user } = req.body || {};
  if (typeof action !== 'string' || typeof module !== 'string' || typeof details !== 'string') {
    return res.status(400).json({ error: 'Dados do registo de auditoria inválidos.' });
  }
  res.status(201).json(await db.addLog(action, module, details, typeof user === 'string' ? user : 'Sistema'));
});

// =================== BACKUPS ===================
apiRouter.get('/backups', async (req: Request, res: Response) => {
  res.json(await db.getCollection('backups'));
});

apiRouter.post('/backups', async (req: Request, res: Response) => {
  const { filename, size, type, recordsCount, createdBy } = req.body || {};
  const backup = await db.insert('backups', {
    filename,
    date: new Date().toISOString(),
    size,
    type,
    recordsCount,
    createdBy
  }, 'bkp');
  res.status(201).json(backup);
});

apiRouter.get('/backups/export', async (req: Request, res: Response) => {
  const json = await db.exportFullJSON();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="pgg_backup_${Date.now()}.json"`);
  res.send(json);
});

apiRouter.post('/backups/restore', async (req: Request, res: Response) => {
  await db.restoreFromJSON(JSON.stringify(req.body));
  res.json({ message: 'Restored successfully' });
});

// =================== VISITOR PINGS ===================
apiRouter.get('/pings', async (req: Request, res: Response) => {
  res.json(await db.getCollection('pings'));
});

apiRouter.post('/pings/record', async (req: Request, res: Response) => {
  const { city, countryName, countryCode, lat, lng } = req.body;
  const pings = await db.getCollection<any>('pings');
  const existing = pings.find(p => p.city.toLowerCase() === city.toLowerCase() && p.countryCode === countryCode);

  if (existing) {
    const updated = await db.update<any>('pings', existing.id, {
      viewsCount: existing.viewsCount + 1,
      timestamp: new Date().toISOString()
    });
    res.json(updated);
  } else {
    const newPing = await db.insert('pings', {
      ip: req.ip || 'unknown',
      city,
      countryName,
      countryCode,
      lat,
      lng,
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      viewsCount: 1
    }, 'ping');
    res.status(201).json(newPing);
  }
});

// =================== AUTH ===================
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  const result = await createAdminSession(req.body?.email, req.body?.password);
  if ('error' in result) return res.status(result.status).json({ error: result.error });
  res.json(result);
});

apiRouter.post('/auth/community/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || typeof password !== 'string') {
    return res.status(401).json({ error: 'E-mail ou palavra-passe inválidos.' });
  }
  const user = await db.findUserByEmail<StoredUser>(email.trim().toLowerCase());
  if (
    !user ||
    isRootAdmin(user) ||
    user.role === 'admin' ||
    (Array.isArray(user.adminPermissions) && user.adminPermissions.length > 0) ||
    !user.passwordHash ||
    !userPasswordMatches(user, password)
  ) {
    return res.status(401).json({ error: 'E-mail ou palavra-passe inválidos.' });
  }
  res.json({ user: sanitizeUser(user) });
});

apiRouter.post('/auth/community/register', async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body || {};
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
    !isValidEmail(email) ||
    !['follower', 'artist', 'journalist'].includes(role) ||
    typeof password !== 'string' || password.length < 12 || password.length > 128
  ) {
    return res.status(400).json({ error: 'Informe nome, e-mail, perfil e uma palavra-passe com pelo menos 12 caracteres.' });
  }
  if (email.trim().toLowerCase() === ROOT_ADMIN_EMAIL || await db.findUserByEmail(email.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Este e-mail já está associado a uma conta.' });
  }
  const user = await db.insert<StoredUser>('users', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    twoFactorEnabled: false,
    isActive: true,
    ...createPasswordCredentials(password)
  }, 'usr');
  res.status(201).json({ user: sanitizeUser(user) });
});

apiRouter.get('/auth/session', async (req: Request, res: Response) => {
  const user = await getAdminSession(getBearerToken(req.header('authorization')));
  if (!user) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  res.json({ user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  revokeAdminSession(getBearerToken(req.header('authorization')));
  res.json({ message: 'Sessão terminada.' });
});

apiRouter.get('/auth/users', async (req: Request, res: Response) => {
  const users = await db.getCollection<StoredUser>('users');
  res.json(users.map(user => sanitizeUser(user)));
});

apiRouter.post('/auth/users', async (req: Request, res: Response) => {
  const currentUser = res.locals.adminUser as User | undefined;
  if (!currentUser || !isRootAdmin(currentUser)) return res.status(403).json({ error: 'Apenas o administrador principal pode gerir utilizadores.' });

  const { name, email, role, phone, avatar, twoFactorEnabled, isActive, password } = req.body || {};
  const permissions = parseAdminPermissions(req.body?.adminPermissions);
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
    !isValidEmail(email) ||
    !isValidUserRole(role) ||
    !permissions ||
    !isValidAvatar(avatar) ||
    (phone !== undefined && (typeof phone !== 'string' || phone.length > 40)) ||
    (twoFactorEnabled !== undefined && typeof twoFactorEnabled !== 'boolean') ||
    (isActive !== undefined && typeof isActive !== 'boolean')
  ) {
    return res.status(400).json({ error: 'Verifique os dados do utilizador e os privilégios selecionados.' });
  }
  if (email.trim().toLowerCase() === ROOT_ADMIN_EMAIL) {
    return res.status(409).json({ error: 'O e-mail do administrador principal já está reservado.' });
  }
  if (await db.findUserByEmail<StoredUser>(email.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Já existe um utilizador com este e-mail.' });
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'A palavra-passe deve ter entre 12 e 128 caracteres.' });
  }

  const credentials = createPasswordCredentials(password);
  const newUser = await db.insert<StoredUser>('users', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    phone: phone?.trim() || undefined,
    avatar: avatar || undefined,
    twoFactorEnabled: twoFactorEnabled ?? false,
    isActive: isActive ?? true,
    adminPermissions: permissions,
    ...credentials
  }, 'usr');
  await db.addLog('Criação de Utilizador de Gestão', 'Configurações', `Criada conta para ${newUser.email}`, currentUser.name);
  res.status(201).json(sanitizeUser(newUser));
});

apiRouter.put('/auth/users/:id', async (req: Request, res: Response) => {
  const currentUser = res.locals.adminUser as User | undefined;
  if (!currentUser || !isRootAdmin(currentUser)) return res.status(403).json({ error: 'Apenas o administrador principal pode gerir utilizadores.' });

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existingUser = await db.findById<StoredUser>('users', userId);
  if (!existingUser) return res.status(404).json({ error: 'Utilizador não encontrado.' });

  const { name, email, role, phone, avatar, twoFactorEnabled, isActive, password, currentPassword } = req.body || {};
  const isRootAccount = isRootAdmin(existingUser);
  if (isRootAccount) {
    if (
      email?.trim().toLowerCase() !== ROOT_ADMIN_EMAIL ||
      role !== 'admin' ||
      isActive === false ||
      req.body?.adminPermissions !== undefined
    ) {
      return res.status(403).json({ error: 'A conta principal e os seus privilégios não podem ser alterados.' });
    }
    if (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 12 || password.length > 128)) {
      return res.status(400).json({ error: 'A palavra-passe deve ter entre 12 e 128 caracteres.' });
    }
    if (password && (typeof currentPassword !== 'string' || !userPasswordMatches(existingUser, currentPassword))) {
      return res.status(401).json({ error: 'A palavra-passe atual está incorreta.' });
    }
    if (
      typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
      !isValidAvatar(avatar) ||
      (phone !== undefined && (typeof phone !== 'string' || phone.length > 40)) ||
      (twoFactorEnabled !== undefined && typeof twoFactorEnabled !== 'boolean')
    ) {
      return res.status(400).json({ error: 'Verifique os dados do utilizador.' });
    }
    const credentials = password ? createPasswordCredentials(password) : {};
    const updatedRoot = await db.update<StoredUser>('users', existingUser.id, {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      avatar: avatar || undefined,
      twoFactorEnabled: twoFactorEnabled ?? existingUser.twoFactorEnabled,
      ...credentials
    });
    if (password) {
      revokeUserSessions(existingUser.id, getBearerToken(req.header('authorization')));
      await db.addLog('Alteração da palavra-passe principal', 'Configurações', 'Palavra-passe da conta principal atualizada', currentUser.name);
    }
    return res.json(sanitizeUser(updatedRoot || existingUser));
  }

  const permissions = parseAdminPermissions(req.body?.adminPermissions);
  if (
    typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
    !isValidEmail(email) ||
    !isValidUserRole(role) ||
    !permissions ||
    !isValidAvatar(avatar) ||
    (phone !== undefined && (typeof phone !== 'string' || phone.length > 40)) ||
    typeof isActive !== 'boolean' ||
    (twoFactorEnabled !== undefined && typeof twoFactorEnabled !== 'boolean')
  ) {
    return res.status(400).json({ error: 'Verifique os dados do utilizador e os privilégios selecionados.' });
  }
  if (email.trim().toLowerCase() === ROOT_ADMIN_EMAIL) {
    return res.status(409).json({ error: 'O e-mail do administrador principal já está reservado.' });
  }
  const duplicateUser = await db.findUserByEmail<StoredUser>(email.trim().toLowerCase());
  if (duplicateUser && duplicateUser.id !== existingUser.id) {
    return res.status(409).json({ error: 'Já existe um utilizador com este e-mail.' });
  }
  if (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 12 || password.length > 128)) {
    return res.status(400).json({ error: 'A palavra-passe deve ter entre 12 e 128 caracteres.' });
  }
  if (!existingUser.passwordHash && !password) {
    return res.status(400).json({ error: 'Defina uma palavra-passe inicial para esta conta de gestão.' });
  }

  const credentials = password ? createPasswordCredentials(password) : {};
  const updatedUser = await db.update<StoredUser>('users', existingUser.id, {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    phone: phone?.trim() || undefined,
    avatar: avatar || undefined,
    twoFactorEnabled: twoFactorEnabled ?? existingUser.twoFactorEnabled ?? false,
    isActive,
    adminPermissions: permissions,
    ...credentials
  });
  revokeUserSessions(existingUser.id);
  await db.addLog('Edição de Privilégios', 'Configurações', `Atualizada conta ${existingUser.email}`, currentUser.name);
  res.json(sanitizeUser(updatedUser || existingUser));
});

apiRouter.delete('/auth/users/:id', async (req: Request, res: Response) => {
  const currentUser = res.locals.adminUser as User | undefined;
  if (!currentUser || !isRootAdmin(currentUser)) return res.status(403).json({ error: 'Apenas o administrador principal pode gerir utilizadores.' });

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = await db.findById<StoredUser>('users', userId);
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
  if (isRootAdmin(user) || user.id === currentUser.id) {
    return res.status(403).json({ error: 'A conta principal ou a sessão atual não pode ser eliminada.' });
  }

  await db.delete('users', user.id);
  revokeUserSessions(user.id);
  await db.addLog('Eliminação de Utilizador de Gestão', 'Configurações', `Removida conta ${user.email}`, currentUser.name);
  res.json({ message: 'Utilizador removido.' });
});
