import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  ClipboardList,
  Building2,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  User,
  Check,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { GenericModal } from '../common/GenericModal';
import { AdminPermission } from '../../types';

interface AdminDashboardProps {
  isRootAdmin: boolean;
  permissions: AdminPermission[];
  onNavigateSubmenu: (menu: string, submenu: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isRootAdmin, permissions, onNavigateSubmenu }) => {
  const {
    totalIncome,
    totalExpense,
    currentBalance,
    finances,
    staff,
    schedules,
    departments,
    coverageRequests,
    tasks,
    updateTask,
    approveCoverageAndCreateSchedule
  } = useData();
  const { t, getLocalized } = useLanguage();

  // Selected coverage request for quick approval modal
  const [approvingRequest, setApprovingRequest] = useState<any | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || '');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignedTime, setAssignedTime] = useState('');

  // Schedule compliance overall
  const completedSchedules = schedules.filter(s => s.status === 'Cumprido').length;
  const totalSchedulesCount = schedules.length || 1;
  const overallCompliance = Math.round((completedSchedules / totalSchedulesCount) * 100);

  // Pending tasks
  const pendingTasks = tasks.filter(t => t.status !== 'Concluído');

  // Pending coverage queue
  const pendingCoverageQueue = coverageRequests.filter(c => c.status === 'Pendente');

  // Sorted staff by compliance rating
  const sortedStaffCompliance = [...staff].sort(
    (a, b) => b.scheduleComplianceRating - a.scheduleComplianceRating
  );

  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const entries = finances.filter(entry => entry.date.startsWith(monthKey));
      return {
        key: monthKey,
        label: new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(month).replace('.', ''),
        income: entries.filter(entry => entry.type === 'Entrada').reduce((sum, entry) => sum + entry.amount, 0),
        expense: entries.filter(entry => entry.type === 'Saída').reduce((sum, entry) => sum + entry.amount, 0)
      };
    });
  }, [finances]);

  const chartBounds = { left: 58, right: 716, top: 20, bottom: 194 };
  const chartMaximum = Math.max(1, ...monthlyTrend.flatMap(month => [month.income, month.expense]));
  const chartX = (index: number) =>
    chartBounds.left + (index * (chartBounds.right - chartBounds.left)) / Math.max(monthlyTrend.length - 1, 1);
  const chartY = (value: number) =>
    chartBounds.bottom - (value / chartMaximum) * (chartBounds.bottom - chartBounds.top);
  const linePath = (key: 'income' | 'expense') =>
    monthlyTrend.map((month, index) => `${index === 0 ? 'M' : 'L'} ${chartX(index)} ${chartY(month[key])}`).join(' ');
  const areaPath = (key: 'income' | 'expense') =>
    `${linePath(key)} L ${chartX(monthlyTrend.length - 1)} ${chartBounds.bottom} L ${chartX(0)} ${chartBounds.bottom} Z`;
  const compactCurrency = (value: number) =>
    new Intl.NumberFormat('pt-PT', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const handleOpenApproveModal = (req: any) => {
    setApprovingRequest(req);
    setSelectedStaffId(staff[0]?.id || '');
    setAssignedDate(req.eventDate || '');
    setAssignedTime(req.eventTime || '09:00');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingRequest) return;
    approveCoverageAndCreateSchedule(
      approvingRequest.id,
      selectedStaffId,
      assignedDate,
      assignedTime
    );
    setApprovingRequest(null);
  };

  if (!isRootAdmin) {
    const managementAreas: Array<{ permission: AdminPermission; label: string; submenu: string }> = [
      { permission: 'departments', label: 'Departamentos', submenu: 'direcao' },
      { permission: 'hr', label: 'Recursos Humanos', submenu: 'pessoal' },
      { permission: 'patrimony', label: 'Património', submenu: 'ativos' },
      { permission: 'correspondence', label: 'Correspondências', submenu: 'cobertura' },
      { permission: 'finances', label: 'Finanças', submenu: 'entries' },
      { permission: 'settings', label: 'Configurações', submenu: 'sistema' }
    ];
    const availableAreas = managementAreas.filter(area => permissions.includes(area.permission));

    return (
      <section className="rounded-2xl border border-[#C9A44C]/30 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-bold text-[#14243B]">Bem-vindo à área de gestão</h2>
        <p className="mt-1 text-xs text-slate-600">Aceda às áreas autorizadas para a sua conta.</p>
        {availableAreas.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableAreas.map(area => (
              <button
                key={area.permission}
                onClick={() => onNavigateSubmenu(area.permission, area.submenu)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-left text-xs font-bold text-[#14243B] transition-colors hover:border-[#C9A44C] hover:bg-amber-50"
              >
                {area.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            A sua conta ainda não tem privilégios de gestão atribuídos. Contacte o administrador principal.
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Disponível */}
        <div
          onClick={() => onNavigateSubmenu('finances', 'entries')}
          className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalBalance')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#14243B] text-[#C9A44C] flex items-center justify-center shadow-gold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-[#14243B] tracking-tight">
            {currentBalance.toLocaleString()} <span className="text-sm font-sans font-bold text-[#C9A44C]">XOF</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Saldo líquido calculado em tempo real</span>
          </div>
        </div>

        {/* Card 2: Receitas vs Despesas */}
        <div
          onClick={() => onNavigateSubmenu('finances', 'entries')}
          className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('monthlyIncome')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            +{totalIncome.toLocaleString()} <span className="text-sm font-sans font-bold text-slate-500">XOF</span>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Dízimos, ofertas, apoios e parcerias
          </div>
        </div>

        {/* Card 3: Saídas */}
        <div
          onClick={() => onNavigateSubmenu('finances', 'exits')}
          className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('monthlyExpense')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            -{totalExpense.toLocaleString()} <span className="text-sm font-sans font-bold text-slate-500">XOF</span>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Combustível, estúdio, internet e material
          </div>
        </div>

        {/* Card 4: Cumprimento de Escalas */}
        <div
          onClick={() => onNavigateSubmenu('hr', 'schedules')}
          className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('scheduleCompliance')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C9A44C] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl text-[#14243B] tracking-tight">
            {overallCompliance}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span>{completedSchedules} de {schedules.length} escalas cumpridas</span>
          </div>
        </div>
      </div>

      {/* Row 2: Financial Trend Chart + Ranking of Staff Schedule Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial Flow Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-navy-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#14243B]">
                  {t('revenueVsExpense')}
                </h3>
                <p className="text-xs text-slate-500">
                  Comparativo global de entradas e despesas registadas no portal
                </p>
              </div>
              <button
                onClick={() => onNavigateSubmenu('finances', 'entries')}
                className="text-xs text-[#C9A44C] font-bold hover:underline flex items-center gap-1"
              >
                Detalhes &rarr;
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/50 p-3 sm:p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Tendência mensal · últimos 6 meses</p>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Receitas
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Despesas
                  </span>
                </div>
              </div>
              <svg
                viewBox="0 0 760 240"
                role="img"
                aria-label="Gráfico de tendência mensal de receitas e despesas"
                className="h-56 w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="income-mist" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity=".28" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity=".015" />
                  </linearGradient>
                  <linearGradient id="expense-mist" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity=".22" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity=".015" />
                  </linearGradient>
                  <filter id="humid-glow" x="-20%" y="-30%" width="140%" height="160%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                {[0, 1, 2, 3].map(step => {
                  const y = chartBounds.top + (step * (chartBounds.bottom - chartBounds.top)) / 3;
                  const value = chartMaximum * (1 - step / 3);
                  return (
                    <g key={step}>
                      <line x1={chartBounds.left} x2={chartBounds.right} y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="3 6" />
                      <text x={chartBounds.left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="11">
                        {compactCurrency(value)}
                      </text>
                    </g>
                  );
                })}
                <path d={areaPath('income')} fill="url(#income-mist)" />
                <path d={areaPath('expense')} fill="url(#expense-mist)" />
                <path d={linePath('income')} fill="none" stroke="#10b981" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".22" filter="url(#humid-glow)" />
                <path d={linePath('expense')} fill="none" stroke="#f43f5e" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".2" filter="url(#humid-glow)" />
                <path d={linePath('income')} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d={linePath('expense')} fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {monthlyTrend.map((month, index) => (
                  <g key={month.key}>
                    <circle cx={chartX(index)} cy={chartY(month.income)} r="4" fill="white" stroke="#059669" strokeWidth="2.5">
                      <title>{month.label}: receitas {month.income.toLocaleString()} XOF</title>
                    </circle>
                    <circle cx={chartX(index)} cy={chartY(month.expense)} r="4" fill="white" stroke="#e11d48" strokeWidth="2.5">
                      <title>{month.label}: despesas {month.expense.toLocaleString()} XOF</title>
                    </circle>
                    <text x={chartX(index)} y={chartBounds.bottom + 22} textAnchor="middle" fill="#475569" fontSize="12">
                      {month.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Ranking de Cumprimento de Escalas por Colaborador */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-soft border border-navy-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#14243B]">
                  {t('topCollaborators')}
                </h3>
                <p className="text-xs text-slate-500">
                  Assiduidade e pontualidade dos membros da equipa
                </p>
              </div>
              <button
                onClick={() => onNavigateSubmenu('hr', 'schedules')}
                className="text-xs text-[#C9A44C] font-bold hover:underline"
              >
                Ver Escalas &rarr;
              </button>
            </div>

            <div className="space-y-3.5 mt-2">
              {sortedStaffCompliance.slice(0, 5).map((collab, index) => (
                <div key={collab.id} className="flex items-center gap-3">
                  <span className="w-5 font-heading font-bold text-xs text-[#C9A44C]">
                    #{index + 1}
                  </span>
                  <img
                    src={collab.avatarUrl}
                    alt={collab.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#C9A44C]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="truncate text-slate-800">{collab.name}</span>
                      <span className="text-[#14243B] font-bold">
                        {collab.scheduleComplianceRating}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#14243B] to-[#C9A44C] rounded-full"
                        style={{ width: `${collab.scheduleComplianceRating}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Pending Coverage Queue (with APPROVE & SCHEDULE button) & Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coverage Requests Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-navy-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C9A44C]" />
              <h3 className="font-heading font-bold text-base text-[#14243B]">
                {t('coverageQueue')} ({pendingCoverageQueue.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateSubmenu('correspondence', 'coverage')}
              className="text-xs text-[#C9A44C] font-bold hover:underline"
            >
              Ver Todas &rarr;
            </button>
          </div>

          {pendingCoverageQueue.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Não existem pedidos de cobertura pendentes.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingCoverageQueue.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{req.eventTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-600 border border-slate-200">
                        {req.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {req.churchOrEntity} &bull; {req.location}
                    </p>
                    <p className="text-[11px] text-[#C9A44C] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {req.eventDate} às {req.eventTime} &bull; Contacto: {req.requesterName} ({req.requesterPhone})
                    </p>
                  </div>

                  {/* APPROVE & SCHEDULE ACTION BUTTON */}
                  <button
                    onClick={() => handleOpenApproveModal(req)}
                    className="px-3.5 py-2 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#C9A44C]" />
                    <span>{t('approveAndSchedule')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks & Assignments */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-soft border border-navy-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#C9A44C]" />
              <h3 className="font-heading font-bold text-base text-[#14243B]">
                {t('pendingTasks')} ({pendingTasks.length})
              </h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => updateTask(task.id, { status: 'Concluído' })}
                    className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-[#C9A44C] flex items-center justify-center transition-colors bg-white"
                    title="Marcar como concluída"
                  >
                    {task.status === 'Concluído' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Atribuído a: {task.assignedTo} &bull; Prazo: {task.dueDate}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.priority === 'Alta'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Status of the 6 Departments */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C9A44C]" />
            <h3 className="font-heading font-bold text-base text-[#14243B]">
              {t('activeDepartments')} (6 Departamentos Ativos)
            </h3>
          </div>
          <button
            onClick={() => onNavigateSubmenu('departments', 'direcao')}
            className="text-xs text-[#C9A44C] font-bold hover:underline"
          >
            Gerir Departamentos &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => {
            const submenuId = dept.code.toLowerCase().replace('_', '');
            return (
              <div
                key={dept.id}
                onClick={() => onNavigateSubmenu('departments', submenuId)}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-[#C9A44C]/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#14243B] group-hover:text-[#C9A44C] transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9A44C]"></span>
                    {getLocalized(dept, 'name')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {dept.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {getLocalized(dept, 'description')}
                </p>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#C9A44C]" />
                    {dept.headOfDept.name.split(' ')[0]}
                  </span>
                  <span>{dept.memberCount} colaboradores</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve & Schedule Modal Dialog */}
      {approvingRequest && (
        <GenericModal
          isOpen={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
          title="Aprovar Pedido & Gerar Escala"
          subtitle={`Evento: ${approvingRequest.eventTitle}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmApproval} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              Ao aprovar, o pedido mudará para o estado <strong>Aprovado</strong> e será criada automaticamente uma nova entrada de serviço na <strong>Escala de Recursos Humanos</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Colaborador Designado para o Serviço *
              </label>
              <select
                required
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} &mdash; {s.role_pt} ({s.departmentCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data da Escala *
                </label>
                <input
                  type="date"
                  required
                  value={assignedDate}
                  onChange={e => setAssignedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hora de Início *
                </label>
                <input
                  type="time"
                  required
                  value={assignedTime}
                  onChange={e => setAssignedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4 text-[#C9A44C]" />
                <span>Confirmar Aprovação & Gerar Escala</span>
              </button>
            </div>
          </form>
        </GenericModal>
      )}
    </div>
  );
};
