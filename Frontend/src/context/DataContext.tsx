import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Article,
  Video,
  Artist,
  CarouselSlide,
  Department,
  DepartmentCode,
  Staff,
  ScheduleEntry,
  CoverageRequest,
  Partnership,
  MusicRequest,
  Bookmark,
  FinanceEntry,
  Asset,
  Liability,
  Task,
  SystemLog,
  Backup,
  SiteSetting,
  VisitorPing
} from '../types';

import {
  initialSiteSettings,
  initialCarouselSlides,
  initialArticles,
  initialVideos,
  initialArtists,
  initialDepartments,
  initialStaff,
  initialSchedules,
  initialCoverageRequests,
  initialPartnerships,
  initialMusicRequests,
  initialFinanceEntries,
  initialAssets,
  initialLiabilities,
  initialTasks,
  initialSystemLogs,
  initialBackups,
  initialVisitorPings
} from '../data/mockData';

interface DataContextType {
  // Models
  siteSettings: SiteSetting;
  updateSiteSettings: (data: Partial<SiteSetting>) => void;

  carouselSlides: CarouselSlide[];
  addCarouselSlide: (slide: Omit<CarouselSlide, 'id'>) => void;
  updateCarouselSlide: (id: string, slide: Partial<CarouselSlide>) => void;
  deleteCarouselSlide: (id: string) => void;

  articles: Article[];
  addArticle: (art: Omit<Article, 'id' | 'views'>) => void;
  updateArticle: (id: string, art: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (id: string) => void;

  videos: Video[];
  addVideo: (vid: Omit<Video, 'id' | 'views'>) => void;
  updateVideo: (id: string, vid: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  incrementVideoViews: (id: string) => void;

  artists: Artist[];
  addArtist: (art: Omit<Artist, 'id'>) => void;
  updateArtist: (id: string, art: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;

  departments: Department[];
  updateDepartment: (id: string, dept: Partial<Department>) => void;

  staff: Staff[];
  addStaff: (stf: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, stf: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  schedules: ScheduleEntry[];
  addSchedule: (sch: Omit<ScheduleEntry, 'id'>) => void;
  updateSchedule: (id: string, sch: Partial<ScheduleEntry>) => void;
  deleteSchedule: (id: string) => void;

  coverageRequests: CoverageRequest[];
  addCoverageRequest: (req: Omit<CoverageRequest, 'id' | 'status' | 'createdAt'>) => CoverageRequest;
  updateCoverageRequest: (id: string, req: Partial<CoverageRequest>) => void;
  deleteCoverageRequest: (id: string) => void;
  approveCoverageAndCreateSchedule: (requestId: string, staffId: string, assignedDate?: string, assignedTime?: string) => void;

  partnerships: Partnership[];
  addPartnership: (part: Omit<Partnership, 'id'>) => void;
  updatePartnership: (id: string, part: Partial<Partnership>) => void;
  deletePartnership: (id: string) => void;

  musicRequests: MusicRequest[];
  addMusicRequest: (
    req: Omit<MusicRequest, 'id' | 'status'>,
    files?: { audio?: File; coverImage?: File }
  ) => Promise<MusicRequest>;
  updateMusicRequest: (id: string, req: Partial<MusicRequest>) => void;
  deleteMusicRequest: (id: string) => void;

  bookmarks: Bookmark[];
  toggleBookmark: (userId: string, articleId: string) => boolean;
  isBookmarked: (userId: string, articleId: string) => boolean;
  getUserBookmarks: (userId: string) => Article[];

  finances: FinanceEntry[];
  addFinanceEntry: (fin: Omit<FinanceEntry, 'id'>) => void;
  updateFinanceEntry: (id: string, fin: Partial<FinanceEntry>) => void;
  deleteFinanceEntry: (id: string) => void;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;

  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  totalAssetsValue: number;

  liabilities: Liability[];
  addLiability: (liab: Omit<Liability, 'id'>) => void;
  updateLiability: (id: string, liab: Partial<Liability>) => void;
  deleteLiability: (id: string) => void;
  totalLiabilitiesValue: number;

  tasks: Task[];
  addTask: (tsk: Omit<Task, 'id'>) => void;
  updateTask: (id: string, tsk: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  systemLogs: SystemLog[];
  addLog: (action: string, module: string, details: string, user?: string) => void;

  backups: Backup[];
  addBackup: (type: Backup['type'], user?: string) => void;
  restoreFromJSON: (jsonData: string) => boolean;
  exportDatabaseJSON: () => string;
  resetToDefaultData: () => void;

  visitorPings: VisitorPing[];
  registerVisitorPing: (city: string, countryName: string, countryCode: string, lat: number, lng: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`pgg_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`pgg_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save pgg_${key}`, e);
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSetting>(() => loadStorage('settings', initialSiteSettings));
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => loadStorage('slides', initialCarouselSlides));
  const [articles, setArticles] = useState<Article[]>(() => loadStorage('articles', initialArticles));
  const [videos, setVideos] = useState<Video[]>(() => loadStorage('videos', initialVideos));
  const [artists, setArtists] = useState<Artist[]>(() => loadStorage('artists', initialArtists));
  const [departments, setDepartments] = useState<Department[]>(() => loadStorage('departments', initialDepartments));
  const [staff, setStaff] = useState<Staff[]>(() => loadStorage('staff', initialStaff));
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(() => loadStorage('schedules', initialSchedules));
  const [coverageRequests, setCoverageRequests] = useState<CoverageRequest[]>(() => loadStorage('coverage', initialCoverageRequests));
  const [partnerships, setPartnerships] = useState<Partnership[]>(() => loadStorage('partnerships', initialPartnerships));
  const [musicRequests, setMusicRequests] = useState<MusicRequest[]>(() => loadStorage('music_reqs', initialMusicRequests));
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadStorage('bookmarks', [
    { id: 'bm-1', userId: 'usr_admin_1', articleId: 'news-1', savedAt: '2026-11-18' }
  ]));
  const [finances, setFinances] = useState<FinanceEntry[]>(() => loadStorage('finances', initialFinanceEntries));
  const [assets, setAssets] = useState<Asset[]>(() => loadStorage('assets', initialAssets));
  const [liabilities, setLiabilities] = useState<Liability[]>(() => loadStorage('liabilities', initialLiabilities));
  const [tasks, setTasks] = useState<Task[]>(() => loadStorage('tasks', initialTasks));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => loadStorage('logs', initialSystemLogs));
  const [backups, setBackups] = useState<Backup[]>(() => loadStorage('backups', initialBackups));
  const [visitorPings, setVisitorPings] = useState<VisitorPing[]>(() => loadStorage('pings', initialVisitorPings));

  // Sync to localStorage
  useEffect(() => saveStorage('settings', siteSettings), [siteSettings]);
  useEffect(() => saveStorage('slides', carouselSlides), [carouselSlides]);
  useEffect(() => saveStorage('articles', articles), [articles]);
  useEffect(() => saveStorage('videos', videos), [videos]);
  useEffect(() => saveStorage('artists', artists), [artists]);
  useEffect(() => saveStorage('departments', departments), [departments]);
  useEffect(() => saveStorage('staff', staff), [staff]);
  useEffect(() => saveStorage('schedules', schedules), [schedules]);
  useEffect(() => saveStorage('coverage', coverageRequests), [coverageRequests]);
  useEffect(() => saveStorage('partnerships', partnerships), [partnerships]);
  useEffect(() => saveStorage('music_reqs', musicRequests), [musicRequests]);
  useEffect(() => saveStorage('bookmarks', bookmarks), [bookmarks]);
  useEffect(() => saveStorage('finances', finances), [finances]);
  useEffect(() => saveStorage('assets', assets), [assets]);
  useEffect(() => saveStorage('liabilities', liabilities), [liabilities]);
  useEffect(() => saveStorage('tasks', tasks), [tasks]);
  useEffect(() => saveStorage('logs', systemLogs), [systemLogs]);
  useEffect(() => saveStorage('backups', backups), [backups]);
  useEffect(() => saveStorage('pings', visitorPings), [visitorPings]);

  // Initial Sync from Backend API (if online)
  useEffect(() => {
    async function syncFromBackend() {
      try {
        const health = await api.checkHealth();
        if (!health) return;

        const [
          remoteSettings,
          remoteSlides,
          remoteArticles,
          remoteVideos,
          remoteArtists,
          remoteDepartments,
          remoteStaff,
          remoteSchedules,
          remoteCoverage,
          remotePartnerships,
          remoteMusic,
          remoteFinances,
          remoteAssets,
          remoteLiabilities,
          remoteTasks,
          remoteLogs,
          remoteBackups,
          remotePings
        ] = await Promise.all([
          api.getSettings(),
          api.getCarouselSlides(),
          api.getArticles(),
          api.getVideos(),
          api.getArtists(),
          api.getDepartments(),
          api.getStaff(),
          api.getSchedules(),
          api.getCoverageRequests(),
          api.getPartnerships(),
          api.getMusicRequests(),
          api.getFinances(),
          api.getAssets(),
          api.getLiabilities(),
          api.getTasks(),
          api.getLogs(),
          api.getBackups(),
          api.getPings()
        ]);

        if (remoteSettings) setSiteSettings(remoteSettings);
        if (remoteSlides && remoteSlides.length > 0) setCarouselSlides(remoteSlides);
        if (remoteArticles && remoteArticles.length > 0) setArticles(remoteArticles);
        if (remoteVideos && remoteVideos.length > 0) setVideos(remoteVideos);
        if (remoteArtists && remoteArtists.length > 0) setArtists(remoteArtists);
        if (remoteDepartments && remoteDepartments.length > 0) setDepartments(remoteDepartments);
        if (remoteStaff && remoteStaff.length > 0) setStaff(remoteStaff);
        if (remoteSchedules && remoteSchedules.length > 0) setSchedules(remoteSchedules);
        if (remoteCoverage && remoteCoverage.length > 0) setCoverageRequests(remoteCoverage);
        if (remotePartnerships && remotePartnerships.length > 0) setPartnerships(remotePartnerships);
        if (remoteMusic && remoteMusic.length > 0) setMusicRequests(remoteMusic);
        if (remoteFinances && remoteFinances.length > 0) setFinances(remoteFinances);
        if (remoteAssets && remoteAssets.length > 0) setAssets(remoteAssets);
        if (remoteLiabilities && remoteLiabilities.length > 0) setLiabilities(remoteLiabilities);
        if (remoteTasks && remoteTasks.length > 0) setTasks(remoteTasks);
        if (remoteLogs && remoteLogs.length > 0) setSystemLogs(remoteLogs);
        if (remoteBackups && remoteBackups.length > 0) setBackups(remoteBackups);
        if (remotePings && remotePings.length > 0) setVisitorPings(remotePings);
      } catch (err) {
        console.debug('Backend sync skipped, running on local storage:', err);
      }
    }

    syncFromBackend();
  }, []);

  // Logging helper
  const addLog = (action: string, module: string, details: string, user: string = 'Pr. Daniel Sanhá') => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      action,
      module,
      ip: '197.214.12.84 (Bissau)',
      details
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Site Settings
  const updateSiteSettings = (data: Partial<SiteSetting>) => {
    setSiteSettings(prev => ({ ...prev, ...data }));
    addLog('Atualização de Definições', 'Configurações', 'Alteração dos parâmetros gerais do portal');
  };

  // Carousel
  const addCarouselSlide = (slide: Omit<CarouselSlide, 'id'>) => {
    const newSlide: CarouselSlide = { ...slide, id: `slide_${Date.now()}` };
    setCarouselSlides(prev => [...prev, newSlide]);
    addLog('Criação de Slide', 'Carrossel', `Adicionado slide: ${newSlide.title_pt}`);
  };

  const updateCarouselSlide = (id: string, slide: Partial<CarouselSlide>) => {
    setCarouselSlides(prev => prev.map(s => (s.id === id ? { ...s, ...slide } : s)));
    addLog('Edição de Slide', 'Carrossel', `Atualizado slide ${id}`);
  };

  const deleteCarouselSlide = (id: string) => {
    setCarouselSlides(prev => prev.filter(s => s.id !== id));
    addLog('Eliminação de Slide', 'Carrossel', `Removido slide ${id}`);
  };

  // Articles
  const addArticle = (art: Omit<Article, 'id' | 'views'>) => {
    const newArt: Article = { ...art, id: `news-${Date.now()}`, views: 0 };
    setArticles(prev => [newArt, ...prev]);
    addLog('Criação de Artigo', 'Notícias', `Publicado: ${newArt.title_pt}`);
    api.createArticle(newArt).catch(() => {});
  };

  const updateArticle = (id: string, art: Partial<Article>) => {
    setArticles(prev => prev.map(a => (a.id === id ? { ...a, ...art } : a)));
    addLog('Edição de Artigo', 'Notícias', `Atualizado artigo ${id}`);
    api.updateArticle(id, art).catch(() => {});
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    addLog('Eliminação de Artigo', 'Notícias', `Removido artigo ${id}`);
    api.deleteArticle(id).catch(() => {});
  };

  const incrementArticleViews = (id: string) => {
    setArticles(prev => prev.map(a => (a.id === id ? { ...a, views: a.views + 1 } : a)));
    api.recordArticleView(id).catch(() => {});
  };

  // Videos
  const addVideo = (vid: Omit<Video, 'id' | 'views'>) => {
    const newVid: Video = { ...vid, id: `vid-${Date.now()}`, views: 0 };
    setVideos(prev => [newVid, ...prev]);
    addLog('Criação de Vídeo', 'Vídeos', `Adicionado vídeo: ${newVid.title_pt}`);
    api.createVideo(newVid).catch(() => {});
  };

  const updateVideo = (id: string, vid: Partial<Video>) => {
    setVideos(prev => prev.map(v => (v.id === id ? { ...v, ...vid } : v)));
    addLog('Edição de Vídeo', 'Vídeos', `Atualizado vídeo ${id}`);
    api.updateVideo(id, vid).catch(() => {});
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    addLog('Eliminação de Vídeo', 'Vídeos', `Removido vídeo ${id}`);
    api.deleteVideo(id).catch(() => {});
  };

  const incrementVideoViews = (id: string) => {
    setVideos(prev => prev.map(v => (v.id === id ? { ...v, views: v.views + 1 } : v)));
    api.recordVideoView(id).catch(() => {});
  };

  // Artists
  const addArtist = (art: Omit<Artist, 'id'>) => {
    const newArt: Artist = { ...art, id: `art-${Date.now()}` };
    setArtists(prev => [...prev, newArt]);
    addLog('Criação de Artista', 'Artistas', `Adicionado artista: ${newArt.name}`);
  };

  const updateArtist = (id: string, art: Partial<Artist>) => {
    setArtists(prev => prev.map(a => (a.id === id ? { ...a, ...art } : a)));
    addLog('Edição de Artista', 'Artistas', `Atualizado artista ${id}`);
  };

  const deleteArtist = (id: string) => {
    setArtists(prev => prev.filter(a => a.id !== id));
    addLog('Eliminação de Artista', 'Artistas', `Removido artista ${id}`);
  };

  // Departments
  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...dept } : d)));
    addLog('Atualização de Departamento', 'Departamentos', `Atualizado departamento ${id}`);
  };

  // Staff
  const addStaff = (stf: Omit<Staff, 'id'>) => {
    const newStaff: Staff = { ...stf, id: `stf-${Date.now()}` };
    setStaff(prev => [...prev, newStaff]);
    addLog('Admissão de Pessoal', 'Recursos Humanos', `Adicionado colaborador: ${newStaff.name}`);
  };

  const updateStaff = (id: string, stf: Partial<Staff>) => {
    setStaff(prev => prev.map(s => (s.id === id ? { ...s, ...stf } : s)));
    addLog('Edição de Pessoal', 'Recursos Humanos', `Atualizada ficha do colaborador ${id}`);
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    addLog('Eliminação de Pessoal', 'Recursos Humanos', `Removido colaborador ${id}`);
  };

  // Schedules
  const addSchedule = (sch: Omit<ScheduleEntry, 'id'>) => {
    const newSch: ScheduleEntry = { ...sch, id: `sch-${Date.now()}` };
    setSchedules(prev => [newSch, ...prev]);
    addLog('Agendamento de Escala', 'Recursos Humanos', `Escala criada: ${newSch.serviceName} para ${newSch.staffName}`);
    void api.createSchedule(newSch).then(saved => {
      if (saved) {
        setSchedules(prev => prev.map(schedule => schedule.id === newSch.id ? saved : schedule));
      }
    });
  };

  const updateSchedule = (id: string, sch: Partial<ScheduleEntry>) => {
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...sch } : s)));
    addLog('Edição de Escala', 'Recursos Humanos', `Atualizado registo de escala ${id}`);
    void api.updateSchedule(id, sch);
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addLog('Eliminação de Escala', 'Recursos Humanos', `Removido registo de escala ${id}`);
    void api.deleteSchedule(id);
  };

  // Coverage Requests & CRITICAL BEHAVIOR:
  // "Pedido de cobertura aprovado gera entrada na escala."
  const addCoverageRequest = (req: Omit<CoverageRequest, 'id' | 'status' | 'createdAt'>): CoverageRequest => {
    const newReq: CoverageRequest = {
      ...req,
      id: `cov-${Date.now()}`,
      status: 'Pendente',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setCoverageRequests(prev => [newReq, ...prev]);
    addLog('Novo Pedido de Cobertura', 'Correspondências', `Recebido pedido de ${newReq.requesterName} (${newReq.eventTitle})`);
    api.createCoverageRequest(newReq).catch(() => {});
    return newReq;
  };

  const updateCoverageRequest = (id: string, req: Partial<CoverageRequest>) => {
    setCoverageRequests(prev => prev.map(r => (r.id === id ? { ...r, ...req } : r)));
    addLog('Edição de Pedido de Cobertura', 'Correspondências', `Atualizado pedido ${id}`);
  };

  const deleteCoverageRequest = (id: string) => {
    setCoverageRequests(prev => prev.filter(r => r.id !== id));
    addLog('Eliminação de Cobertura', 'Correspondências', `Removido pedido ${id}`);
  };

  const approveCoverageAndCreateSchedule = (
    requestId: string,
    staffId: string,
    assignedDate?: string,
    assignedTime?: string
  ) => {
    const request = coverageRequests.find(r => r.id === requestId);
    if (!request) return;

    const assignedStaff = staff.find(s => s.id === staffId) || staff[0];
    const newScheduleId = `sch-cov-${Date.now()}`;

    // 1. Create schedule entry
    const newSchedule: ScheduleEntry = {
      id: newScheduleId,
      serviceName: `Cobertura: ${request.eventTitle} (${request.churchOrEntity})`,
      departmentCode: (assignedStaff.departmentCode as DepartmentCode) || 'REPORTAGEM',
      date: assignedDate || request.eventDate,
      startTime: assignedTime || request.eventTime || '09:00',
      endTime: '13:00',
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      staffIds: [assignedStaff.id],
      staffNames: [assignedStaff.name],
      status: 'Pendente',
      notes: `Gerado automaticamente por aprovação do pedido ${request.id}. Contacto: ${request.requesterName} (${request.requesterPhone})`,
      location: request.location,
      coverageRequestId: request.id
    };

    setSchedules(prev => [newSchedule, ...prev]);

    // 2. Mark request as Approved with schedule link
    setCoverageRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'Aprovado', scheduleEntryId: newScheduleId }
          : r
      )
    );

    addLog(
      'Aprovação & Escala Gerada',
      'Correspondências',
      `Pedido "${request.eventTitle}" aprovado e atribuído a ${assignedStaff.name} na escala`
    );

    api.approveCoverageAndSchedule(requestId, staffId, assignedDate, assignedTime).catch(() => {});
  };

  // Partnerships
  const addPartnership = (part: Omit<Partnership, 'id'>) => {
    const newPart: Partnership = { ...part, id: `part-${Date.now()}` };
    setPartnerships(prev => [...prev, newPart]);
    addLog('Nova Parceria', 'Correspondências', `Acordo com ${newPart.partnerName}`);
  };

  const updatePartnership = (id: string, part: Partial<Partnership>) => {
    setPartnerships(prev => prev.map(p => (p.id === id ? { ...p, ...part } : p)));
    addLog('Edição de Parceria', 'Correspondências', `Atualizada parceria ${id}`);
  };

  const deletePartnership = (id: string) => {
    setPartnerships(prev => prev.filter(p => p.id !== id));
    addLog('Eliminação de Parceria', 'Correspondências', `Removida parceria ${id}`);
  };

  // Music Requests
  const addMusicRequest = async (
    req: Omit<MusicRequest, 'id' | 'status'>,
    files?: { audio?: File; coverImage?: File }
  ): Promise<MusicRequest> => {
    const newReq = await api.createMusicRequest(req, files);
    setMusicRequests(prev => [newReq, ...prev]);
    addLog('Submissão da Zona do Artista', 'Correspondências', `Novo pedido de ${newReq.artistName} - "${newReq.songTitle}"`);
    return newReq;
  };

  const updateMusicRequest = (id: string, req: Partial<MusicRequest>) => {
    setMusicRequests(prev => prev.map(r => (r.id === id ? { ...r, ...req } : r)));
    addLog('Edição de Pedido de Música', 'Correspondências', `Atualizado pedido ${id}`);
  };

  const deleteMusicRequest = (id: string) => {
    setMusicRequests(prev => prev.filter(r => r.id !== id));
    addLog('Eliminação de Pedido de Música', 'Correspondências', `Removido pedido ${id}`);
  };

  // Bookmarks (Zona do Seguidor)
  const toggleBookmark = (userId: string, articleId: string): boolean => {
    const exists = bookmarks.some(b => b.userId === userId && b.articleId === articleId);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.userId === userId && b.articleId === articleId)));
      return false;
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        userId,
        articleId,
        savedAt: new Date().toISOString().substring(0, 10)
      };
      setBookmarks(prev => [newBm, ...prev]);
      return true;
    }
  };

  const isBookmarked = (userId: string, articleId: string): boolean => {
    return bookmarks.some(b => b.userId === userId && b.articleId === articleId);
  };

  const getUserBookmarks = (userId: string): Article[] => {
    const userBmArticleIds = bookmarks.filter(b => b.userId === userId).map(b => b.articleId);
    return articles.filter(a => userBmArticleIds.includes(a.id));
  };

  // Finances
  const addFinanceEntry = (fin: Omit<FinanceEntry, 'id'>) => {
    const newFin: FinanceEntry = { ...fin, id: `fin-${Date.now()}` };
    setFinances(prev => [newFin, ...prev]);
    addLog('Lançamento Financeiro', 'Finanças', `${newFin.type}: ${newFin.amount.toLocaleString()} XOF (${newFin.category})`);
    api.createFinanceEntry(newFin).catch(() => {});
  };

  const updateFinanceEntry = (id: string, fin: Partial<FinanceEntry>) => {
    setFinances(prev => prev.map(f => (f.id === id ? { ...f, ...fin } : f)));
    addLog('Edição Financeira', 'Finanças', `Atualizado movimento ${id}`);
    api.updateFinanceEntry(id, fin).catch(() => {});
  };

  const deleteFinanceEntry = (id: string) => {
    setFinances(prev => prev.filter(f => f.id !== id));
    addLog('Eliminação Financeira', 'Finanças', `Removido movimento ${id}`);
    api.deleteFinanceEntry(id).catch(() => {});
  };

  const totalIncome = finances
    .filter(f => f.type === 'Entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'Saída')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Assets
  const addAsset = (asset: Omit<Asset, 'id'>) => {
    const newAst: Asset = { ...asset, id: `ast-${Date.now()}` };
    setAssets(prev => [...prev, newAst]);
    addLog('Registo de Ativo', 'Património', `Ativo adicionado: ${newAst.name}`);
  };

  const updateAsset = (id: string, asset: Partial<Asset>) => {
    setAssets(prev => prev.map(a => (a.id === id ? { ...a, ...asset } : a)));
    addLog('Edição de Ativo', 'Património', `Atualizado ativo ${id}`);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    addLog('Eliminação de Ativo', 'Património', `Removido ativo ${id}`);
  };

  const totalAssetsValue = assets.reduce((acc, curr) => acc + curr.acquisitionCost, 0);

  // Liabilities
  const addLiability = (liab: Omit<Liability, 'id'>) => {
    const newLiab: Liability = { ...liab, id: `liab-${Date.now()}` };
    setLiabilities(prev => [...prev, newLiab]);
    addLog('Registo de Passivo', 'Património', `Dívida registada: ${newLiab.creditor} (${newLiab.amount} XOF)`);
  };

  const updateLiability = (id: string, liab: Partial<Liability>) => {
    setLiabilities(prev => prev.map(l => (l.id === id ? { ...l, ...liab } : l)));
    addLog('Edição de Passivo', 'Património', `Atualizado passivo ${id}`);
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
    addLog('Eliminação de Passivo', 'Património', `Removido passivo ${id}`);
  };

  const totalLiabilitiesValue = liabilities
    .filter(l => l.status !== 'Pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Tasks
  const addTask = (tsk: Omit<Task, 'id'>) => {
    const newTask: Task = { ...tsk, id: `tsk-${Date.now()}` };
    setTasks(prev => [newTask, ...prev]);
    addLog('Nova Tarefa', 'Painel Geral', `Tarefa atribuída a ${newTask.assignedTo}: ${newTask.title}`);
  };

  const updateTask = (id: string, tsk: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...tsk } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Backups
  const addBackup = (type: Backup['type'], user: string = 'Pr. Daniel Sanhá') => {
    const dateStr = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const newBkp: Backup = {
      id: `bkp-${Date.now()}`,
      filename: `pgg_backup_${type.toLowerCase()}_${Date.now()}.json`,
      date: dateStr,
      size: `${(Math.random() * 0.8 + 0.5).toFixed(2)} MB`,
      type,
      recordsCount: articles.length + finances.length + staff.length + assets.length,
      createdBy: user
    };
    setBackups(prev => [newBkp, ...prev]);
    addLog('Backup Executado', 'Configurações', `Gerada cópia de segurança "${newBkp.filename}"`);
  };

  const exportDatabaseJSON = (): string => {
    const fullData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      siteSettings,
      carouselSlides,
      articles,
      videos,
      artists,
      departments,
      staff,
      schedules,
      coverageRequests,
      partnerships,
      musicRequests,
      finances,
      assets,
      liabilities,
      tasks,
      visitorPings
    };
    return JSON.stringify(fullData, null, 2);
  };

  const restoreFromJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.siteSettings) setSiteSettings(parsed.siteSettings);
      if (parsed.carouselSlides) setCarouselSlides(parsed.carouselSlides);
      if (parsed.articles) setArticles(parsed.articles);
      if (parsed.videos) setVideos(parsed.videos);
      if (parsed.artists) setArtists(parsed.artists);
      if (parsed.departments) setDepartments(parsed.departments);
      if (parsed.staff) setStaff(parsed.staff);
      if (parsed.schedules) setSchedules(parsed.schedules);
      if (parsed.coverageRequests) setCoverageRequests(parsed.coverageRequests);
      if (parsed.partnerships) setPartnerships(parsed.partnerships);
      if (parsed.musicRequests) setMusicRequests(parsed.musicRequests);
      if (parsed.finances) setFinances(parsed.finances);
      if (parsed.assets) setAssets(parsed.assets);
      if (parsed.liabilities) setLiabilities(parsed.liabilities);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.visitorPings) setVisitorPings(parsed.visitorPings);
      addLog('Restauro de Dados', 'Configurações', 'Base de dados restaurada com sucesso a partir de ficheiro JSON');
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    setSiteSettings(initialSiteSettings);
    setCarouselSlides(initialCarouselSlides);
    setArticles(initialArticles);
    setVideos(initialVideos);
    setArtists(initialArtists);
    setDepartments(initialDepartments);
    setStaff(initialStaff);
    setSchedules(initialSchedules);
    setCoverageRequests(initialCoverageRequests);
    setPartnerships(initialPartnerships);
    setMusicRequests(initialMusicRequests);
    setFinances(initialFinanceEntries);
    setAssets(initialAssets);
    setLiabilities(initialLiabilities);
    setTasks(initialTasks);
    setSystemLogs(initialSystemLogs);
    setBackups(initialBackups);
    setVisitorPings(initialVisitorPings);
    addLog('Reinicialização Completa', 'Configurações', 'Dados redefinidos para os valores de demonstração originais');
  };

  // Visitor Pings (Access Map & Realtime Counters)
  const registerVisitorPing = (city: string, countryName: string, countryCode: string, lat: number, lng: number) => {
    setVisitorPings(prev => {
      const existing = prev.find(p => p.city.toLowerCase() === city.toLowerCase() && p.countryCode === countryCode);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, viewsCount: p.viewsCount + 1, timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ') } : p);
      } else {
        const newPing: VisitorPing = {
          id: `ping-${Date.now()}`,
          ip: '197.214.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
          city,
          countryName,
          countryCode,
          lat,
          lng,
          timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
          viewsCount: 1
        };
        return [...prev, newPing];
      }
    });

    setSiteSettings(prev => ({
      ...prev,
      totalVisitorsCount: prev.totalVisitorsCount + 1
    }));

    api.recordPing({ city, countryName, countryCode, lat, lng }).catch(() => {});
  };

  return (
    <DataContext.Provider
      value={{
        siteSettings,
        updateSiteSettings,
        carouselSlides,
        addCarouselSlide,
        updateCarouselSlide,
        deleteCarouselSlide,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        incrementArticleViews,
        videos,
        addVideo,
        updateVideo,
        deleteVideo,
        incrementVideoViews,
        artists,
        addArtist,
        updateArtist,
        deleteArtist,
        departments,
        updateDepartment,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        coverageRequests,
        addCoverageRequest,
        updateCoverageRequest,
        deleteCoverageRequest,
        approveCoverageAndCreateSchedule,
        partnerships,
        addPartnership,
        updatePartnership,
        deletePartnership,
        musicRequests,
        addMusicRequest,
        updateMusicRequest,
        deleteMusicRequest,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        getUserBookmarks,
        finances,
        addFinanceEntry,
        updateFinanceEntry,
        deleteFinanceEntry,
        totalIncome,
        totalExpense,
        currentBalance,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        totalAssetsValue,
        liabilities,
        addLiability,
        updateLiability,
        deleteLiability,
        totalLiabilitiesValue,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        systemLogs,
        addLog,
        backups,
        addBackup,
        restoreFromJSON,
        exportDatabaseJSON,
        resetToDefaultData,
        visitorPings,
        registerVisitorPing
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
