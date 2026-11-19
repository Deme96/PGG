export type Language = 'pt' | 'en' | 'fr';

export type AdminPermission =
  | 'departments'
  | 'hr'
  | 'patrimony'
  | 'correspondence'
  | 'finances'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'journalist' | 'artist' | 'follower';
  avatar?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
  adminPermissions?: AdminPermission[];
  isActive?: boolean;
}

export interface Article {
  id: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  summary_pt: string;
  summary_en: string;
  summary_fr: string;
  content_pt: string;
  content_en: string;
  content_fr: string;
  category: 'Igrejas' | 'Música' | 'Testemunhos' | 'Eventos' | 'Juventude' | 'Opinião' | 'Internacional';
  author: string;
  authorRole?: string;
  date: string;
  imageUrl: string;
  readTime: string;
  isFeatured?: boolean;
  isAnnouncement?: boolean; // For "Novidades"
  views: number;
  tags: string[];
}

export interface Video {
  id: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  description_pt: string;
  description_en: string;
  description_fr: string;
  videoUrl: string;
  youtubeId: string;
  duration: string;
  category: 'Louvor & Adoração' | 'Pregações' | 'Reportagens' | 'Entrevistas' | 'Documentários';
  date: string;
  views: number;
}

export interface Artist {
  id: string;
  name: string;
  biography_pt: string;
  biography_en: string;
  biography_fr: string;
  genre: 'Gospel Tradicional' | 'Afro-Gospel' | 'Worship & Adoração' | 'Kizomba Gospel' | 'Gospel Rap' | 'Coral';
  location: string;
  imageUrl: string;
  church: string;
  popularSongs: string[];
  socialLinks: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    spotify?: string;
  };
  phone?: string;
  email?: string;
}

export interface CarouselSlide {
  id: string;
  title_pt: string;
  title_en: string;
  title_fr: string;
  subtitle_pt: string;
  subtitle_en: string;
  subtitle_fr: string;
  imageUrl: string;
  buttonText_pt: string;
  buttonText_en: string;
  buttonText_fr: string;
  buttonLink: string;
  active: boolean;
  order: number;
}

export type DepartmentCode = 
  | 'DIRECAO'
  | 'REPORTAGEM'
  | 'TRANSMISSAO'
  | 'REDACAO'
  | 'SECRETARIA_GERAL'
  | 'DESIGN_GRAFICO';

export interface Department {
  id: string;
  code: DepartmentCode;
  name_pt: string;
  name_en: string;
  name_fr: string;
  headOfDept: {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar: string;
  };
  description_pt: string;
  description_en: string;
  description_fr: string;
  responsibilities_pt: string[];
  responsibilities_en?: string[];
  responsibilities_fr?: string[];
  budget: number;
  memberCount: number;
  status: 'Ativo' | 'Em Operação' | 'Sob Revisão';
  iconName: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_pt: string;
  role_en: string;
  role_fr: string;
  departmentCode: DepartmentCode;
  status: 'Ativo' | 'Férias' | 'Licença' | 'Inativo';
  admissionDate: string;
  emergencyContact: string;
  avatarUrl: string;
  scheduleComplianceRating: number; // e.g. 96 (%)
  assignedTasksCount?: number;
}

export interface ScheduleEntry {
  id: string;
  serviceName: string;
  departmentCode: DepartmentCode;
  date: string;
  startTime: string;
  endTime: string;
  staffId: string;
  staffName: string;
  staffIds?: string[];
  staffNames?: string[];
  status: 'Cumprido' | 'Pendente' | 'Falta' | 'Justificado';
  notes?: string;
  coverageRequestId?: string;
  location?: string;
}

export interface CoverageRequest {
  id: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  eventTitle: string;
  eventType: 'Culto Especial' | 'Concerto Gospel' | 'Conferência' | 'Cruzada Evangelística' | 'Casamento / Cerimónia' | 'Lançamento de Álbum';
  churchOrEntity: string;
  location: string;
  eventDate: string;
  eventTime: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Concluído';
  notes?: string;
  scheduleEntryId?: string;
  createdAt: string;
}

export interface Partnership {
  id: string;
  partnerName: string;
  partnerType: 'Igreja' | 'Patrocinador' | 'ONG / Missão Internacional' | 'Media Partner';
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  agreementScope: string;
  startDate: string;
  endDate: string;
  status: 'Ativo' | 'Em Negociação' | 'Renovação' | 'Expirado';
  contributionValue: number;
}

export interface MusicRequest {
  id: string;
  artistName: string;
  contactPhone: string;
  contactEmail: string;
  songTitle: string;
  genre: string;
  audioUrl?: string;
  coverImageUrl?: string;
  biography?: string;
  church: string;
  requestedDate: string;
  sessionType: 'Publicação de Música' | 'Agendamento de Sessão de Estúdio' | 'Entrevista ao Vivo';
  status: 'Pendente' | 'Em Avaliação' | 'Aprovado' | 'Rejeitado';
  notes?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  savedAt: string;
}

export interface FinanceEntry {
  id: string;
  type: 'Entrada' | 'Saída';
  category: 
    | 'Dízimos & Ofertas' 
    | 'Patrocínio' 
    | 'Doações Internacionais' 
    | 'Publicidade' 
    | 'Serviços de Mídia' 
    | 'Equipamentos' 
    | 'Manutenção' 
    | 'Combustível / Deslocações' 
    | 'Comunicações / Internet' 
    | 'Honorários / Subsídios' 
    | 'Outros';
  amount: number;
  currency: 'XOF' | 'EUR' | 'USD';
  date: string;
  paymentMethod: 'Orange Money' | 'Wave' | 'Transferência Bancária' | 'Numerário' | 'Cheque';
  reference: string;
  description: string;
  registeredBy: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: 'Câmara & Óptica' | 'Áudio & Transmissão' | 'Informática' | 'Veículos' | 'Mobiliário' | 'Energia / Geradores';
  acquisitionDate: string;
  acquisitionCost: number;
  currency: 'XOF';
  condition: 'Novo' | 'Bom' | 'Requer Manutenção' | 'Avariado';
  location: string;
  assignedTo?: string;
  serialNumber?: string;
}

export interface Liability {
  id: string;
  creditor: string;
  description: string;
  amount: number;
  currency: 'XOF';
  dueDate: string;
  category: 'Serviços Públicos' | 'Aluguer' | 'Fornecedores de TI' | 'Manutenção' | 'Empréstimos';
  status: 'Pendente' | 'Pago' | 'Em Atraso' | 'Parcial';
}

export interface Task {
  id: string;
  title: string;
  departmentCode: DepartmentCode;
  assignedTo: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Em Progresso' | 'Concluído';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  details: string;
}

export interface Backup {
  id: string;
  filename: string;
  date: string;
  size: string;
  type: 'Completo' | 'Financeiro' | 'Conteúdo';
  recordsCount: number;
  createdBy: string;
}

export interface SiteSetting {
  portalName: string;
  slogan_pt: string;
  slogan_en: string;
  slogan_fr: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  defaultLanguage: Language;
  maintenanceMode: boolean;
  totalVisitorsCount: number;
}

export interface VisitorPing {
  id: string;
  ip: string;
  countryCode: string;
  countryName: string;
  city: string;
  lat: number;
  lng: number;
  timestamp: string;
  viewsCount: number;
}
