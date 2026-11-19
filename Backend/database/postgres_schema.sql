BEGIN;

CREATE TABLE IF NOT EXISTS site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  portal_name TEXT NOT NULL,
  slogan_pt TEXT NOT NULL,
  slogan_en TEXT NOT NULL,
  slogan_fr TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  facebook_url TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  default_language TEXT NOT NULL CHECK (default_language IN ('pt', 'en', 'fr')),
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  total_visitors_count BIGINT NOT NULL DEFAULT 0 CHECK (total_visitors_count >= 0)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'journalist', 'artist', 'follower')),
  avatar TEXT,
  phone TEXT,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  admin_permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  password_hash TEXT,
  password_salt TEXT,
  CONSTRAINT users_admin_permissions_valid CHECK (
    admin_permissions <@ ARRAY[
      'departments', 'hr', 'patrimony', 'correspondence', 'finances', 'settings'
    ]::TEXT[]
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  summary_pt TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_fr TEXT NOT NULL,
  content_pt TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Igrejas', 'Música', 'Testemunhos', 'Eventos', 'Juventude', 'Opinião', 'Internacional')
  ),
  author TEXT NOT NULL,
  author_role TEXT,
  published_date DATE NOT NULL,
  image_url TEXT NOT NULL,
  read_time TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_announcement BOOLEAN NOT NULL DEFAULT FALSE,
  views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0),
  tags TEXT[] NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS articles_date_idx ON articles (published_date DESC);
CREATE INDEX IF NOT EXISTS articles_announcement_idx ON articles (is_announcement, published_date DESC);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  video_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Louvor & Adoração', 'Pregações', 'Reportagens', 'Entrevistas', 'Documentários')
  ),
  published_date DATE NOT NULL,
  views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0)
);
CREATE INDEX IF NOT EXISTS videos_date_idx ON videos (published_date DESC);

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  biography_pt TEXT NOT NULL,
  biography_en TEXT NOT NULL,
  biography_fr TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (
    genre IN ('Gospel Tradicional', 'Afro-Gospel', 'Worship & Adoração', 'Kizomba Gospel', 'Gospel Rap', 'Coral')
  ),
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  church TEXT NOT NULL,
  popular_songs TEXT[] NOT NULL DEFAULT '{}',
  social_links JSONB NOT NULL DEFAULT '{}'::JSONB,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS carousel_slides (
  id TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  subtitle_pt TEXT NOT NULL,
  subtitle_en TEXT NOT NULL,
  subtitle_fr TEXT NOT NULL,
  image_url TEXT NOT NULL,
  button_text_pt TEXT NOT NULL,
  button_text_en TEXT NOT NULL,
  button_text_fr TEXT NOT NULL,
  button_link TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS carousel_slides_order_idx ON carousel_slides (active, display_order);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (
    code IN ('DIRECAO', 'REPORTAGEM', 'TRANSMISSAO', 'REDACAO', 'SECRETARIA_GERAL', 'DESIGN_GRAFICO')
  ),
  name_pt TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  head_of_department JSONB NOT NULL,
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  responsibilities_pt TEXT[] NOT NULL DEFAULT '{}',
  responsibilities_en TEXT[] NOT NULL DEFAULT '{}',
  responsibilities_fr TEXT[] NOT NULL DEFAULT '{}',
  budget NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (budget >= 0),
  member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Em Operação', 'Sob Revisão')),
  icon_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  role_pt TEXT NOT NULL,
  role_en TEXT NOT NULL,
  role_fr TEXT NOT NULL,
  department_code TEXT NOT NULL REFERENCES departments(code) ON UPDATE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Férias', 'Licença', 'Inativo')),
  admission_date DATE NOT NULL,
  emergency_contact TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  schedule_compliance_rating NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (schedule_compliance_rating BETWEEN 0 AND 100),
  assigned_tasks_count INTEGER CHECK (assigned_tasks_count >= 0)
);
CREATE INDEX IF NOT EXISTS staff_department_idx ON staff (department_code);

CREATE TABLE IF NOT EXISTS coverage_requests (
  id TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'Culto Especial', 'Concerto Gospel', 'Conferência', 'Cruzada Evangelística',
      'Casamento / Cerimónia', 'Lançamento de Álbum'
    )
  ),
  church_or_entity TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Aprovado', 'Recusado', 'Concluído')),
  notes TEXT,
  schedule_entry_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS coverage_requests_status_date_idx
  ON coverage_requests (status, event_date);

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  service_name TEXT NOT NULL,
  department_code TEXT NOT NULL REFERENCES departments(code) ON UPDATE CASCADE,
  service_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  staff_id TEXT REFERENCES staff(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  staff_ids TEXT[] NOT NULL DEFAULT '{}',
  staff_names TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('Cumprido', 'Pendente', 'Falta', 'Justificado')),
  notes TEXT,
  coverage_request_id TEXT REFERENCES coverage_requests(id) ON DELETE SET NULL,
  location TEXT
);
CREATE INDEX IF NOT EXISTS schedules_date_status_idx ON schedules (service_date, status);
CREATE INDEX IF NOT EXISTS schedules_department_idx ON schedules (department_code, service_date);
CREATE UNIQUE INDEX IF NOT EXISTS schedules_coverage_request_uq
  ON schedules (coverage_request_id) WHERE coverage_request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS partnerships (
  id TEXT PRIMARY KEY,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (
    partner_type IN ('Igreja', 'Patrocinador', 'ONG / Missão Internacional', 'Media Partner')
  ),
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  agreement_scope TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Ativo', 'Em Negociação', 'Renovação', 'Expirado')),
  contribution_value NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (contribution_value >= 0)
);

CREATE TABLE IF NOT EXISTS music_requests (
  id TEXT PRIMARY KEY,
  artist_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  song_title TEXT NOT NULL,
  genre TEXT NOT NULL,
  audio_url TEXT,
  cover_image_url TEXT,
  biography TEXT,
  church TEXT NOT NULL,
  requested_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (
    session_type IN ('Publicação de Música', 'Agendamento de Sessão de Estúdio', 'Entrevista ao Vivo')
  ),
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Em Avaliação', 'Aprovado', 'Rejeitado')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  saved_at DATE NOT NULL,
  CONSTRAINT bookmarks_user_article_uq UNIQUE (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS finances (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Entrada', 'Saída')),
  category TEXT NOT NULL CHECK (
    category IN (
      'Dízimos & Ofertas', 'Patrocínio', 'Doações Internacionais', 'Publicidade',
      'Serviços de Mídia', 'Equipamentos', 'Manutenção', 'Combustível / Deslocações',
      'Comunicações / Internet', 'Honorários / Subsídios', 'Outros'
    )
  ),
  amount NUMERIC(18, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL CHECK (currency IN ('XOF', 'EUR', 'USD')),
  entry_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (
    payment_method IN ('Orange Money', 'Wave', 'Transferência Bancária', 'Numerário', 'Cheque')
  ),
  reference TEXT NOT NULL,
  description TEXT NOT NULL,
  registered_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS finances_date_type_idx ON finances (entry_date DESC, type);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Câmara & Óptica', 'Áudio & Transmissão', 'Informática', 'Veículos', 'Mobiliário', 'Energia / Geradores')
  ),
  acquisition_date DATE NOT NULL,
  acquisition_cost NUMERIC(18, 2) NOT NULL CHECK (acquisition_cost >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF' CHECK (currency = 'XOF'),
  condition TEXT NOT NULL CHECK (condition IN ('Novo', 'Bom', 'Requer Manutenção', 'Avariado')),
  location TEXT NOT NULL,
  assigned_to TEXT,
  serial_number TEXT
);
CREATE INDEX IF NOT EXISTS assets_code_idx ON assets (code);

CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY,
  creditor TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF' CHECK (currency = 'XOF'),
  due_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Serviços Públicos', 'Aluguer', 'Fornecedores de TI', 'Manutenção', 'Empréstimos')
  ),
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Em Atraso', 'Parcial'))
);
CREATE INDEX IF NOT EXISTS liabilities_status_due_idx ON liabilities (status, due_date);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department_code TEXT NOT NULL REFERENCES departments(code) ON UPDATE CASCADE,
  assigned_to TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Alta', 'Média', 'Baixa')),
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Em Progresso', 'Concluído'))
);
CREATE INDEX IF NOT EXISTS tasks_status_due_idx ON tasks (status, due_date);

CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  logged_at TIMESTAMPTZ NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  ip TEXT NOT NULL,
  details TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS system_logs_logged_at_idx ON system_logs (logged_at DESC);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Completo', 'Financeiro', 'Conteúdo')),
  records_count INTEGER NOT NULL CHECK (records_count >= 0),
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visitor_pings (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  visited_at TIMESTAMPTZ NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 1 CHECK (views_count > 0)
);
CREATE INDEX IF NOT EXISTS visitor_pings_visited_at_idx ON visitor_pings (visited_at DESC);

COMMIT;
