import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
} from '../data/mockData.ts';
import type { User } from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../data/db.json');

export interface DatabaseSchema {
  settings: typeof initialSiteSettings;
  carousel_slides: typeof initialCarouselSlides;
  articles: typeof initialArticles;
  videos: typeof initialVideos;
  artists: typeof initialArtists;
  departments: typeof initialDepartments;
  staff: typeof initialStaff;
  schedules: typeof initialSchedules;
  coverage_requests: typeof initialCoverageRequests;
  partnerships: typeof initialPartnerships;
  music_requests: typeof initialMusicRequests;
  bookmarks: Array<{ id: string; userId: string; articleId: string; savedAt: string }>;
  finances: typeof initialFinanceEntries;
  assets: typeof initialAssets;
  liabilities: typeof initialLiabilities;
  tasks: typeof initialTasks;
  logs: typeof initialSystemLogs;
  backups: typeof initialBackups;
  pings: typeof initialVisitorPings;
  users: Array<User & { passwordHash?: string; passwordSalt?: string }>;
}

function getDefaultData(): DatabaseSchema {
  return {
    settings: { ...initialSiteSettings },
    carousel_slides: [...initialCarouselSlides],
    articles: [...initialArticles],
    videos: [...initialVideos],
    artists: [...initialArtists],
    departments: [...initialDepartments],
    staff: [...initialStaff],
    schedules: [...initialSchedules],
    coverage_requests: [...initialCoverageRequests],
    partnerships: [...initialPartnerships],
    music_requests: [...initialMusicRequests],
    bookmarks: [
      { id: 'bm-1', userId: 'usr_admin_1', articleId: 'news-1', savedAt: '2026-11-18' }
    ],
    finances: [...initialFinanceEntries],
    assets: [...initialAssets],
    liabilities: [...initialLiabilities],
    tasks: [...initialTasks],
    logs: [...initialSystemLogs],
    backups: [...initialBackups],
    pings: [...initialVisitorPings],
    users: [
      {
        id: 'usr_admin_1',
        name: 'Pr. Daniel Sanhá',
        email: 'admin@portalgospel.gw',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+245 955 123 456',
        twoFactorEnabled: true
      },
      {
        id: 'usr_journalist_1',
        name: 'Moisés Gomes',
        email: 'redacao@portalgospel.gw',
        role: 'journalist',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+245 955 234 567',
        twoFactorEnabled: true
      },
      {
        id: 'usr_artist_1',
        name: 'Irmã Dulce Embaló',
        email: 'artista@portalgospel.gw',
        role: 'artist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+245 955 778 899',
        twoFactorEnabled: true
      },
      {
        id: 'usr_follower_1',
        name: 'Helena Vieira',
        email: 'seguidor@portalgospel.gw',
        role: 'follower',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        phone: '+245 966 882 110',
        twoFactorEnabled: true
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db.json, generating default data...', e);
    }

    const defaultData = getDefaultData();
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save db.json', e);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  // System Audit Log
  public addLog(action: string, module: string, details: string, user: string = 'Pr. Daniel Sanhá', ip: string = '127.0.0.1') {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      action,
      module,
      ip,
      details
    };
    this.data.logs.unshift(newLog);
    this.commit();
  }

  // Settings
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<typeof initialSiteSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.addLog('Atualização de Definições', 'Configurações', 'Definições do portal atualizadas via API');
    this.commit();
    return this.data.settings;
  }

  // Generic collection operations
  public getCollection<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public findById<T extends { id: string }>(collection: keyof DatabaseSchema, id: string): T | undefined {
    const list = this.data[collection] as any[];
    return list.find(item => item.id === id);
  }

  public insert<T extends { id: string }>(collection: keyof DatabaseSchema, item: Omit<T, 'id'>, idPrefix: string = 'item'): T {
    const newItem = {
      ...item,
      id: `${idPrefix}-${Date.now()}`
    } as unknown as T;

    (this.data[collection] as any[]).unshift(newItem);
    this.commit();
    return newItem;
  }

  public update<T extends { id: string }>(collection: keyof DatabaseSchema, id: string, updates: Partial<T>): T | null {
    const list = this.data[collection] as any[];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    this.commit();
    return list[index];
  }

  public delete(collection: keyof DatabaseSchema, id: string): boolean {
    const list = this.data[collection] as any[];
    const initialLength = list.length;
    (this.data[collection] as any[]) = list.filter(item => item.id !== id);
    const deleted = (this.data[collection] as any[]).length < initialLength;
    if (deleted) this.commit();
    return deleted;
  }

  // CRITICAL BUSINESS RULE:
  // "Pedido de cobertura aprovado gera entrada na escala."
  public approveCoverageRequest(requestId: string, staffId: string, assignedDate?: string, assignedTime?: string) {
    const request = this.findById<any>('coverage_requests', requestId);
    if (!request) return null;

    const assignedStaff = this.findById<any>('staff', staffId) || this.data.staff[0];
    const newScheduleId = `sch-cov-${Date.now()}`;

    // 1. Create schedule entry
    const newSchedule = {
      id: newScheduleId,
      serviceName: `Cobertura: ${request.eventTitle} (${request.churchOrEntity})`,
      departmentCode: assignedStaff?.departmentCode || 'REPORTAGEM',
      date: assignedDate || request.eventDate,
      startTime: assignedTime || request.eventTime || '09:00',
      endTime: '13:00',
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      staffIds: [assignedStaff.id],
      staffNames: [assignedStaff.name],
      status: 'Pendente',
      notes: `Gerado automaticamente via API por aprovação do pedido ${request.id}. Contacto: ${request.requesterName} (${request.requesterPhone})`,
      location: request.location,
      coverageRequestId: request.id
    };

    this.data.schedules.unshift(newSchedule as any);

    // 2. Update coverage request
    request.status = 'Aprovado';
    request.scheduleEntryId = newScheduleId;

    this.addLog(
      'Aprovação de Cobertura & Escala Gerada',
      'Correspondências',
      `Pedido "${request.eventTitle}" aprovado e agendado para ${assignedStaff.name}`
    );

    this.commit();
    return { request, schedule: newSchedule };
  }

  // Full backup & restore
  public exportFullJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public restoreFromJSON(rawJson: string): boolean {
    try {
      const parsed = JSON.parse(rawJson);
      this.data = parsed;
      this.addLog('Restauro de Dados', 'Configurações', 'Base de dados restaurada via API JSON');
      this.commit();
      return true;
    } catch (e) {
      console.error('Failed to restore JSON database:', e);
      return false;
    }
  }

  public resetToDefault() {
    this.data = getDefaultData();
    this.addLog('Reinicialização Completa', 'Configurações', 'Base de dados reposta com dados padrão');
    this.commit();
    return this.data;
  }
}

export const db = new Database();
