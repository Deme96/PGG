import { Router, Request, Response } from 'express';
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

export const apiRouter = Router();
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
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

// =================== HEALTH CHECK ===================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    portal: 'Portal Gospel Guineense API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// =================== SITE SETTINGS ===================
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// =================== ARTICLES ===================
apiRouter.get('/articles', (req: Request, res: Response) => {
  res.json(db.getCollection('articles'));
});

apiRouter.get('/articles/:id', (req: Request, res: Response) => {
  const item = db.findById('articles', req.params.id);
  if (!item) return res.status(404).json({ error: 'Article not found' });
  res.json(item);
});

apiRouter.post('/articles', (req: Request, res: Response) => {
  const newArticle = db.insert('articles', { ...req.body, views: 0 }, 'news');
  db.addLog('Criação de Artigo', 'Notícias', `Publicado: ${(newArticle as any).title_pt}`);
  res.status(201).json(newArticle);
});

apiRouter.put('/articles/:id', (req: Request, res: Response) => {
  const updated = db.update('articles', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Article not found' });
  db.addLog('Edição de Artigo', 'Notícias', `Atualizado artigo ${req.params.id}`);
  res.json(updated);
});

apiRouter.delete('/articles/:id', (req: Request, res: Response) => {
  const success = db.delete('articles', req.params.id);
  if (!success) return res.status(404).json({ error: 'Article not found' });
  db.addLog('Eliminação de Artigo', 'Notícias', `Removido artigo ${req.params.id}`);
  res.json({ message: 'Deleted successfully' });
});

apiRouter.post('/articles/:id/view', (req: Request, res: Response) => {
  const art = db.findById<any>('articles', req.params.id);
  if (!art) return res.status(404).json({ error: 'Article not found' });
  const updated = db.update('articles', req.params.id, { views: (art.views || 0) + 1 });
  res.json(updated);
});

// =================== VIDEOS ===================
apiRouter.get('/videos', (req: Request, res: Response) => {
  res.json(db.getCollection('videos'));
});

apiRouter.get('/videos/:id', (req: Request, res: Response) => {
  const item = db.findById('videos', req.params.id);
  if (!item) return res.status(404).json({ error: 'Video not found' });
  res.json(item);
});

apiRouter.post('/videos', (req: Request, res: Response) => {
  const newVideo = db.insert('videos', { ...req.body, views: 0 }, 'vid');
  db.addLog('Criação de Vídeo', 'Vídeos', `Vídeo adicionado: ${(newVideo as any).title_pt}`);
  res.status(201).json(newVideo);
});

apiRouter.put('/videos/:id', (req: Request, res: Response) => {
  const updated = db.update('videos', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Video not found' });
  res.json(updated);
});

apiRouter.delete('/videos/:id', (req: Request, res: Response) => {
  const success = db.delete('videos', req.params.id);
  if (!success) return res.status(404).json({ error: 'Video not found' });
  res.json({ message: 'Deleted successfully' });
});

apiRouter.post('/videos/:id/view', (req: Request, res: Response) => {
  const vid = db.findById<any>('videos', req.params.id);
  if (!vid) return res.status(404).json({ error: 'Video not found' });
  const updated = db.update('videos', req.params.id, { views: (vid.views || 0) + 1 });
  res.json(updated);
});

// =================== ARTISTS ===================
apiRouter.get('/artists', (req: Request, res: Response) => {
  res.json(db.getCollection('artists'));
});

apiRouter.get('/artists/:id', (req: Request, res: Response) => {
  const item = db.findById('artists', req.params.id);
  if (!item) return res.status(404).json({ error: 'Artist not found' });
  res.json(item);
});

apiRouter.post('/artists', (req: Request, res: Response) => {
  const newArtist = db.insert('artists', req.body, 'art');
  db.addLog('Criação de Artista', 'Artistas', `Adicionado artista: ${(newArtist as any).name}`);
  res.status(201).json(newArtist);
});

apiRouter.put('/artists/:id', (req: Request, res: Response) => {
  const updated = db.update('artists', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Artist not found' });
  res.json(updated);
});

apiRouter.delete('/artists/:id', (req: Request, res: Response) => {
  const success = db.delete('artists', req.params.id);
  if (!success) return res.status(404).json({ error: 'Artist not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== CAROUSEL SLIDES ===================
apiRouter.get('/carousel-slides', (req: Request, res: Response) => {
  res.json(db.getCollection('carousel_slides'));
});

apiRouter.post('/carousel-slides', (req: Request, res: Response) => {
  const newSlide = db.insert('carousel_slides', req.body, 'slide');
  res.status(201).json(newSlide);
});

apiRouter.put('/carousel-slides/:id', (req: Request, res: Response) => {
  const updated = db.update('carousel_slides', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Slide not found' });
  res.json(updated);
});

apiRouter.delete('/carousel-slides/:id', (req: Request, res: Response) => {
  const success = db.delete('carousel_slides', req.params.id);
  if (!success) return res.status(404).json({ error: 'Slide not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== DEPARTMENTS ===================
apiRouter.get('/departments', (req: Request, res: Response) => {
  res.json(db.getCollection('departments'));
});

apiRouter.put('/departments/:id', (req: Request, res: Response) => {
  const updated = db.update('departments', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Department not found' });
  db.addLog('Atualização de Departamento', 'Departamentos', `Departamento ${req.params.id} atualizado`);
  res.json(updated);
});

// =================== STAFF ===================
apiRouter.get('/staff', (req: Request, res: Response) => {
  res.json(db.getCollection('staff'));
});

apiRouter.post('/staff', (req: Request, res: Response) => {
  const newStaff = db.insert('staff', req.body, 'stf');
  db.addLog('Admissão de Colaborador', 'Recursos Humanos', `Adicionado: ${(newStaff as any).name}`);
  res.status(201).json(newStaff);
});

apiRouter.put('/staff/:id', (req: Request, res: Response) => {
  const updated = db.update('staff', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff not found' });
  res.json(updated);
});

apiRouter.delete('/staff/:id', (req: Request, res: Response) => {
  const success = db.delete('staff', req.params.id);
  if (!success) return res.status(404).json({ error: 'Staff not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== SCHEDULES ===================
apiRouter.get('/schedules', (req: Request, res: Response) => {
  res.json(db.getCollection('schedules'));
});

apiRouter.post('/schedules', (req: Request, res: Response) => {
  const newSchedule = db.insert('schedules', req.body, 'sch');
  db.addLog('Nova Escala de Serviço', 'Recursos Humanos', `Escala agendada: ${(newSchedule as any).serviceName}`);
  res.status(201).json(newSchedule);
});

apiRouter.put('/schedules/:id', (req: Request, res: Response) => {
  const updated = db.update('schedules', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Schedule not found' });
  res.json(updated);
});

apiRouter.delete('/schedules/:id', (req: Request, res: Response) => {
  const success = db.delete('schedules', req.params.id);
  if (!success) return res.status(404).json({ error: 'Schedule not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== COVERAGE REQUESTS ===================
apiRouter.get('/coverage-requests', (req: Request, res: Response) => {
  res.json(db.getCollection('coverage_requests'));
});

apiRouter.post('/coverage-requests', (req: Request, res: Response) => {
  const newReq = db.insert(
    'coverage_requests',
    {
      ...req.body,
      status: 'Pendente',
      createdAt: new Date().toISOString().substring(0, 10)
    },
    'cov'
  );
  db.addLog('Novo Pedido de Cobertura', 'Correspondências', `Recebido pedido: ${(newReq as any).eventTitle}`);
  res.status(201).json(newReq);
});

apiRouter.put('/coverage-requests/:id', (req: Request, res: Response) => {
  const updated = db.update('coverage_requests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coverage request not found' });
  res.json(updated);
});

apiRouter.delete('/coverage-requests/:id', (req: Request, res: Response) => {
  const success = db.delete('coverage_requests', req.params.id);
  if (!success) return res.status(404).json({ error: 'Coverage request not found' });
  res.json({ message: 'Deleted successfully' });
});

// APPROVE & GENERATE SCHEDULE ENDPOINT
apiRouter.post('/coverage-requests/:id/approve', (req: Request, res: Response) => {
  const { staffId, assignedDate, assignedTime } = req.body;
  const result = db.approveCoverageRequest(req.params.id, staffId, assignedDate, assignedTime);
  if (!result) return res.status(404).json({ error: 'Coverage request not found' });
  res.json(result);
});

// =================== PARTNERSHIPS ===================
apiRouter.get('/partnerships', (req: Request, res: Response) => {
  res.json(db.getCollection('partnerships'));
});

apiRouter.post('/partnerships', (req: Request, res: Response) => {
  const newPart = db.insert('partnerships', req.body, 'part');
  db.addLog('Nova Parceria', 'Correspondências', `Acordo com: ${(newPart as any).partnerName}`);
  res.status(201).json(newPart);
});

apiRouter.put('/partnerships/:id', (req: Request, res: Response) => {
  const updated = db.update('partnerships', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Partnership not found' });
  res.json(updated);
});

apiRouter.delete('/partnerships/:id', (req: Request, res: Response) => {
  const success = db.delete('partnerships', req.params.id);
  if (!success) return res.status(404).json({ error: 'Partnership not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== MUSIC REQUESTS ===================
apiRouter.get('/music-requests', (req: Request, res: Response) => {
  res.json(db.getCollection('music_requests'));
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

    const newMusic = db.insert(
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
    db.addLog('Submissão Zona do Artista', 'Correspondências', `Novo louvor: ${(newMusic as any).songTitle} por ${(newMusic as any).artistName}`);
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

apiRouter.put('/music-requests/:id', (req: Request, res: Response) => {
  const updated = db.update('music_requests', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Music request not found' });
  res.json(updated);
});

apiRouter.delete('/music-requests/:id', (req: Request, res: Response) => {
  const success = db.delete('music_requests', req.params.id);
  if (!success) return res.status(404).json({ error: 'Music request not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== BOOKMARKS ===================
apiRouter.get('/bookmarks/user/:userId', (req: Request, res: Response) => {
  const allBookmarks = db.getCollection('bookmarks');
  const userBookmarks = allBookmarks.filter(b => b.userId === req.params.userId);
  const articles = db.getCollection('articles');
  const savedArticles = articles.filter(a => userBookmarks.some(b => b.articleId === a.id));
  res.json({ bookmarks: userBookmarks, articles: savedArticles });
});

apiRouter.post('/bookmarks/toggle', (req: Request, res: Response) => {
  const { userId, articleId } = req.body;
  const bookmarks = db.getCollection('bookmarks');
  const index = bookmarks.findIndex(b => b.userId === userId && b.articleId === articleId);

  if (index >= 0) {
    db.delete('bookmarks', bookmarks[index].id);
    return res.json({ bookmarked: false });
  } else {
    const newBm = db.insert('bookmarks', {
      userId,
      articleId,
      savedAt: new Date().toISOString().substring(0, 10)
    }, 'bm');
    return res.json({ bookmarked: true, bookmark: newBm });
  }
});

// =================== FINANCES ===================
apiRouter.get('/finances', (req: Request, res: Response) => {
  res.json(db.getCollection('finances'));
});

apiRouter.get('/finances/summary', (req: Request, res: Response) => {
  const finances = db.getCollection('finances');
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

apiRouter.post('/finances', (req: Request, res: Response) => {
  const newFin = db.insert('finances', req.body, 'fin');
  db.addLog(
    'Movimento Financeiro',
    'Finanças',
    `${(newFin as any).type}: ${(newFin as any).amount.toLocaleString()} XOF (${(newFin as any).category})`
  );
  res.status(201).json(newFin);
});

apiRouter.put('/finances/:id', (req: Request, res: Response) => {
  const updated = db.update('finances', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Finance entry not found' });
  res.json(updated);
});

apiRouter.delete('/finances/:id', (req: Request, res: Response) => {
  const success = db.delete('finances', req.params.id);
  if (!success) return res.status(404).json({ error: 'Finance entry not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== ASSETS ===================
apiRouter.get('/assets', (req: Request, res: Response) => {
  res.json(db.getCollection('assets'));
});

apiRouter.post('/assets', (req: Request, res: Response) => {
  const newAsset = db.insert('assets', req.body, 'ast');
  res.status(201).json(newAsset);
});

apiRouter.put('/assets/:id', (req: Request, res: Response) => {
  const updated = db.update('assets', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Asset not found' });
  res.json(updated);
});

apiRouter.delete('/assets/:id', (req: Request, res: Response) => {
  const success = db.delete('assets', req.params.id);
  if (!success) return res.status(404).json({ error: 'Asset not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== LIABILITIES ===================
apiRouter.get('/liabilities', (req: Request, res: Response) => {
  res.json(db.getCollection('liabilities'));
});

apiRouter.post('/liabilities', (req: Request, res: Response) => {
  const newLiab = db.insert('liabilities', req.body, 'liab');
  res.status(201).json(newLiab);
});

apiRouter.put('/liabilities/:id', (req: Request, res: Response) => {
  const updated = db.update('liabilities', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Liability not found' });
  res.json(updated);
});

apiRouter.delete('/liabilities/:id', (req: Request, res: Response) => {
  const success = db.delete('liabilities', req.params.id);
  if (!success) return res.status(404).json({ error: 'Liability not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== TASKS ===================
apiRouter.get('/tasks', (req: Request, res: Response) => {
  res.json(db.getCollection('tasks'));
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const newTask = db.insert('tasks', req.body, 'tsk');
  res.status(201).json(newTask);
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  const updated = db.update('tasks', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const success = db.delete('tasks', req.params.id);
  if (!success) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Deleted successfully' });
});

// =================== LOGS ===================
apiRouter.get('/logs', (req: Request, res: Response) => {
  res.json(db.getCollection('logs'));
});

// =================== BACKUPS ===================
apiRouter.get('/backups', (req: Request, res: Response) => {
  res.json(db.getCollection('backups'));
});

apiRouter.get('/backups/export', (req: Request, res: Response) => {
  const json = db.exportFullJSON();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="pgg_backup_${Date.now()}.json"`);
  res.send(json);
});

apiRouter.post('/backups/restore', (req: Request, res: Response) => {
  const success = db.restoreFromJSON(JSON.stringify(req.body));
  if (!success) return res.status(400).json({ error: 'Invalid JSON data' });
  res.json({ message: 'Restored successfully' });
});

apiRouter.post('/backups/reset', (req: Request, res: Response) => {
  const data = db.resetToDefault();
  res.json({ message: 'Database reset to default', data });
});

// =================== VISITOR PINGS ===================
apiRouter.get('/pings', (req: Request, res: Response) => {
  res.json(db.getCollection('pings'));
});

apiRouter.post('/pings/record', (req: Request, res: Response) => {
  const { city, countryName, countryCode, lat, lng } = req.body;
  const pings = db.getCollection('pings');
  const existing = pings.find(p => p.city.toLowerCase() === city.toLowerCase() && p.countryCode === countryCode);

  if (existing) {
    existing.viewsCount += 1;
    existing.timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    res.json(existing);
  } else {
    const newPing = db.insert('pings', {
      ip: req.ip || '197.214.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
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
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const result = createAdminSession(req.body?.email, req.body?.password);
  if ('error' in result) return res.status(result.status).json({ error: result.error });
  res.json(result);
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const users = db.getCollection('users');

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role: 'follower',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    twoFactorEnabled: false
  };

  users.push(newUser);
  res.status(201).json({ user: newUser });
});

apiRouter.get('/auth/session', (req: Request, res: Response) => {
  const user = getAdminSession(getBearerToken(req.header('authorization')));
  if (!user) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  res.json({ user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  revokeAdminSession(getBearerToken(req.header('authorization')));
  res.json({ message: 'Sessão terminada.' });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json(db.getCollection('users').map(user => sanitizeUser(user)));
});

apiRouter.post('/auth/users', (req: Request, res: Response) => {
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
  if (db.getCollection('users').some(user => user.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(409).json({ error: 'Já existe um utilizador com este e-mail.' });
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'A palavra-passe deve ter entre 12 e 128 caracteres.' });
  }

  const credentials = createPasswordCredentials(password);
  const newUser = db.insert<StoredUser>('users', {
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
  db.addLog('Criação de Utilizador de Gestão', 'Configurações', `Criada conta para ${newUser.email}`, currentUser.name);
  res.status(201).json(sanitizeUser(newUser));
});

apiRouter.put('/auth/users/:id', (req: Request, res: Response) => {
  const currentUser = res.locals.adminUser as User | undefined;
  if (!currentUser || !isRootAdmin(currentUser)) return res.status(403).json({ error: 'Apenas o administrador principal pode gerir utilizadores.' });

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const existingUser = db.findById<StoredUser>('users', userId);
  if (!existingUser) return res.status(404).json({ error: 'Utilizador não encontrado.' });

  const { name, email, role, phone, avatar, twoFactorEnabled, isActive, password } = req.body || {};
  const isRootAccount = isRootAdmin(existingUser);
  if (isRootAccount) {
    if (
      email?.trim().toLowerCase() !== ROOT_ADMIN_EMAIL ||
      role !== 'admin' ||
      isActive === false ||
      password ||
      req.body?.adminPermissions !== undefined
    ) {
      return res.status(403).json({ error: 'A conta principal e os seus privilégios não podem ser alterados.' });
    }
    if (
      typeof name !== 'string' || !name.trim() || name.trim().length > 120 ||
      !isValidAvatar(avatar) ||
      (phone !== undefined && (typeof phone !== 'string' || phone.length > 40)) ||
      (twoFactorEnabled !== undefined && typeof twoFactorEnabled !== 'boolean')
    ) {
      return res.status(400).json({ error: 'Verifique os dados do utilizador.' });
    }
    const updatedRoot = db.update<StoredUser>('users', existingUser.id, {
      name: name.trim(),
      phone: phone?.trim() || undefined,
      avatar: avatar || undefined,
      twoFactorEnabled: twoFactorEnabled ?? existingUser.twoFactorEnabled
    });
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
  if (db.getCollection('users').some(user =>
    user.id !== existingUser.id && user.email.toLowerCase() === email.trim().toLowerCase()
  )) {
    return res.status(409).json({ error: 'Já existe um utilizador com este e-mail.' });
  }
  if (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 12 || password.length > 128)) {
    return res.status(400).json({ error: 'A palavra-passe deve ter entre 12 e 128 caracteres.' });
  }
  if (!existingUser.passwordHash && !password) {
    return res.status(400).json({ error: 'Defina uma palavra-passe inicial para esta conta de gestão.' });
  }

  const credentials = password ? createPasswordCredentials(password) : {};
  const updatedUser = db.update<StoredUser>('users', existingUser.id, {
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
  db.addLog('Edição de Privilégios', 'Configurações', `Atualizada conta ${existingUser.email}`, currentUser.name);
  res.json(sanitizeUser(updatedUser || existingUser));
});

apiRouter.delete('/auth/users/:id', (req: Request, res: Response) => {
  const currentUser = res.locals.adminUser as User | undefined;
  if (!currentUser || !isRootAdmin(currentUser)) return res.status(403).json({ error: 'Apenas o administrador principal pode gerir utilizadores.' });

  const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const user = db.findById<StoredUser>('users', userId);
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
  if (isRootAdmin(user) || user.id === currentUser.id) {
    return res.status(403).json({ error: 'A conta principal ou a sessão atual não pode ser eliminada.' });
  }

  db.delete('users', user.id);
  revokeUserSessions(user.id);
  db.addLog('Eliminação de Utilizador de Gestão', 'Configurações', `Removida conta ${user.email}`, currentUser.name);
  res.json({ message: 'Utilizador removido.' });
});
