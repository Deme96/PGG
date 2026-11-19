import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import type { SiteSetting, SystemLog } from '../types/index.ts';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const collectionNames = [
  'carousel_slides',
  'articles',
  'videos',
  'artists',
  'departments',
  'staff',
  'schedules',
  'coverage_requests',
  'partnerships',
  'music_requests',
  'bookmarks',
  'finances',
  'assets',
  'liabilities',
  'tasks',
  'logs',
  'backups',
  'pings',
  'users'
] as const;

type CollectionName = (typeof collectionNames)[number];
type DatabaseRecord = Record<string, unknown> & { id: string };
type DatabaseFile = { settings: SiteSetting } & Record<CollectionName, DatabaseRecord[]>;

const backupKeys: Record<CollectionName, string> = {
  carousel_slides: 'carouselSlides',
  articles: 'articles',
  videos: 'videos',
  artists: 'artists',
  departments: 'departments',
  staff: 'staff',
  schedules: 'schedules',
  coverage_requests: 'coverageRequests',
  partnerships: 'partnerships',
  music_requests: 'musicRequests',
  bookmarks: 'bookmarks',
  finances: 'finances',
  assets: 'assets',
  liabilities: 'liabilities',
  tasks: 'tasks',
  logs: 'logs',
  backups: 'backups',
  pings: 'pings',
  users: 'users'
};

const defaultFilePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/db.json'
);

export class Database {
  private data: DatabaseFile | undefined;

  private get filePath(): string {
    const configuredPath = process.env.PGG_DATA_FILE?.trim();
    return configuredPath ? path.resolve(configuredPath) : defaultFilePath;
  }

  public async initialize(): Promise<void> {
    if (this.data) return;

    if (existsSync(this.filePath)) {
      this.data = this.parseFile(readFileSync(this.filePath, 'utf8'), this.filePath);
      return;
    }

    if (this.filePath === defaultFilePath) {
      throw new Error(`O ficheiro de dados não foi encontrado: ${this.filePath}`);
    }

    const seedData = this.parseFile(readFileSync(defaultFilePath, 'utf8'), defaultFilePath);
    this.writeFile(seedData);
    this.data = seedData;
  }

  public async getSettings(): Promise<SiteSetting> {
    return this.clone(this.getData().settings);
  }

  public async updateSettings(updates: Partial<SiteSetting>): Promise<SiteSetting> {
    return this.transact((draft) => {
      draft.settings = { ...draft.settings, ...updates };
      draft.logs.unshift(this.createLog(
        'Atualização de Definições',
        'Configurações',
        'Definições do portal atualizadas via API'
      ));
      return draft.settings;
    });
  }

  public async getCollection<T = DatabaseRecord>(collection: CollectionName): Promise<T[]> {
    const rows = this.clone(this.getData()[collection]) as T[];
    const ordering: Partial<Record<CollectionName, { field: string; direction: 1 | -1 }>> = {
      carousel_slides: { field: 'order', direction: 1 },
      articles: { field: 'date', direction: -1 },
      videos: { field: 'date', direction: -1 },
      schedules: { field: 'date', direction: 1 },
      logs: { field: 'timestamp', direction: -1 },
      backups: { field: 'date', direction: -1 },
      pings: { field: 'timestamp', direction: -1 }
    };
    const sort = ordering[collection];
    if (!sort) return rows;

    return rows.sort((left, right) => {
      const a = (left as Record<string, unknown>)[sort.field];
      const b = (right as Record<string, unknown>)[sort.field];
      if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * sort.direction;
      }
      return String(a ?? '').localeCompare(String(b ?? '')) * sort.direction;
    });
  }

  public async findById<T extends { id: string }>(
    collection: CollectionName,
    id: string
  ): Promise<T | undefined> {
    const item = this.getData()[collection].find((record) => record.id === id);
    return item ? this.clone(item) as T : undefined;
  }

  public async findUserByEmail<T = DatabaseRecord>(email: string): Promise<T | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.getData().users.find(
      (record) => typeof record.email === 'string' && record.email.toLowerCase() === normalizedEmail
    );
    return user ? this.clone(user) as T : undefined;
  }

  public async insert<T = DatabaseRecord>(
    collection: CollectionName,
    record: Record<string, unknown>,
    prefix = 'item'
  ): Promise<T> {
    const id = typeof record.id === 'string' && record.id
      ? record.id
      : `${prefix}-${Date.now()}-${randomBytes(4).toString('hex')}`;
    const item = { ...record, id } as DatabaseRecord;
    return this.transact((draft) => {
      if (draft[collection].some((existing) => existing.id === id)) {
        throw new Error(`Já existe um registo com o identificador ${id} em ${collection}.`);
      }
      draft[collection].unshift(item);
      return item as T;
    });
  }

  public async update<T = DatabaseRecord>(
    collection: CollectionName,
    id: string,
    updates: Record<string, unknown>
  ): Promise<T | undefined> {
    if (!this.getData()[collection].some((record) => record.id === id)) return undefined;

    return this.transact((draft) => {
      const index = draft[collection].findIndex((record) => record.id === id);
      if (index < 0) return undefined;
      const current = draft[collection][index];
      const updated = { ...current, ...updates, id: current.id };
      draft[collection][index] = updated;
      return updated as T;
    });
  }

  public async delete(collection: CollectionName, id: string): Promise<boolean> {
    if (!this.getData()[collection].some((record) => record.id === id)) return false;

    return this.transact((draft) => {
      const index = draft[collection].findIndex((record) => record.id === id);
      if (index < 0) return false;
      draft[collection].splice(index, 1);
      return true;
    });
  }

  public async addLog(
    action: string,
    module: string,
    details: string,
    user = 'Sistema',
    ip = 'Sistema'
  ): Promise<SystemLog> {
    return this.transact((draft) => {
      const log = this.createLog(action, module, details, user, ip);
      draft.logs.unshift(log);
      return log;
    });
  }

  public async approveCoverageRequest(
    requestId: string,
    staffId: string,
    assignedDate?: string,
    assignedTime?: string
  ): Promise<{ request: DatabaseRecord; schedule: DatabaseRecord } | null> {
    return this.transact((draft) => {
      const request = draft.coverage_requests.find((item) => item.id === requestId);
      if (!request) return null;

      const staff = draft.staff.find((item) => item.id === staffId);
      if (!staff) throw new Error('O membro da equipa indicado não existe.');

      const schedule: DatabaseRecord = {
        id: `schedule-${Date.now()}-${randomBytes(4).toString('hex')}`,
        serviceName: `Cobertura: ${String(request.eventTitle ?? '')} (${String(request.churchOrEntity ?? '')})`,
        departmentCode: String(staff.departmentCode ?? 'REPORTAGEM'),
        date: assignedDate ?? String(request.eventDate ?? ''),
        startTime: assignedTime ?? String(request.eventTime ?? '09:00'),
        endTime: '13:00',
        staffId: staff.id,
        staffName: String(staff.name ?? ''),
        staffIds: [staff.id],
        staffNames: [String(staff.name ?? '')],
        status: 'Pendente',
        notes: `Gerado automaticamente via API por aprovação do pedido ${request.id}. Contacto: ${String(request.requesterName ?? '')} (${String(request.requesterPhone ?? '')})`,
        location: String(request.location ?? ''),
        coverageRequestId: request.id
      };
      request.status = 'Aprovado';
      request.scheduleEntryId = schedule.id;
      draft.schedules.unshift(schedule);
      draft.logs.unshift(this.createLog(
        'Aprovação de Cobertura & Escala Gerada',
        'Correspondências',
        `Pedido "${String(request.eventTitle ?? '')}" aprovado e agendado para ${String(staff.name ?? '')}`
      ));
      return { request, schedule };
    });
  }

  public async exportFullJSON(): Promise<string> {
    const data = this.getData();
    const exported: Record<string, unknown> = { siteSettings: data.settings };
    for (const collection of collectionNames) {
      exported[backupKeys[collection]] = data[collection];
    }
    return JSON.stringify(exported, null, 2);
  }

  public async restoreFromJSON(rawJson: string): Promise<void> {
    const restored = this.parseFile(rawJson, 'ficheiro de backup');
    restored.logs.unshift(this.createLog(
      'Restauro de Dados',
      'Configurações',
      'Base de dados restaurada via API JSON'
    ));
    this.writeFile(restored);
    this.data = restored;
  }

  private getData(): DatabaseFile {
    if (!this.data) throw new Error('A base de dados em ficheiro ainda não foi inicializada.');
    return this.data;
  }

  private parseFile(raw: string, source: string): DatabaseFile {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`JSON inválido em ${source}: ${detail}`);
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`O conteúdo de ${source} não é um objeto JSON.`);
    }

    const sourceObject = parsed as Record<string, unknown>;
    const settings = sourceObject.siteSettings ?? sourceObject.settings;
    if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
      throw new Error(`As configurações do portal estão ausentes ou inválidas em ${source}.`);
    }

    const data: Record<string, unknown> = { settings };
    for (const collection of collectionNames) {
      const entries = sourceObject[backupKeys[collection]] ?? sourceObject[collection];
      if (!Array.isArray(entries)) {
        throw new Error(`A coleção ${backupKeys[collection]} está ausente ou inválida em ${source}.`);
      }
      if (entries.some((entry) => (
        typeof entry !== 'object' || entry === null || Array.isArray(entry) ||
        typeof (entry as Record<string, unknown>).id !== 'string'
      ))) {
        throw new Error(`A coleção ${backupKeys[collection]} contém registos inválidos em ${source}.`);
      }
      data[collection] = entries;
    }
    return data as DatabaseFile;
  }

  private writeFile(data: DatabaseFile): void {
    const directory = path.dirname(this.filePath);
    mkdirSync(directory, { recursive: true });

    const temporaryPath = `${this.filePath}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
    renameSync(temporaryPath, this.filePath);
  }

  private transact<T>(operation: (draft: DatabaseFile) => T): T {
    const draft = this.clone(this.getData());
    const result = operation(draft);
    this.writeFile(draft);
    this.data = draft;
    return this.clone(result);
  }

  private createLog(
    action: string,
    module: string,
    details: string,
    user = 'Sistema',
    ip = 'Sistema'
  ): SystemLog & DatabaseRecord {
    return {
      id: `log-${Date.now()}-${randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      module,
      ip,
      details
    };
  }

  private clone<T>(value: T): T {
    if (value === undefined) return value;
    return JSON.parse(JSON.stringify(value)) as T;
  }
}

export const db = new Database();
