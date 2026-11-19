import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import {
  Article,
  Video,
  Artist,
  CarouselSlide,
  Department,
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

interface DataContextType {
  dataReady: boolean;
  dataLoadError: string | null;
  operationError: string | null;
  clearOperationError: () => void;
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
  addCoverageRequest: (req: Omit<CoverageRequest, 'id' | 'status' | 'createdAt'>) => Promise<CoverageRequest>;
  updateCoverageRequest: (id: string, req: Partial<CoverageRequest>) => void;
  deleteCoverageRequest: (id: string) => void;
  approveCoverageAndCreateSchedule: (requestId: string, staffId: string, assignedDate?: string, assignedTime?: string) => Promise<void>;

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
  toggleBookmark: (userId: string, articleId: string) => Promise<boolean>;
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
  addBackup: (type: Backup['type'], user?: string) => Promise<void>;
  restoreFromJSON: (jsonData: string) => Promise<void>;
  exportDatabaseJSON: () => Promise<string>;

  visitorPings: VisitorPing[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSetting>({
    portalName: '',
    slogan_pt: '',
    slogan_en: '',
    slogan_fr: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    defaultLanguage: 'pt',
    maintenanceMode: false,
    totalVisitorsCount: 0
  });
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [coverageRequests, setCoverageRequests] = useState<CoverageRequest[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [musicRequests, setMusicRequests] = useState<MusicRequest[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [finances, setFinances] = useState<FinanceEntry[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [visitorPings, setVisitorPings] = useState<VisitorPing[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { currentUser, isAdmin } = useAuth();

  const clearOperationError = () => setOperationError(null);
  const reportOperationError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'O pedido não foi concluído.';
    console.error('[PGG] Operação falhou:', error);
    setOperationError(message);
  };

  const persist = async <T,>(request: Promise<T>, onSuccess: (result: T) => void): Promise<void> => {
    try {
      onSuccess(await request);
    } catch (error) {
      reportOperationError(error);
    }
  };

  useEffect(() => {
    let active = true;
    async function syncFromBackend() {
      setDataReady(false);
      setDataLoadError(null);
      setBookmarks([]);
      try {
        const [
          remoteSettings,
          remoteSlides,
          remoteArticles,
          remoteVideos,
          remoteArtists,
          remotePings
        ] = await Promise.all([
          api.getSettings(),
          api.getCarouselSlides(),
          api.getArticles(),
          api.getVideos(),
          api.getArtists(),
          api.getPings()
        ]);

        if (!active) return;
        setSiteSettings(remoteSettings);
        setCarouselSlides(remoteSlides);
        setArticles(remoteArticles);
        setVideos(remoteVideos);
        setArtists(remoteArtists);
        setVisitorPings(remotePings);

        if (currentUser) {
          const remoteBookmarks = await api.getUserBookmarks(currentUser.id);
          if (active) setBookmarks(remoteBookmarks.bookmarks);
        }

        if (isAdmin) {
          const [
            remoteDepartments, remoteStaff, remoteSchedules, remoteCoverage,
            remotePartnerships, remoteMusic, remoteFinances, remoteAssets,
            remoteLiabilities, remoteTasks, remoteLogs, remoteBackups
          ] = await Promise.all([
            api.getDepartments(), api.getStaff(), api.getSchedules(), api.getCoverageRequests(),
            api.getPartnerships(), api.getMusicRequests(), api.getFinances(), api.getAssets(),
            api.getLiabilities(), api.getTasks(), api.getLogs(), api.getBackups()
          ]);
          if (!active) return;
          setDepartments(remoteDepartments);
          setStaff(remoteStaff);
          setSchedules(remoteSchedules);
          setCoverageRequests(remoteCoverage);
          setPartnerships(remotePartnerships);
          setMusicRequests(remoteMusic);
          setFinances(remoteFinances);
          setAssets(remoteAssets);
          setLiabilities(remoteLiabilities);
          setTasks(remoteTasks);
          setSystemLogs(remoteLogs);
          setBackups(remoteBackups);
        } else {
          setDepartments([]);
          setStaff([]);
          setSchedules([]);
          setCoverageRequests([]);
          setPartnerships([]);
          setMusicRequests([]);
          setFinances([]);
          setAssets([]);
          setLiabilities([]);
          setTasks([]);
          setSystemLogs([]);
          setBackups([]);
        }
        if (active) setDataReady(true);
      } catch (err) {
        console.error('Não foi possível carregar os dados do portal:', err);
        if (active) setDataLoadError(err instanceof Error ? err.message : 'Não foi possível carregar os dados do servidor.');
      }
    }

    syncFromBackend();
    return () => { active = false; };
  }, [currentUser?.id, isAdmin]);

  const addLog = (action: string, module: string, details: string, user = 'Sistema') => {
    void persist(api.createLog({ action, module, details, user }), log => setSystemLogs(prev => [log, ...prev]));
  };

  const updateSiteSettings = (data: Partial<SiteSetting>) => {
    void persist(api.updateSettings(data), setSiteSettings);
  };

  const addCarouselSlide = (slide: Omit<CarouselSlide, 'id'>) => {
    void persist(api.createCarouselSlide(slide), item => setCarouselSlides(prev => [...prev, item]));
  };
  const updateCarouselSlide = (id: string, slide: Partial<CarouselSlide>) => {
    void persist(api.updateCarouselSlide(id, slide), item => setCarouselSlides(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteCarouselSlide = (id: string) => {
    void persist(api.deleteCarouselSlide(id), () => setCarouselSlides(prev => prev.filter(row => row.id !== id)));
  };

  const addArticle = (article: Omit<Article, 'id' | 'views'>) => {
    void persist(api.createArticle(article), item => setArticles(prev => [item, ...prev]));
  };
  const updateArticle = (id: string, article: Partial<Article>) => {
    void persist(api.updateArticle(id, article), item => setArticles(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteArticle = (id: string) => {
    void persist(api.deleteArticle(id), () => setArticles(prev => prev.filter(row => row.id !== id)));
  };
  const incrementArticleViews = (id: string) => {
    void persist(api.recordArticleView(id), item => setArticles(prev => prev.map(row => row.id === id ? item : row)));
  };

  const addVideo = (video: Omit<Video, 'id' | 'views'>) => {
    void persist(api.createVideo(video), item => setVideos(prev => [item, ...prev]));
  };
  const updateVideo = (id: string, video: Partial<Video>) => {
    void persist(api.updateVideo(id, video), item => setVideos(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteVideo = (id: string) => {
    void persist(api.deleteVideo(id), () => setVideos(prev => prev.filter(row => row.id !== id)));
  };
  const incrementVideoViews = (id: string) => {
    void persist(api.recordVideoView(id), item => setVideos(prev => prev.map(row => row.id === id ? item : row)));
  };

  const addArtist = (artist: Omit<Artist, 'id'>) => {
    void persist(api.createArtist(artist), item => setArtists(prev => [...prev, item]));
  };
  const updateArtist = (id: string, artist: Partial<Artist>) => {
    void persist(api.updateArtist(id, artist), item => setArtists(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteArtist = (id: string) => {
    void persist(api.deleteArtist(id), () => setArtists(prev => prev.filter(row => row.id !== id)));
  };

  const updateDepartment = (id: string, department: Partial<Department>) => {
    void persist(api.updateDepartment(id, department), item => setDepartments(prev => prev.map(row => row.id === id ? item : row)));
  };

  const addStaff = (member: Omit<Staff, 'id'>) => {
    void persist(api.createStaff(member), item => setStaff(prev => [...prev, item]));
  };
  const updateStaff = (id: string, member: Partial<Staff>) => {
    void persist(api.updateStaff(id, member), item => setStaff(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteStaff = (id: string) => {
    void persist(api.deleteStaff(id), () => setStaff(prev => prev.filter(row => row.id !== id)));
  };

  const addSchedule = (schedule: Omit<ScheduleEntry, 'id'>) => {
    void persist(api.createSchedule(schedule), item => setSchedules(prev => [item, ...prev]));
  };
  const updateSchedule = (id: string, schedule: Partial<ScheduleEntry>) => {
    void persist(api.updateSchedule(id, schedule), item => setSchedules(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteSchedule = (id: string) => {
    void persist(api.deleteSchedule(id), () => setSchedules(prev => prev.filter(row => row.id !== id)));
  };

  const addCoverageRequest = async (
    request: Omit<CoverageRequest, 'id' | 'status' | 'createdAt'>
  ): Promise<CoverageRequest> => {
    const saved = await api.createCoverageRequest(request);
    setCoverageRequests(prev => [saved, ...prev]);
    return saved;
  };
  const updateCoverageRequest = (id: string, request: Partial<CoverageRequest>) => {
    void persist(api.updateCoverageRequest(id, request), item => setCoverageRequests(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteCoverageRequest = (id: string) => {
    void persist(api.deleteCoverageRequest(id), () => setCoverageRequests(prev => prev.filter(row => row.id !== id)));
  };
  const approveCoverageAndCreateSchedule = async (
    requestId: string,
    staffId: string,
    assignedDate?: string,
    assignedTime?: string
  ) => {
    await persist(
      api.approveCoverageAndSchedule(requestId, staffId, assignedDate, assignedTime),
      result => {
        setSchedules(prev => [result.schedule, ...prev]);
        setCoverageRequests(prev => prev.map(row => row.id === requestId ? result.request : row));
      }
    );
  };

  const addPartnership = (partnership: Omit<Partnership, 'id'>) => {
    void persist(api.createPartnership(partnership), item => setPartnerships(prev => [...prev, item]));
  };
  const updatePartnership = (id: string, partnership: Partial<Partnership>) => {
    void persist(api.updatePartnership(id, partnership), item => setPartnerships(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deletePartnership = (id: string) => {
    void persist(api.deletePartnership(id), () => setPartnerships(prev => prev.filter(row => row.id !== id)));
  };

  const addMusicRequest = async (
    request: Omit<MusicRequest, 'id' | 'status'>,
    files?: { audio?: File; coverImage?: File }
  ): Promise<MusicRequest> => {
    const saved = await api.createMusicRequest(request, files);
    setMusicRequests(prev => [saved, ...prev]);
    return saved;
  };
  const updateMusicRequest = (id: string, request: Partial<MusicRequest>) => {
    void persist(api.updateMusicRequest(id, request), item => setMusicRequests(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteMusicRequest = (id: string) => {
    void persist(api.deleteMusicRequest(id), () => setMusicRequests(prev => prev.filter(row => row.id !== id)));
  };

  const toggleBookmark = async (userId: string, articleId: string): Promise<boolean> => {
    try {
      const result = await api.toggleBookmark(userId, articleId);
      setBookmarks(prev => result.bookmark
        ? [result.bookmark, ...prev.filter(item => !(item.userId === userId && item.articleId === articleId))]
        : prev.filter(item => !(item.userId === userId && item.articleId === articleId)));
      return result.bookmarked;
    } catch (error) {
      reportOperationError(error);
      throw error;
    }
  };

  const isBookmarked = (userId: string, articleId: string): boolean => {
    return bookmarks.some(b => b.userId === userId && b.articleId === articleId);
  };

  const getUserBookmarks = (userId: string): Article[] => {
    const userBmArticleIds = bookmarks.filter(b => b.userId === userId).map(b => b.articleId);
    return articles.filter(a => userBmArticleIds.includes(a.id));
  };

  const addFinanceEntry = (finance: Omit<FinanceEntry, 'id'>) => {
    void persist(api.createFinanceEntry(finance), item => setFinances(prev => [item, ...prev]));
  };
  const updateFinanceEntry = (id: string, finance: Partial<FinanceEntry>) => {
    void persist(api.updateFinanceEntry(id, finance), item => setFinances(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteFinanceEntry = (id: string) => {
    void persist(api.deleteFinanceEntry(id), () => setFinances(prev => prev.filter(row => row.id !== id)));
  };

  const totalIncome = finances
    .filter(f => f.type === 'Entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'Saída')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    void persist(api.createAsset(asset), item => setAssets(prev => [...prev, item]));
  };
  const updateAsset = (id: string, asset: Partial<Asset>) => {
    void persist(api.updateAsset(id, asset), item => setAssets(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteAsset = (id: string) => {
    void persist(api.deleteAsset(id), () => setAssets(prev => prev.filter(row => row.id !== id)));
  };

  const totalAssetsValue = assets.reduce((acc, curr) => acc + curr.acquisitionCost, 0);

  const addLiability = (liability: Omit<Liability, 'id'>) => {
    void persist(api.createLiability(liability), item => setLiabilities(prev => [...prev, item]));
  };
  const updateLiability = (id: string, liability: Partial<Liability>) => {
    void persist(api.updateLiability(id, liability), item => setLiabilities(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteLiability = (id: string) => {
    void persist(api.deleteLiability(id), () => setLiabilities(prev => prev.filter(row => row.id !== id)));
  };

  const totalLiabilitiesValue = liabilities
    .filter(l => l.status !== 'Pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const addTask = (task: Omit<Task, 'id'>) => {
    void persist(api.createTask(task), item => setTasks(prev => [item, ...prev]));
  };
  const updateTask = (id: string, task: Partial<Task>) => {
    void persist(api.updateTask(id, task), item => setTasks(prev => prev.map(row => row.id === id ? item : row)));
  };
  const deleteTask = (id: string) => {
    void persist(api.deleteTask(id), () => setTasks(prev => prev.filter(row => row.id !== id)));
  };

  // Backups
  const addBackup = async (type: Backup['type'], user = 'Sistema') => {
    const filename = `pgg_backup_${type.toLowerCase()}_${Date.now()}.json`;
    const json = await api.exportBackup();
    const saved = await api.createBackup({
      filename,
      size: `${new Blob([JSON.stringify(json)]).size} bytes`,
      type,
      recordsCount: Object.values(json).reduce((count: number, value: any) => count + (Array.isArray(value) ? value.length : 0), 0),
      createdBy: user
    });
    setBackups(prev => [saved, ...prev]);
  };

  const exportDatabaseJSON = async (): Promise<string> => JSON.stringify(await api.exportBackup(), null, 2);

  const restoreFromJSON = async (jsonData: string): Promise<void> => {
    const parsed: unknown = JSON.parse(jsonData);
    await api.restoreBackup(parsed);
    window.location.reload();
  };

  return (
    <DataContext.Provider
      value={{
        dataReady,
        dataLoadError,
        operationError,
        clearOperationError,
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
        visitorPings
      }}
    >
      {operationError && (
        <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-lg rounded-xl border border-rose-300 bg-white p-4 text-sm text-rose-800 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <span>{operationError}</span>
            <button type="button" onClick={clearOperationError} className="font-bold" aria-label="Fechar aviso">×</button>
          </div>
        </div>
      )}
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
