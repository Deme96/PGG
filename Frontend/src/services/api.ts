import type { MusicRequest, User } from '../types';

const configuredApiBase = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const API_BASE = configuredApiBase
  ? (/\/api$/i.test(configuredApiBase) ? configuredApiBase : `${configuredApiBase}/api`)
  : '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('pgg_admin_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });

  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.error || `Pedido à API falhou (${res.status}).`);
  }

  return (await res.json()) as T;
}

export const api = {
  // Health
  checkHealth: () => fetchJSON<{ status: string; timestamp: string }>(`${API_BASE}/health`),

  // Settings
  getSettings: () => fetchJSON<any>(`${API_BASE}/settings`),
  updateSettings: (data: any) =>
    fetchJSON<any>(`${API_BASE}/settings`, { method: 'PUT', body: JSON.stringify(data) }),

  // Articles
  getArticles: () => fetchJSON<any[]>(`${API_BASE}/articles`),
  createArticle: (data: any) =>
    fetchJSON<any>(`${API_BASE}/articles`, { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: string) =>
    fetchJSON<any>(`${API_BASE}/articles/${id}`, { method: 'DELETE' }),
  recordArticleView: (id: string) =>
    fetchJSON<any>(`${API_BASE}/articles/${id}/view`, { method: 'POST' }),

  // Videos
  getVideos: () => fetchJSON<any[]>(`${API_BASE}/videos`),
  createVideo: (data: any) =>
    fetchJSON<any>(`${API_BASE}/videos`, { method: 'POST', body: JSON.stringify(data) }),
  updateVideo: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVideo: (id: string) =>
    fetchJSON<any>(`${API_BASE}/videos/${id}`, { method: 'DELETE' }),
  recordVideoView: (id: string) =>
    fetchJSON<any>(`${API_BASE}/videos/${id}/view`, { method: 'POST' }),

  // Artists
  getArtists: () => fetchJSON<any[]>(`${API_BASE}/artists`),
  createArtist: (data: any) =>
    fetchJSON<any>(`${API_BASE}/artists`, { method: 'POST', body: JSON.stringify(data) }),
  updateArtist: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArtist: (id: string) =>
    fetchJSON<any>(`${API_BASE}/artists/${id}`, { method: 'DELETE' }),

  // Carousel
  getCarouselSlides: () => fetchJSON<any[]>(`${API_BASE}/carousel-slides`),
  createCarouselSlide: (data: any) =>
    fetchJSON<any>(`${API_BASE}/carousel-slides`, { method: 'POST', body: JSON.stringify(data) }),
  updateCarouselSlide: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/carousel-slides/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCarouselSlide: (id: string) =>
    fetchJSON<any>(`${API_BASE}/carousel-slides/${id}`, { method: 'DELETE' }),

  // Departments
  getDepartments: () => fetchJSON<any[]>(`${API_BASE}/departments`),
  updateDepartment: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Staff
  getStaff: () => fetchJSON<any[]>(`${API_BASE}/staff`),
  createStaff: (data: any) =>
    fetchJSON<any>(`${API_BASE}/staff`, { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStaff: (id: string) =>
    fetchJSON<any>(`${API_BASE}/staff/${id}`, { method: 'DELETE' }),

  // Schedules
  getSchedules: () => fetchJSON<any[]>(`${API_BASE}/schedules`),
  createSchedule: (data: any) =>
    fetchJSON<any>(`${API_BASE}/schedules`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id: string) =>
    fetchJSON<any>(`${API_BASE}/schedules/${id}`, { method: 'DELETE' }),

  // Coverage Requests & Approve Workflow
  getCoverageRequests: () => fetchJSON<any[]>(`${API_BASE}/coverage-requests`),
  createCoverageRequest: (data: any) =>
    fetchJSON<any>(`${API_BASE}/coverage-requests`, { method: 'POST', body: JSON.stringify(data) }),
  updateCoverageRequest: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/coverage-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoverageRequest: (id: string) =>
    fetchJSON<any>(`${API_BASE}/coverage-requests/${id}`, { method: 'DELETE' }),
  approveCoverageAndSchedule: (id: string, staffId: string, assignedDate?: string, assignedTime?: string) =>
    fetchJSON<any>(`${API_BASE}/coverage-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ staffId, assignedDate, assignedTime })
    }),

  // Partnerships
  getPartnerships: () => fetchJSON<any[]>(`${API_BASE}/partnerships`),
  createPartnership: (data: any) =>
    fetchJSON<any>(`${API_BASE}/partnerships`, { method: 'POST', body: JSON.stringify(data) }),
  updatePartnership: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/partnerships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePartnership: (id: string) =>
    fetchJSON<any>(`${API_BASE}/partnerships/${id}`, { method: 'DELETE' }),

  // Music Requests
  getMusicRequests: () => fetchJSON<any[]>(`${API_BASE}/music-requests`),
  createMusicRequest: async (
    data: Omit<MusicRequest, 'id' | 'status'>,
    files: { audio?: File; coverImage?: File } = {}
  ): Promise<MusicRequest> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (files.audio) formData.append('audio', files.audio, files.audio.name);
    if (files.coverImage) formData.append('coverImage', files.coverImage, files.coverImage.name);

    const response = await fetch(`${API_BASE}/music-requests`, {
      method: 'POST',
      body: formData
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(result?.error || `Falha ao enviar o pedido (${response.status}).`);
    }
    if (!result || typeof result !== 'object') {
      throw new Error('A resposta do servidor ao pedido de música é inválida.');
    }
    return result as MusicRequest;
  },
  updateMusicRequest: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/music-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMusicRequest: (id: string) =>
    fetchJSON<any>(`${API_BASE}/music-requests/${id}`, { method: 'DELETE' }),

  // Finances
  getFinances: () => fetchJSON<any[]>(`${API_BASE}/finances`),
  getFinanceSummary: () => fetchJSON<any>(`${API_BASE}/finances/summary`),
  createFinanceEntry: (data: any) =>
    fetchJSON<any>(`${API_BASE}/finances`, { method: 'POST', body: JSON.stringify(data) }),
  updateFinanceEntry: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/finances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFinanceEntry: (id: string) =>
    fetchJSON<any>(`${API_BASE}/finances/${id}`, { method: 'DELETE' }),

  // Assets
  getAssets: () => fetchJSON<any[]>(`${API_BASE}/assets`),
  createAsset: (data: any) =>
    fetchJSON<any>(`${API_BASE}/assets`, { method: 'POST', body: JSON.stringify(data) }),
  updateAsset: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAsset: (id: string) =>
    fetchJSON<any>(`${API_BASE}/assets/${id}`, { method: 'DELETE' }),

  // Liabilities
  getLiabilities: () => fetchJSON<any[]>(`${API_BASE}/liabilities`),
  createLiability: (data: any) =>
    fetchJSON<any>(`${API_BASE}/liabilities`, { method: 'POST', body: JSON.stringify(data) }),
  updateLiability: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/liabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLiability: (id: string) =>
    fetchJSON<any>(`${API_BASE}/liabilities/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => fetchJSON<any[]>(`${API_BASE}/tasks`),
  createTask: (data: any) =>
    fetchJSON<any>(`${API_BASE}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    fetchJSON<any>(`${API_BASE}/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    fetchJSON<any>(`${API_BASE}/tasks/${id}`, { method: 'DELETE' }),

  // Logs
  getLogs: () => fetchJSON<any[]>(`${API_BASE}/logs`),
  createLog: (data: any) =>
    fetchJSON<any>(`${API_BASE}/logs`, { method: 'POST', body: JSON.stringify(data) }),

  // Backups
  getBackups: () => fetchJSON<any[]>(`${API_BASE}/backups`),
  createBackup: (data: any) =>
    fetchJSON<any>(`${API_BASE}/backups`, { method: 'POST', body: JSON.stringify(data) }),
  exportBackup: () => fetchJSON<any>(`${API_BASE}/backups/export`),
  exportBackupUrl: `${API_BASE}/backups/export`,
  restoreBackup: (data: any) =>
    fetchJSON<any>(`${API_BASE}/backups/restore`, { method: 'POST', body: JSON.stringify(data) }),

  // Visitor Pings
  getPings: () => fetchJSON<any[]>(`${API_BASE}/pings`),
  getUserBookmarks: (userId: string) => fetchJSON<{ bookmarks: any[]; articles: any[] }>(`${API_BASE}/bookmarks/user/${encodeURIComponent(userId)}`),
  toggleBookmark: (userId: string, articleId: string) =>
    fetchJSON<{ bookmarked: boolean; bookmark?: any }>(`${API_BASE}/bookmarks/toggle`, {
      method: 'POST',
      body: JSON.stringify({ userId, articleId })
    }),
  recordPing: (data: { city: string; countryName: string; countryCode: string; lat: number; lng: number }) =>
    fetchJSON<any>(`${API_BASE}/pings/record`, { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  login: (email: string, password: string) =>
    fetchJSON<{ user: User }>(`${API_BASE}/auth/community/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  register: (name: string, email: string, password: string, role?: string) =>
    fetchJSON<{ user: User }>(`${API_BASE}/auth/community/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    }),
  loginAdmin: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (error) {
      throw new Error('Não foi possível contactar o servidor. Verifique se o backend está em execução.');
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || 'Não foi possível iniciar sessão.');
    }
    return result;
  },
  getAdminSession: () => fetchJSON<{ user: User }>(`${API_BASE}/auth/session`),
  logoutAdmin: () =>
    fetchJSON<{ message: string }>(`${API_BASE}/auth/logout`, { method: 'POST' }),
  getAdminUsers: () => fetchJSON<User[]>(`${API_BASE}/auth/users`),
  createAdminUser: (data: Omit<User, 'id'> & { password: string }) =>
    fetchJSON<User>(`${API_BASE}/auth/users`, { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUser: (id: string, data: Partial<User> & { password?: string; currentPassword?: string }) =>
    fetchJSON<User>(`${API_BASE}/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminUser: (id: string) =>
    fetchJSON<{ message: string }>(`${API_BASE}/auth/users/${id}`, { method: 'DELETE' })
};
