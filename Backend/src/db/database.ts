import { randomBytes } from 'node:crypto';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, type PoolClient } from 'pg';
import type { SiteSetting, SystemLog } from '../types/index.ts';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env') });

type CollectionName =
  | 'users'
  | 'articles'
  | 'videos'
  | 'artists'
  | 'carousel_slides'
  | 'departments'
  | 'staff'
  | 'coverage_requests'
  | 'schedules'
  | 'partnerships'
  | 'music_requests'
  | 'bookmarks'
  | 'finances'
  | 'assets'
  | 'liabilities'
  | 'tasks'
  | 'logs'
  | 'backups'
  | 'pings';

const collectionTables: Record<CollectionName, string> = {
  users: 'users',
  articles: 'articles',
  videos: 'videos',
  artists: 'artists',
  carousel_slides: 'carousel_slides',
  departments: 'departments',
  staff: 'staff',
  coverage_requests: 'coverage_requests',
  schedules: 'schedules',
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

const propertyColumns: Partial<Record<CollectionName, Record<string, string>>> = {
  articles: { authorRole: 'author_role', date: 'published_date', imageUrl: 'image_url', readTime: 'read_time' },
  videos: { videoUrl: 'video_url', youtubeId: 'youtube_id', date: 'published_date' },
  artists: { imageUrl: 'image_url', popularSongs: 'popular_songs', socialLinks: 'social_links' },
  carousel_slides: { imageUrl: 'image_url', buttonText_pt: 'button_text_pt', buttonText_en: 'button_text_en', buttonText_fr: 'button_text_fr', buttonLink: 'button_link', order: 'display_order' },
  departments: { headOfDept: 'head_of_department', memberCount: 'member_count', iconName: 'icon_name' },
  staff: { departmentCode: 'department_code', admissionDate: 'admission_date', avatarUrl: 'avatar_url', scheduleComplianceRating: 'schedule_compliance_rating', assignedTasksCount: 'assigned_tasks_count' },
  coverage_requests: { requesterName: 'requester_name', requesterPhone: 'requester_phone', requesterEmail: 'requester_email', eventTitle: 'event_title', eventType: 'event_type', churchOrEntity: 'church_or_entity', eventDate: 'event_date', eventTime: 'event_time', scheduleEntryId: 'schedule_entry_id', createdAt: 'created_at' },
  schedules: { serviceName: 'service_name', departmentCode: 'department_code', date: 'service_date', startTime: 'start_time', endTime: 'end_time', staffId: 'staff_id', staffName: 'staff_name', staffIds: 'staff_ids', staffNames: 'staff_names', coverageRequestId: 'coverage_request_id' },
  partnerships: { partnerName: 'partner_name', partnerType: 'partner_type', contactPerson: 'contact_person', agreementScope: 'agreement_scope', startDate: 'start_date', endDate: 'end_date', contributionValue: 'contribution_value' },
  music_requests: { artistName: 'artist_name', contactPhone: 'contact_phone', contactEmail: 'contact_email', songTitle: 'song_title', audioUrl: 'audio_url', coverImageUrl: 'cover_image_url', requestedDate: 'requested_date', sessionType: 'session_type' },
  bookmarks: { userId: 'user_id', articleId: 'article_id', savedAt: 'saved_at' },
  finances: { date: 'entry_date', paymentMethod: 'payment_method', registeredBy: 'registered_by' },
  assets: { acquisitionDate: 'acquisition_date', acquisitionCost: 'acquisition_cost', assignedTo: 'assigned_to', serialNumber: 'serial_number' },
  liabilities: { dueDate: 'due_date' },
  tasks: { departmentCode: 'department_code', assignedTo: 'assigned_to', dueDate: 'due_date' },
  logs: { timestamp: 'logged_at', user: 'user_name' },
  backups: { date: 'created_at', recordsCount: 'records_count', createdBy: 'created_by' },
  pings: { countryCode: 'country_code', countryName: 'country_name', lat: 'latitude', lng: 'longitude', timestamp: 'visited_at', viewsCount: 'views_count' }
};

const columnProperties: Partial<Record<CollectionName, Record<string, string>>> = {};
for (const collection of Object.keys(collectionTables) as CollectionName[]) {
  columnProperties[collection] = Object.fromEntries(
    Object.entries(propertyColumns[collection] || {}).map(([property, column]) => [column, property])
  );
}

const restoreOrder: CollectionName[] = [
  'users', 'articles', 'departments', 'videos', 'artists', 'carousel_slides',
  'staff', 'coverage_requests', 'schedules', 'partnerships', 'music_requests',
  'bookmarks', 'finances', 'assets', 'liabilities', 'tasks', 'logs', 'backups', 'pings'
];

const backupKeys: Record<CollectionName, string> = {
  users: 'users',
  articles: 'articles',
  videos: 'videos',
  artists: 'artists',
  carousel_slides: 'carouselSlides',
  departments: 'departments',
  staff: 'staff',
  coverage_requests: 'coverageRequests',
  schedules: 'schedules',
  partnerships: 'partnerships',
  music_requests: 'musicRequests',
  bookmarks: 'bookmarks',
  finances: 'finances',
  assets: 'assets',
  liabilities: 'liabilities',
  tasks: 'tasks',
  logs: 'systemLogs',
  backups: 'backups',
  pings: 'visitorPings'
};

const dateOnlyColumns = new Set([
  'published_date', 'admission_date', 'event_date', 'service_date', 'start_date',
  'end_date', 'requested_date', 'saved_at', 'entry_date', 'acquisition_date', 'due_date'
]);

const timeOnlyColumns = new Set(['event_time', 'start_time', 'end_time']);

const collectionOrder: Partial<Record<CollectionName, string>> = {
  articles: 'published_date DESC',
  videos: 'published_date DESC',
  carousel_slides: 'display_order ASC',
  schedules: 'service_date ASC, start_time ASC',
  logs: 'logged_at DESC',
  backups: 'created_at DESC',
  pings: 'visited_at DESC'
};

const numericProperties = new Set([
  'views', 'budget', 'memberCount', 'scheduleComplianceRating', 'assignedTasksCount',
  'contributionValue', 'amount', 'acquisitionCost', 'recordsCount', 'lat', 'lng',
  'viewsCount', 'totalVisitorsCount'
]);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class Database {
  private readonly columns = new Map<string, Set<string>>();

  public async initialize(requireImportedData = true): Promise<void> {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL não está configurada. O backend requer a ligação PostgreSQL.');
    }

    const database = await pool.query<{ database_name: string }>('SELECT current_database() AS database_name');
    if (database.rows[0]?.database_name.toLowerCase() !== 'pgg_db') {
      throw new Error(`DATABASE_URL deve apontar para pgg_db (base atual: ${database.rows[0]?.database_name || 'desconhecida'}).`);
    }

    const tableNames = [...new Set([...Object.values(collectionTables), 'site_settings'])];
    const result = await pool.query<{ table_name: string; column_name: string }>(
      `SELECT table_name, column_name
       FROM information_schema.columns
       WHERE table_schema = current_schema() AND table_name = ANY($1::text[])`,
      [tableNames]
    );
    for (const row of result.rows) {
      const tableColumns = this.columns.get(row.table_name) || new Set<string>();
      tableColumns.add(row.column_name);
      this.columns.set(row.table_name, tableColumns);
    }

    const missingTables = tableNames.filter(tableName => !this.columns.has(tableName));
    if (missingTables.length) {
      throw new Error(`Esquema PostgreSQL incompleto; execute Backend/database/postgres_schema.sql. Tabelas em falta: ${missingTables.join(', ')}`);
    }

    const settings = await pool.query('SELECT 1 FROM site_settings WHERE id = 1');
    if (requireImportedData && !settings.rowCount) {
      throw new Error('Os dados iniciais do portal não foram importados (site_settings id = 1 ausente). Execute npm run migrate:postgres para importar Backend/data/db.json.');
    }
  }

  private toColumn(collection: CollectionName, property: string): string {
    const column = propertyColumns[collection]?.[property] || property.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const table = collectionTables[collection];
    if (!this.columns.get(table)?.has(column)) {
      throw new Error(`Campo não permitido para ${table}: ${property}`);
    }
    return column;
  }

  private toSettingsColumn(property: string): string {
    const column = property.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (column === 'id' || !this.columns.get('site_settings')?.has(column)) {
      throw new Error(`Campo de configuração não permitido: ${property}`);
    }
    return column;
  }

  private fromRow<T>(collection: CollectionName | 'settings', row: Record<string, unknown>): T {
    const aliases = collection === 'settings' ? {} : columnProperties[collection] || {};
    const mapped: Record<string, unknown> = {};
    for (const [column, rawValue] of Object.entries(row)) {
      if (collection === 'settings' && column === 'id') continue;
      const property = aliases[column] || column.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      let value = rawValue;
      if (value instanceof Date) {
        value = dateOnlyColumns.has(column) ? value.toISOString().slice(0, 10) : value.toISOString();
      } else if (typeof value === 'string' && timeOnlyColumns.has(column)) {
        value = value.slice(0, 5);
      } else if (numericProperties.has(property) && value !== null && value !== undefined) {
        value = Number(value);
      }
      mapped[property] = value;
    }
    return mapped as T;
  }

  private async insertUsingClient<T>(
    client: PoolClient,
    collection: CollectionName,
    record: Record<string, unknown>,
    prefix?: string
  ): Promise<T> {
    const row = { ...record, id: record.id || `${prefix || collection}-${Date.now()}-${randomBytes(4).toString('hex')}` };
    const entries = Object.entries(row)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [this.toColumn(collection, property), value] as const);
    const table = collectionTables[collection];
    const columns = entries.map(([column]) => `"${column}"`);
    const values = entries.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const result = await client.query(
      `INSERT INTO "${table}" (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    return this.fromRow<T>(collection, result.rows[0]);
  }

  public async getCollection<T>(collection: CollectionName): Promise<T[]> {
    const table = collectionTables[collection];
    const orderBy = collectionOrder[collection];
    const result = await pool.query(`SELECT * FROM "${table}"${orderBy ? ` ORDER BY ${orderBy}` : ''}`);
    return result.rows.map(row => this.fromRow<T>(collection, row));
  }

  public async findById<T>(collection: CollectionName, id: string): Promise<T | undefined> {
    const table = collectionTables[collection];
    const result = await pool.query(`SELECT * FROM "${table}" WHERE id = $1`, [id]);
    return result.rows[0] ? this.fromRow<T>(collection, result.rows[0]) : undefined;
  }

  public async findUserByEmail<T>(email: string): Promise<T | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return result.rows[0] ? this.fromRow<T>('users', result.rows[0]) : undefined;
  }

  public async insert<T>(collection: CollectionName, record: Record<string, unknown>, prefix?: string): Promise<T> {
    const client = await pool.connect();
    try {
      return await this.insertUsingClient<T>(client, collection, record, prefix);
    } finally {
      client.release();
    }
  }

  public async update<T>(
    collection: CollectionName,
    id: string,
    updates: Record<string, unknown>
  ): Promise<T | undefined> {
    const entries = Object.entries(updates)
      .filter(([property, value]) => property !== 'id' && value !== undefined)
      .map(([property, value]) => [this.toColumn(collection, property), value] as const);
    if (!entries.length) return this.findById<T>(collection, id);

    const table = collectionTables[collection];
    const assignments = entries.map(([column], index) => `"${column}" = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);
    const result = await pool.query(
      `UPDATE "${table}" SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] ? this.fromRow<T>(collection, result.rows[0]) : undefined;
  }

  public async delete(collection: CollectionName, id: string): Promise<boolean> {
    const table = collectionTables[collection];
    const result = await pool.query(`DELETE FROM "${table}" WHERE id = $1`, [id]);
    return (result.rowCount || 0) > 0;
  }

  public async getSettings(): Promise<SiteSetting> {
    const result = await pool.query('SELECT * FROM site_settings WHERE id = 1');
    if (!result.rows[0]) throw new Error('Definições do portal não existem no PostgreSQL; execute a migração de dados.');
    return this.fromRow('settings', result.rows[0]);
  }

  public async updateSettings(updates: Partial<SiteSetting>): Promise<SiteSetting> {
    const entries = Object.entries(updates)
      .filter(([, value]) => value !== undefined)
      .map(([property, value]) => [this.toSettingsColumn(property), value] as const);
    if (entries.length) {
      await pool.query(
        `UPDATE site_settings SET ${entries.map(([column], index) => `"${column}" = $${index + 1}`).join(', ')} WHERE id = 1`,
        entries.map(([, value]) => value)
      );
    }
    return this.getSettings();
  }

  public async addLog(action: string, module: string, details: string, user = 'Sistema'): Promise<SystemLog> {
    return this.insert<SystemLog>('logs', {
      timestamp: new Date().toISOString(),
      user,
      action,
      module,
      details,
      ip: 'Sistema'
    }, 'log');
  }

  public async approveCoverageRequest(
    requestId: string,
    staffId: string,
    assignedDate?: string,
    assignedTime?: string
  ): Promise<{ request: Record<string, any>; schedule: Record<string, any> } | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const requestResult = await client.query('SELECT * FROM coverage_requests WHERE id = $1 FOR UPDATE', [requestId]);
      if (!requestResult.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }
      const request = this.fromRow<Record<string, any>>('coverage_requests', requestResult.rows[0]);
      const staffResult = await client.query('SELECT * FROM staff WHERE id = $1', [staffId]);
      if (!staffResult.rows[0]) throw new Error('O colaborador selecionado não existe.');
      const staff = this.fromRow<Record<string, any>>('staff', staffResult.rows[0]);
      const schedule = await this.insertUsingClient<Record<string, any>>(client, 'schedules', {
        serviceName: `Cobertura: ${request.eventTitle} (${request.churchOrEntity})`,
        departmentCode: staff.departmentCode,
        date: assignedDate || request.eventDate,
        startTime: assignedTime || request.eventTime || '09:00',
        endTime: '13:00',
        staffId: staff.id,
        staffName: staff.name,
        staffIds: [staff.id],
        staffNames: [staff.name],
        status: 'Pendente',
        notes: `Gerado automaticamente via API por aprovação do pedido ${request.id}. Contacto: ${request.requesterName} (${request.requesterPhone})`,
        location: request.location,
        coverageRequestId: request.id
      }, 'sch-cov');
      const updatedRequestResult = await client.query(
        'UPDATE coverage_requests SET status = $1, schedule_entry_id = $2 WHERE id = $3 RETURNING *',
        ['Aprovado', schedule.id, requestId]
      );
      await this.insertUsingClient(client, 'logs', {
        timestamp: new Date().toISOString(),
        user: 'Sistema',
        action: 'Aprovação de Cobertura & Escala Gerada',
        module: 'Correspondências',
        details: `Pedido "${request.eventTitle}" aprovado e agendado para ${staff.name}`,
        ip: 'Sistema'
      }, 'log');
      await client.query('COMMIT');
      return { request: this.fromRow('coverage_requests', updatedRequestResult.rows[0]), schedule };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async exportFullJSON(): Promise<string> {
    const [siteSettings, ...collections] = await Promise.all([
      this.getSettings(),
      ...restoreOrder.map(collection => this.getCollection(collection))
    ]);
    const data: Record<string, unknown> = { siteSettings };
    restoreOrder.forEach((collection, index) => { data[backupKeys[collection]] = collections[index]; });
    return JSON.stringify(data, null, 2);
  }

  public async migrateFromJSON(rawJson: string): Promise<Record<string, number>> {
    const parsed: Record<string, unknown> = JSON.parse(rawJson);
    const settings = parsed.settings || parsed.siteSettings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new Error('Backend/data/db.json não contém as definições do portal.');
    }

    const recordsByCollection = new Map<CollectionName, Record<string, unknown>[]>();
    for (const collection of restoreOrder) {
      const records = parsed[collection] ?? parsed[backupKeys[collection]];
      if (!Array.isArray(records)) {
        throw new Error(`Backend/data/db.json não contém a coleção ${collection}.`);
      }
      recordsByCollection.set(collection, records as Record<string, unknown>[]);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(746772392112::bigint)');
      const existing = await client.query<{ count: string }>(
        `SELECT
          (SELECT COUNT(*) FROM site_settings) +
          (SELECT COUNT(*) FROM users) +
          (SELECT COUNT(*) FROM articles) +
          (SELECT COUNT(*) FROM videos) +
          (SELECT COUNT(*) FROM artists) +
          (SELECT COUNT(*) FROM carousel_slides) +
          (SELECT COUNT(*) FROM departments) +
          (SELECT COUNT(*) FROM staff) +
          (SELECT COUNT(*) FROM coverage_requests) +
          (SELECT COUNT(*) FROM schedules) +
          (SELECT COUNT(*) FROM partnerships) +
          (SELECT COUNT(*) FROM music_requests) +
          (SELECT COUNT(*) FROM bookmarks) +
          (SELECT COUNT(*) FROM finances) +
          (SELECT COUNT(*) FROM assets) +
          (SELECT COUNT(*) FROM liabilities) +
          (SELECT COUNT(*) FROM tasks) +
          (SELECT COUNT(*) FROM system_logs) +
          (SELECT COUNT(*) FROM backups) +
          (SELECT COUNT(*) FROM visitor_pings) AS count`
      );
      if (Number(existing.rows[0].count) > 0) {
        throw new Error('A migração foi interrompida porque o PostgreSQL já contém dados. Não foram alterados registos.');
      }

      const settingEntries = Object.entries(settings as Record<string, unknown>)
        .filter(([, value]) => value !== undefined)
        .map(([property, value]) => [this.toSettingsColumn(property), value] as const);
      if (!settingEntries.length) throw new Error('O JSON não contém definições para importar.');
      const settingColumns = settingEntries.map(([column]) => `"${column}"`);
      await client.query(
        `INSERT INTO site_settings (id, ${settingColumns.join(', ')})
         VALUES (1, ${settingEntries.map((_, index) => `$${index + 1}`).join(', ')})`,
        settingEntries.map(([, value]) => value)
      );

      const counts: Record<string, number> = { settings: 1 };
      for (const collection of restoreOrder) {
        const records = recordsByCollection.get(collection) || [];
        for (const record of records) await this.insertUsingClient(client, collection, record);
        counts[collection] = records.length;
      }
      await client.query('COMMIT');
      return counts;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async restoreFromJSON(rawJson: string): Promise<void> {
    const parsed: Record<string, unknown> = JSON.parse(rawJson);
    if (
      !parsed.siteSettings ||
      typeof parsed.siteSettings !== 'object' ||
      Array.isArray(parsed.siteSettings)
    ) {
      throw new Error('O ficheiro de backup não contém siteSettings válido.');
    }
    for (const collection of restoreOrder) {
      if (!Array.isArray(parsed[backupKeys[collection]])) {
        throw new Error(`O ficheiro de backup não contém a lista ${backupKeys[collection]}.`);
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const collection of [...restoreOrder].reverse()) {
        await client.query(`DELETE FROM "${collectionTables[collection]}"`);
      }
      await client.query('DELETE FROM site_settings WHERE id = 1');
      const settingEntries = Object.entries(parsed.siteSettings as Record<string, unknown>)
        .filter(([, value]) => value !== undefined)
        .map(([property, value]) => [this.toSettingsColumn(property), value] as const);
      if (!settingEntries.length) throw new Error('O backup não contém definições do portal.');
      await client.query(
        `INSERT INTO site_settings (id, ${settingEntries.map(([column]) => `"${column}"`).join(', ')})
         VALUES (1, ${settingEntries.map((_, index) => `$${index + 1}`).join(', ')})`,
        settingEntries.map(([, value]) => value)
      );
      for (const collection of restoreOrder) {
        const records = parsed[backupKeys[collection]] as Record<string, unknown>[];
        for (const record of records) await this.insertUsingClient(client, collection, record);
      }
      await this.insertUsingClient(client, 'logs', {
        timestamp: new Date().toISOString(),
        user: 'Sistema',
        action: 'Restauro de Dados',
        module: 'Configurações',
        details: 'Base de dados restaurada via backup JSON',
        ip: 'Sistema'
      }, 'log');
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const db = new Database();
