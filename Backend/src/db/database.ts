import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Pool, type PoolClient } from 'pg';
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
type RelationalCollectionName = Exclude<CollectionName, 'users'>;
type DatabaseRecord = Record<string, unknown> & { id: string };
type DatabaseFile = { settings: SiteSetting } & Record<CollectionName, DatabaseRecord[]>;

const relationalCollectionNames = collectionNames.filter(
  (collection): collection is RelationalCollectionName => collection !== 'users'
);

const collectionSyncOrder: RelationalCollectionName[] = [
  'articles',
  'departments',
  'staff',
  'coverage_requests',
  'schedules',
  'bookmarks',
  'tasks',
  'carousel_slides',
  'videos',
  'artists',
  'partnerships',
  'music_requests',
  'finances',
  'assets',
  'liabilities',
  'logs',
  'backups',
  'pings'
];

const collectionTables: Record<RelationalCollectionName, string> = {
  carousel_slides: 'carousel_slides',
  articles: 'articles',
  videos: 'videos',
  artists: 'artists',
  departments: 'departments',
  staff: 'staff',
  schedules: 'schedules',
  coverage_requests: 'coverage_requests',
  partnerships: 'partnerships',
  music_requests: 'music_requests',
  bookmarks: 'bookmarks',
  finances: 'finances',
  assets: 'assets',
  liabilities: 'liabilities',
  tasks: 'tasks',
  logs: 'system_logs',
  backups: 'backups',
  pings: 'visitor_pings'
};

const sqlRecordFieldAliases: Partial<Record<RelationalCollectionName, Record<string, string>>> = {
  articles: {
    author_role: 'authorRole',
    published_date: 'date',
    image_url: 'imageUrl',
    read_time: 'readTime',
    is_featured: 'isFeatured',
    is_announcement: 'isAnnouncement'
  },
  videos: {
    video_url: 'videoUrl',
    youtube_id: 'youtubeId',
    published_date: 'date'
  },
  artists: {
    image_url: 'imageUrl',
    popular_songs: 'popularSongs',
    social_links: 'socialLinks'
  },
  carousel_slides: {
    image_url: 'imageUrl',
    button_text_pt: 'buttonText_pt',
    button_text_en: 'buttonText_en',
    button_text_fr: 'buttonText_fr',
    button_link: 'buttonLink',
    display_order: 'order'
  },
  departments: {
    head_of_department: 'headOfDept',
    icon_name: 'iconName'
  },
  staff: {
    department_code: 'departmentCode',
    admission_date: 'admissionDate',
    emergency_contact: 'emergencyContact',
    avatar_url: 'avatarUrl',
    schedule_compliance_rating: 'scheduleComplianceRating',
    assigned_tasks_count: 'assignedTasksCount'
  },
  schedules: {
    service_name: 'serviceName',
    department_code: 'departmentCode',
    service_date: 'date',
    start_time: 'startTime',
    end_time: 'endTime',
    staff_id: 'staffId',
    staff_name: 'staffName',
    staff_ids: 'staffIds',
    staff_names: 'staffNames',
    coverage_request_id: 'coverageRequestId'
  },
  coverage_requests: {
    requester_name: 'requesterName',
    requester_phone: 'requesterPhone',
    requester_email: 'requesterEmail',
    event_title: 'eventTitle',
    event_type: 'eventType',
    church_or_entity: 'churchOrEntity',
    event_date: 'eventDate',
    event_time: 'eventTime',
    schedule_entry_id: 'scheduleEntryId',
    created_at: 'createdAt'
  },
  partnerships: {
    partner_name: 'partnerName',
    partner_type: 'partnerType',
    contact_person: 'contactPerson',
    agreement_scope: 'agreementScope',
    start_date: 'startDate',
    end_date: 'endDate',
    contribution_value: 'contributionValue'
  },
  music_requests: {
    artist_name: 'artistName',
    contact_phone: 'contactPhone',
    contact_email: 'contactEmail',
    song_title: 'songTitle',
    audio_url: 'audioUrl',
    cover_image_url: 'coverImageUrl',
    requested_date: 'requestedDate',
    session_type: 'sessionType'
  },
  bookmarks: {
    user_id: 'userId',
    article_id: 'articleId',
    saved_at: 'savedAt'
  },
  finances: {
    entry_date: 'date',
    payment_method: 'paymentMethod',
    registered_by: 'registeredBy'
  },
  assets: {
    acquisition_date: 'acquisitionDate',
    acquisition_cost: 'acquisitionCost',
    assigned_to: 'assignedTo',
    serial_number: 'serialNumber'
  },
  liabilities: {
    due_date: 'dueDate'
  },
  tasks: {
    department_code: 'departmentCode',
    assigned_to: 'assignedTo',
    due_date: 'dueDate'
  },
  logs: {
    logged_at: 'timestamp',
    user_name: 'user'
  },
  backups: {
    created_at: 'date',
    records_count: 'recordsCount',
    created_by: 'createdBy'
  },
  pings: {
    country_code: 'countryCode',
    country_name: 'countryName',
    latitude: 'lat',
    longitude: 'lng',
    visited_at: 'timestamp',
    views_count: 'viewsCount'
  }
};

type SqlColumn = {
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue: string | null;
  identity: boolean;
  generated: boolean;
};

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

const userTableMigration = 'users-from-app-state-v1';
const collectionTableMigration = 'collections-to-relational-v1';

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function camelCaseColumn(column: string): string {
  return column.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function recordFieldName(collection: RelationalCollectionName, column: string): string {
  return sqlRecordFieldAliases[collection]?.[column] ?? camelCaseColumn(column);
}

type UserTableValues = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  twoFactorEnabled: boolean;
  adminPermissions: string[] | null;
  isActive: boolean;
  passwordHash: string | null;
  passwordSalt: string | null;
  sortOrder: number;
};

function toUserTableValues(record: DatabaseRecord, sortOrder: number): UserTableValues {
  const requiredString = (key: string): string => {
    const value = record[key];
    if (typeof value !== 'string') throw new Error(`O campo users.${key} é inválido.`);
    return value;
  };
  const optionalString = (key: string): string | null => {
    const value = record[key];
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') throw new Error(`O campo users.${key} é inválido.`);
    return value;
  };

  const twoFactorEnabled = record.twoFactorEnabled;
  if (twoFactorEnabled !== undefined && typeof twoFactorEnabled !== 'boolean') {
    throw new Error('O campo users.twoFactorEnabled é inválido.');
  }
  const isActive = record.isActive;
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw new Error('O campo users.isActive é inválido.');
  }
  const permissions = record.adminPermissions;
  if (
    permissions !== undefined && permissions !== null &&
    (!Array.isArray(permissions) || permissions.some(permission => typeof permission !== 'string'))
  ) {
    throw new Error('O campo users.adminPermissions é inválido.');
  }

  const role = requiredString('role');
  if (!['admin', 'journalist', 'artist', 'follower'].includes(role)) {
    throw new Error('O campo users.role contém um perfil inválido.');
  }

  return {
    id: requiredString('id'),
    name: requiredString('name'),
    email: requiredString('email'),
    role,
    avatar: optionalString('avatar'),
    phone: optionalString('phone'),
    twoFactorEnabled: twoFactorEnabled ?? false,
    adminPermissions: Array.isArray(permissions) ? permissions : null,
    isActive: isActive ?? true,
    passwordHash: optionalString('passwordHash'),
    passwordSalt: optionalString('passwordSalt'),
    sortOrder
  };
}

const defaultFilePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/db.json'
);

export class Database {
  private data: DatabaseFile | undefined;
  private pool: Pool | undefined;
  private readonly relationalColumns = new Map<string, SqlColumn[]>();

  private get filePath(): string {
    const configuredPath = process.env.PGG_DATA_FILE?.trim();
    return configuredPath ? path.resolve(configuredPath) : defaultFilePath;
  }

  public async initialize(): Promise<void> {
    if (this.data) return;

    const connectionString = process.env.DATABASE_URL?.trim();
    if (connectionString) {
      this.pool = new Pool({ connectionString, max: 5 });
      try {
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS pgg_app_state (
            id text PRIMARY KEY,
            data jsonb NOT NULL,
            updated_at timestamptz NOT NULL DEFAULT now()
          )
        `);

        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id text PRIMARY KEY,
            name text NOT NULL,
            email text NOT NULL,
            role text NOT NULL,
            avatar text,
            phone text,
            two_factor_enabled boolean NOT NULL DEFAULT false,
            admin_permissions text[],
            is_active boolean NOT NULL DEFAULT true,
            password_hash text,
            password_salt text,
            sort_order integer
          )
        `);
        await this.pool.query(`
          ALTER TABLE users
            ADD COLUMN IF NOT EXISTS avatar text,
            ADD COLUMN IF NOT EXISTS phone text,
            ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS admin_permissions text[],
            ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
            ADD COLUMN IF NOT EXISTS password_hash text,
            ADD COLUMN IF NOT EXISTS password_salt text,
            ADD COLUMN IF NOT EXISTS sort_order integer
        `);
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS pgg_schema_migrations (
            id text PRIMARY KEY,
            applied_at timestamptz NOT NULL DEFAULT now()
          )
        `);

        let result = await this.pool.query<{ data: unknown }>(
          'SELECT data FROM pgg_app_state WHERE id = $1',
          ['main']
        );
        if (!result.rows[0]) {
          const seedPath = existsSync(this.filePath) ? this.filePath : defaultFilePath;
          const seedData = this.parseFile(readFileSync(seedPath, 'utf8'), seedPath);
          await this.pool.query(
            'INSERT INTO pgg_app_state (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING',
            ['main', JSON.stringify(seedData)]
          );
          result = await this.pool.query<{ data: unknown }>(
            'SELECT data FROM pgg_app_state WHERE id = $1',
            ['main']
          );
        }
        if (!result.rows[0]) throw new Error('Não foi possível inicializar o estado da base PostgreSQL.');

        const client = await this.pool.connect();
        try {
          await client.query('BEGIN');
          const stateResult = await client.query<{ data: unknown }>(
            'SELECT data FROM pgg_app_state WHERE id = $1 FOR UPDATE',
            ['main']
          );
          if (!stateResult.rows[0]) throw new Error('O estado principal não existe na base PostgreSQL.');
          const data = this.parseFile(JSON.stringify(stateResult.rows[0].data), 'pgg_app_state');
          await this.prepareCollectionTables(client);

          const migration = await client.query(
            'SELECT id FROM pgg_schema_migrations WHERE id = $1',
            [userTableMigration]
          );
          if (!migration.rows[0]) {
            for (const [index, user] of data.users.entries()) {
              await this.upsertUser(client, user, index);
            }
            await client.query(
              'INSERT INTO pgg_schema_migrations (id) VALUES ($1)',
              [userTableMigration]
            );
          }

          const collectionMigration = await client.query(
            'SELECT id FROM pgg_schema_migrations WHERE id = $1',
            [collectionTableMigration]
          );
          const relationalData = await this.readSqlCollections(client);
          if (!collectionMigration.rows[0]) {
            for (const collection of collectionSyncOrder) {
              const existingIds = new Set(data[collection].map((record) => record.id));
              data[collection].push(
                ...relationalData[collection].filter((record) => !existingIds.has(record.id))
              );
            }
            for (const collection of collectionSyncOrder) {
              await this.upsertSqlCollection(client, collection, data[collection]);
            }
            for (const collection of [...collectionSyncOrder].reverse()) {
              await this.deleteMissingSqlCollection(client, collection, data[collection]);
            }
            await client.query(
              'INSERT INTO pgg_schema_migrations (id) VALUES ($1)',
              [collectionTableMigration]
            );
          } else {
            for (const collection of relationalCollectionNames) {
              data[collection] = relationalData[collection];
            }
          }

          if (data.departments.length === 0) {
            const seedData = this.parseFile(
              readFileSync(defaultFilePath, 'utf8'),
              defaultFilePath
            );
            data.departments = seedData.departments;
            await this.upsertSqlCollection(client, 'departments', data.departments);
          }

          data.users = await this.readSqlUsers(client);
          await client.query(
            'UPDATE pgg_app_state SET data = $1::jsonb, updated_at = now() WHERE id = $2',
            [JSON.stringify(data), 'main']
          );
          await client.query('COMMIT');
          this.data = data;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        return;
      } catch (error) {
        await this.pool.end();
        this.pool = undefined;
        throw error;
      }
    }

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
    return this.clone((await this.loadCurrentData()).settings);
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
    const rows = this.clone((await this.loadCurrentData())[collection]) as T[];
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
    const item = (await this.loadCurrentData())[collection].find((record) => record.id === id);
    return item ? this.clone(item) as T : undefined;
  }

  public async findUserByEmail<T = DatabaseRecord>(email: string): Promise<T | undefined> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = (await this.loadCurrentData()).users.find(
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
    return this.transact((draft) => {
      const index = draft[collection].findIndex((record) => record.id === id);
      if (index < 0) return false;
      draft[collection].splice(index, 1);
      if (collection === 'articles' || collection === 'users') {
        const field = collection === 'articles' ? 'articleId' : 'userId';
        draft.bookmarks = draft.bookmarks.filter((bookmark) => bookmark[field] !== id);
      }
      if (collection === 'coverage_requests') {
        draft.schedules = draft.schedules.map((schedule) => {
          if (schedule.coverageRequestId !== id) return schedule;
          const updated = { ...schedule };
          delete updated.coverageRequestId;
          return updated;
        });
      }
      if (collection === 'staff') {
        draft.schedules = draft.schedules.map((schedule) =>
          schedule.staffId === id ? { ...schedule, staffId: '' } : schedule
        );
      }
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
    const data = await this.loadCurrentData();
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
    if (this.pool) {
      await this.transact((draft) => {
        draft.settings = restored.settings;
        for (const collection of collectionNames) {
          draft[collection] = restored[collection];
        }
      });
      return;
    }
    this.writeFile(restored);
    this.data = restored;
  }

  public async clearContentPreservingAdmin(): Promise<Record<string, number>> {
    return this.transact((draft) => {
      const rootAdmins = draft.users.filter((user) =>
        user.role === 'admin' &&
        typeof user.email === 'string' &&
        user.email.toLowerCase() === 'admin@portalgospel.gw'
      );
      if (rootAdmins.length === 0) {
        throw new Error('Limpeza cancelada: a conta de administrador principal não foi encontrada.');
      }

      const removed: Record<string, number> = {};
      for (const collection of collectionNames) {
        if (collection === 'users') continue;
        removed[collection] = draft[collection].length;
        draft[collection] = [];
      }
      removed.users = draft.users.length - rootAdmins.length;
      draft.users = rootAdmins;
      return removed;
    });
  }

  public async close(): Promise<void> {
    if (!this.pool) return;
    const pool = this.pool;
    this.pool = undefined;
    await pool.end();
  }

  private getData(): DatabaseFile {
    if (!this.data) throw new Error('A base de dados em ficheiro ainda não foi inicializada.');
    return this.data;
  }

  private async loadCurrentData(): Promise<DatabaseFile> {
    if (!this.pool) return this.getData();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const result = await client.query<{ data: unknown }>(
        'SELECT data FROM pgg_app_state WHERE id = $1',
        ['main']
      );
      if (!result.rows[0]) throw new Error('O estado principal não existe na base PostgreSQL.');
      const data = this.parseFile(JSON.stringify(result.rows[0].data), 'pgg_app_state');
      Object.assign(data, await this.readSqlCollections(client));
      data.users = await this.readSqlUsers(client);
      await client.query('COMMIT');
      this.data = data;
      return data;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async readSqlUsers(client: PoolClient): Promise<DatabaseRecord[]> {
    const result = await client.query(`
      SELECT id, name, email, role, avatar, phone, two_factor_enabled,
             admin_permissions, is_active, password_hash, password_salt
      FROM users
      ORDER BY sort_order NULLS LAST, id
    `);
    return result.rows.map((row: Record<string, unknown>) => {
      const text = (column: string, required = false): string | undefined => {
        const value = row[column];
        if (value === null || value === undefined) {
          if (required) throw new Error(`A coluna users.${column} não pode ser nula.`);
          return undefined;
        }
        if (typeof value !== 'string') throw new Error(`A coluna users.${column} é inválida.`);
        return value;
      };
      const boolean = (column: string): boolean | undefined => {
        const value = row[column];
        if (value === null || value === undefined) return undefined;
        if (typeof value !== 'boolean') throw new Error(`A coluna users.${column} é inválida.`);
        return value;
      };
      const requiredText = (column: string): string => {
        const value = text(column, true);
        if (value === undefined) throw new Error(`A coluna users.${column} não pode ser nula.`);
        return value;
      };
      const user: DatabaseRecord = {
        id: requiredText('id'),
        name: requiredText('name'),
        email: requiredText('email'),
        role: requiredText('role')
      };
      const role = user.role;
      if (typeof role !== 'string' || !['admin', 'journalist', 'artist', 'follower'].includes(role)) {
        throw new Error('A coluna users.role contém um perfil inválido.');
      }
      const avatar = text('avatar');
      const phone = text('phone');
      const passwordHash = text('password_hash');
      const passwordSalt = text('password_salt');
      const twoFactorEnabled = boolean('two_factor_enabled');
      const isActive = boolean('is_active');
      if (avatar !== undefined) user.avatar = avatar;
      if (phone !== undefined) user.phone = phone;
      if (passwordHash !== undefined) user.passwordHash = passwordHash;
      if (passwordSalt !== undefined) user.passwordSalt = passwordSalt;
      if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
      if (isActive !== undefined) user.isActive = isActive;
      const permissions = row.admin_permissions;
      if (permissions !== null && permissions !== undefined) {
        if (!Array.isArray(permissions) || permissions.some(permission => typeof permission !== 'string')) {
          throw new Error('A coluna users.admin_permissions contém dados inválidos.');
        }
        user.adminPermissions = permissions;
      }
      return user;
    });
  }

  private async upsertUser(client: PoolClient, record: DatabaseRecord, sortOrder: number): Promise<void> {
    const user = toUserTableValues(record, sortOrder);
    await client.query(`
      INSERT INTO users (
        id, name, email, role, avatar, phone, two_factor_enabled,
        admin_permissions, is_active, password_hash, password_salt, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar,
        phone = EXCLUDED.phone,
        two_factor_enabled = EXCLUDED.two_factor_enabled,
        admin_permissions = EXCLUDED.admin_permissions,
        is_active = EXCLUDED.is_active,
        password_hash = EXCLUDED.password_hash,
        password_salt = EXCLUDED.password_salt,
        sort_order = EXCLUDED.sort_order
    `, [
      user.id,
      user.name,
      user.email,
      user.role,
      user.avatar,
      user.phone,
      user.twoFactorEnabled,
      user.adminPermissions,
      user.isActive,
      user.passwordHash,
      user.passwordSalt,
      user.sortOrder
    ]);
  }

  private async syncSqlUsers(client: PoolClient, users: DatabaseRecord[]): Promise<void> {
    for (const [index, user] of users.entries()) {
      await this.upsertUser(client, user, index);
    }
    await client.query('DELETE FROM users WHERE NOT (id = ANY($1::text[]))', [users.map(user => user.id)]);
  }

  private async prepareCollectionTables(client: PoolClient): Promise<void> {
    for (const tableName of new Set(Object.values(collectionTables))) {
      const table = `public.${quoteIdentifier(tableName)}`;
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id text PRIMARY KEY,
          record_data jsonb,
          sort_order integer
        )
      `);
      await client.query(`
        ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS id text,
          ADD COLUMN IF NOT EXISTS record_data jsonb,
          ADD COLUMN IF NOT EXISTS sort_order integer
      `);
      const metadata = await client.query<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
        is_identity: string;
        is_generated: string;
      }>(`
        SELECT column_name, data_type, is_nullable, column_default, is_identity, is_generated
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);
      const idColumn = metadata.rows.find((column) => column.column_name === 'id');
      const dataColumn = metadata.rows.find((column) => column.column_name === 'record_data');
      if (
        !idColumn ||
        !['text', 'character varying', 'character'].includes(idColumn.data_type) ||
        idColumn.is_identity === 'YES' ||
        idColumn.is_generated !== 'NEVER'
      ) {
        throw new Error(`A tabela public.${tableName} precisa de uma coluna id do tipo texto.`);
      }
      await client.query(`
        UPDATE ${table}
        SET id = 'legacy-' || $1 || '-' || md5(ctid::text || now()::text)
        WHERE id IS NULL
      `, [tableName]);
      if (!dataColumn) {
        throw new Error(`Não foi possível preparar a coluna record_data em public.${tableName}.`);
      }
      if (dataColumn.data_type === 'json') {
        await client.query(
          `ALTER TABLE ${table} ALTER COLUMN record_data TYPE jsonb USING record_data::jsonb`
        );
      } else if (dataColumn.data_type !== 'jsonb') {
        throw new Error(`A coluna public.${tableName}.record_data tem de ser JSON ou JSONB.`);
      }

      await client.query(`
        UPDATE ${table} AS existing
        SET record_data = to_jsonb(existing) - 'record_data' - 'sort_order'
        WHERE record_data IS NULL
      `);
      await client.query(`
        WITH missing_order AS (
          SELECT ctid, row_number() OVER (ORDER BY id)::integer - 1 AS position
          FROM ${table}
          WHERE sort_order IS NULL
        )
        UPDATE ${table} AS existing
        SET sort_order = missing_order.position
        FROM missing_order
        WHERE existing.ctid = missing_order.ctid
      `);
      await client.query(`ALTER TABLE ${table} ALTER COLUMN id SET NOT NULL`);
      await client.query(`ALTER TABLE ${table} ALTER COLUMN record_data SET NOT NULL`);
      await client.query(`ALTER TABLE ${table} ALTER COLUMN sort_order SET DEFAULT 0`);
      await client.query(`ALTER TABLE ${table} ALTER COLUMN sort_order SET NOT NULL`);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS ${quoteIdentifier(`pgg_${tableName}_id_uidx`)}
        ON ${table} (id)
      `);

      const columns = await client.query<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
        is_identity: string;
        is_generated: string;
      }>(`
        SELECT column_name, data_type, is_nullable, column_default, is_identity, is_generated
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      this.relationalColumns.set(tableName, columns.rows.map((column) => ({
        name: column.column_name,
        dataType: column.data_type,
        nullable: column.is_nullable === 'YES',
        defaultValue: column.column_default,
        identity: column.is_identity === 'YES',
        generated: column.is_generated !== 'NEVER'
      })));
    }
  }

  private async readSqlCollections(
    client: PoolClient
  ): Promise<Record<RelationalCollectionName, DatabaseRecord[]>> {
    const records: Record<RelationalCollectionName, DatabaseRecord[]> = {
      carousel_slides: [],
      articles: [],
      videos: [],
      artists: [],
      departments: [],
      staff: [],
      schedules: [],
      coverage_requests: [],
      partnerships: [],
      music_requests: [],
      bookmarks: [],
      finances: [],
      assets: [],
      liabilities: [],
      tasks: [],
      logs: [],
      backups: [],
      pings: []
    };
    const queries = relationalCollectionNames.map((collection) => `
      SELECT '${collection}'::text AS collection, id::text AS id, record_data AS data, sort_order
      FROM public.${quoteIdentifier(collectionTables[collection])}
    `);
    const result = await client.query<{
      collection: RelationalCollectionName;
      id: string;
      data: unknown;
    }>(`${queries.join(' UNION ALL ')} ORDER BY collection, sort_order, id`);

    for (const row of result.rows) {
      let value = row.data;
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value) as unknown;
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          throw new Error(
            `JSON inválido em public.${collectionTables[row.collection]}.record_data: ${detail}`
          );
        }
      }
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error(
          `O registo ${row.id} em public.${collectionTables[row.collection]} não contém um objeto JSON.`
        );
      }
      const normalized: Record<string, unknown> = {};
      for (const [key, fieldValue] of Object.entries(value)) {
        normalized[key] = fieldValue;
        const recordField = recordFieldName(row.collection, key);
        if (recordField !== key && !Object.prototype.hasOwnProperty.call(normalized, recordField)) {
          normalized[recordField] = fieldValue;
        }
      }
      normalized.id = row.id;
      records[row.collection].push(normalized as DatabaseRecord);
    }

    return records;
  }

  private async deleteMissingSqlCollection(
    client: PoolClient,
    collection: RelationalCollectionName,
    records: DatabaseRecord[]
  ): Promise<void> {
    const tableName = collectionTables[collection];
    const table = `public.${quoteIdentifier(tableName)}`;
    await client.query(
      `DELETE FROM ${table} WHERE NOT (id::text = ANY($1::text[]))`,
      [records.map((record) => record.id)]
    );
  }

  private async upsertSqlCollection(
    client: PoolClient,
    collection: RelationalCollectionName,
    records: DatabaseRecord[]
  ): Promise<void> {
    const tableName = collectionTables[collection];
    const table = `public.${quoteIdentifier(tableName)}`;
    const columns = this.relationalColumns.get(tableName);
    if (!columns) throw new Error(`O esquema da tabela public.${tableName} não foi inicializado.`);

    for (const [sortOrder, record] of records.entries()) {
      const insertColumns: SqlColumn[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];
      for (const column of columns) {
        if (column.generated || (column.identity && column.name !== 'id')) continue;

        let value: unknown;
        let present = true;
        if (column.name === 'id') value = record.id;
        else if (column.name === 'record_data') value = JSON.stringify(record);
        else if (column.name === 'sort_order') value = sortOrder;
        else if (collection === 'schedules' && column.name === 'staff_id') {
          value = typeof record.staffId === 'string' && record.staffId ? record.staffId : null;
        } else {
          const recordField = recordFieldName(collection, column.name);
          if (Object.prototype.hasOwnProperty.call(record, column.name)) value = record[column.name];
          else if (Object.prototype.hasOwnProperty.call(record, recordField)) {
            value = record[recordField];
          } else present = false;
        }

        if (!present) {
          if (!column.nullable && column.defaultValue === null) {
            throw new Error(
              `O registo ${record.id} não fornece a coluna obrigatória ${column.name} de public.${tableName}.`
            );
          }
          continue;
        }

        insertColumns.push(column);
        values.push(
          column.dataType === 'json' || column.dataType === 'jsonb'
            ? (value === null ? null : JSON.stringify(value))
            : value
        );
        const parameter = `$${values.length}`;
        placeholders.push(
          column.dataType === 'json' || column.dataType === 'jsonb'
            ? `${parameter}::jsonb`
            : parameter
        );
      }

      const updates = insertColumns
        .filter((column) => column.name !== 'id')
        .map((column) => `${quoteIdentifier(column.name)} = EXCLUDED.${quoteIdentifier(column.name)}`);
      const conflictAction = updates.length
        ? `DO UPDATE SET ${updates.join(', ')}`
        : 'DO NOTHING';
      await client.query(`
        INSERT INTO ${table} (${insertColumns.map((column) => quoteIdentifier(column.name)).join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (id) ${conflictAction}
      `, values);
    }
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

  private async transact<T>(operation: (draft: DatabaseFile) => T): Promise<T> {
    if (this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query<{ data: unknown }>(
          'SELECT data FROM pgg_app_state WHERE id = $1 FOR UPDATE',
          ['main']
        );
        if (!result.rows[0]) throw new Error('O estado principal não existe na base PostgreSQL.');
        const draft = this.parseFile(JSON.stringify(result.rows[0].data), 'pgg_app_state');
        Object.assign(draft, await this.readSqlCollections(client));
        draft.users = await this.readSqlUsers(client);
        const currentUsers = JSON.stringify(draft.users);
        const currentCollections = new Map(
          relationalCollectionNames.map((collection) => [
            collection,
            JSON.stringify(draft[collection])
          ])
        );
        const value = operation(draft);
        if (JSON.stringify(draft.users) !== currentUsers) {
          await this.syncSqlUsers(client, draft.users);
        }
        const changedCollections = collectionSyncOrder.filter(
          (collection) => JSON.stringify(draft[collection]) !== currentCollections.get(collection)
        );
        for (const collection of changedCollections) {
          await this.upsertSqlCollection(client, collection, draft[collection]);
        }
        for (const collection of [...changedCollections].reverse()) {
          await this.deleteMissingSqlCollection(client, collection, draft[collection]);
        }
        await client.query(
          'UPDATE pgg_app_state SET data = $1::jsonb, updated_at = now() WHERE id = $2',
          [JSON.stringify(draft), 'main']
        );
        await client.query('COMMIT');
        this.data = draft;
        return this.clone(value);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

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
