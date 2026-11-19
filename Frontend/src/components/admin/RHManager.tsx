import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Staff, ScheduleEntry, DepartmentCode } from '../../types';
import { GenericCRUDTable, Column } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Users,
  CalendarCheck,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Plus
} from 'lucide-react';

interface RHManagerProps {
  currentSubmenu: string;
  onSubmenuChange: (submenu: string) => void;
}

export const RHManager: React.FC<RHManagerProps> = ({ currentSubmenu, onSubmenuChange }) => {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    departments
  } = useData();
  const { t } = useLanguage();

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'staff' | 'schedule'; id: string }>({
    open: false,
    type: 'staff',
    id: ''
  });

  // Modal forms states
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffDept, setStaffDept] = useState<DepartmentCode>('REPORTAGEM');
  const [staffStatus, setStaffStatus] = useState<Staff['status']>('Ativo');
  const [staffAdmission, setStaffAdmission] = useState('');
  const [staffEmergency, setStaffEmergency] = useState('');
  const [staffRating, setStaffRating] = useState(90);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [schService, setSchService] = useState('');
  const [schDept, setSchDept] = useState<DepartmentCode>('REPORTAGEM');
  const [schDate, setSchDate] = useState('');
  const [schStart, setSchStart] = useState('09:00');
  const [schEnd, setSchEnd] = useState('13:00');
  const [schStaffIds, setSchStaffIds] = useState<string[]>([]);
  const [scheduleError, setScheduleError] = useState('');
  const [schStatus, setSchStatus] = useState<ScheduleEntry['status']>('Pendente');
  const [schNotes, setSchNotes] = useState('');
  const [schLocation, setSchLocation] = useState('');

  // Submenus tabs
  const submenus = [
    { id: 'pessoal', label: 'Pessoal & Fichas', icon: Users, count: staff.length },
    { id: 'escalas', label: 'Escalas de Serviço', icon: CalendarCheck, count: schedules.length }
  ];

  // =================== STAFF CRUD HANDLERS ===================
  const handleOpenNewStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPhone('');
    setStaffRole('');
    setStaffDept('REPORTAGEM');
    setStaffStatus('Ativo');
    setStaffAdmission(new Date().toISOString().substring(0, 10));
    setStaffEmergency('');
    setStaffRating(90);
    setStaffModalOpen(true);
  };

  const handleOpenEditStaff = (stf: Staff) => {
    setEditingStaffId(stf.id);
    setStaffName(stf.name);
    setStaffEmail(stf.email);
    setStaffPhone(stf.phone);
    setStaffRole(stf.role_pt);
    setStaffDept(stf.departmentCode);
    setStaffStatus(stf.status);
    setStaffAdmission(stf.admissionDate);
    setStaffEmergency(stf.emergencyContact);
    setStaffRating(stf.scheduleComplianceRating);
    setStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffRole) return;

    if (editingStaffId) {
      updateStaff(editingStaffId, {
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        role_pt: staffRole,
        departmentCode: staffDept,
        status: staffStatus,
        admissionDate: staffAdmission,
        emergencyContact: staffEmergency,
        scheduleComplianceRating: staffRating
      });
    } else {
      addStaff({
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
        role_pt: staffRole,
        role_en: staffRole,
        role_fr: staffRole,
        departmentCode: staffDept,
        status: staffStatus,
        admissionDate: staffAdmission,
        emergencyContact: staffEmergency,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150`,
        scheduleComplianceRating: staffRating,
        assignedTasksCount: 0
      });
    }
    setStaffModalOpen(false);
  };

  // Staff Table Columns
  const staffColumns: Column<Staff>[] = [
    {
      key: 'name',
      header: 'Colaborador',
      render: s => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatarUrl}
            alt={s.name}
            className="w-10 h-10 rounded-full object-cover border border-[#C9A44C]"
          />
          <div>
            <p className="font-bold text-xs text-slate-900">{s.name}</p>
            <p className="text-[11px] text-slate-500">{s.role_pt}</p>
          </div>
        </div>
      )
    },
    {
      key: 'departmentCode',
      header: 'Departamento',
      render: s => (
        <span className="px-2.5 py-1 rounded-md bg-[#14243B]/5 text-[#14243B] text-xs font-bold">
          {s.departmentCode}
        </span>
      )
    },
    {
      key: 'contact',
      header: 'Contactos',
      render: s => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-800 font-medium">{s.phone}</p>
          <p className="text-slate-400 text-[11px] truncate max-w-[140px]">{s.email}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: s => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            s.status === 'Ativo'
              ? 'bg-emerald-100 text-emerald-800'
              : s.status === 'Férias'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {s.status}
        </span>
      )
    },
    {
      key: 'scheduleComplianceRating',
      header: 'Assiduidade',
      render: s => (
        <div className="w-28">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>{s.scheduleComplianceRating}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#14243B] to-[#C9A44C] rounded-full"
              style={{ width: `${s.scheduleComplianceRating}%` }}
            />
          </div>
        </div>
      )
    }
  ];

  // =================== SCHEDULE CRUD HANDLERS ===================
  const handleOpenNewSchedule = () => {
    setEditingScheduleId(null);
    setSchService('');
    setSchDept('REPORTAGEM');
    setSchDate(new Date().toISOString().substring(0, 10));
    setSchStart('09:00');
    setSchEnd('13:00');
    setSchStaffIds(staff[0]?.id ? [staff[0].id] : []);
    setScheduleError('');
    setSchStatus('Pendente');
    setSchNotes('');
    setSchLocation('Estúdio Central Bissau');
    setScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (sch: ScheduleEntry) => {
    setEditingScheduleId(sch.id);
    setSchService(sch.serviceName);
    setSchDept(sch.departmentCode);
    setSchDate(sch.date);
    setSchStart(sch.startTime);
    setSchEnd(sch.endTime);
    setSchStaffIds(sch.staffIds?.length ? sch.staffIds : [sch.staffId]);
    setScheduleError('');
    setSchStatus(sch.status);
    setSchNotes(sch.notes || '');
    setSchLocation(sch.location || '');
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schService || !schDate || schStaffIds.length === 0) {
      setScheduleError('Selecione pelo menos um colaborador para a escala.');
      return;
    }

    const assigned = staff.filter(s => schStaffIds.includes(s.id));
    if (assigned.length === 0) {
      setScheduleError('Nenhum dos colaboradores selecionados está disponível.');
      return;
    }
    const staffIds = assigned.map(s => s.id);
    const staffNames = assigned.map(s => s.name);
    const staffId = staffIds[0];
    const staffName = staffNames.join(', ');
    setScheduleError('');

    if (editingScheduleId) {
      updateSchedule(editingScheduleId, {
        serviceName: schService,
        departmentCode: schDept,
        date: schDate,
        startTime: schStart,
        endTime: schEnd,
        staffId,
        staffName,
        staffIds,
        staffNames,
        status: schStatus,
        notes: schNotes,
        location: schLocation
      });
    } else {
      addSchedule({
        serviceName: schService,
        departmentCode: schDept,
        date: schDate,
        startTime: schStart,
        endTime: schEnd,
        staffId,
        staffName,
        staffIds,
        staffNames,
        status: schStatus,
        notes: schNotes,
        location: schLocation
      });
    }
    setScheduleModalOpen(false);
  };

  // Schedule Table Columns
  const scheduleColumns: Column<ScheduleEntry>[] = [
    {
      key: 'serviceName',
      header: 'Serviço / Atividade',
      render: s => (
        <div>
          <p className="font-bold text-xs text-slate-900 leading-snug">{s.serviceName}</p>
          {s.location && <p className="text-[11px] text-slate-500 mt-0.5">{s.location}</p>}
        </div>
      )
    },
    {
      key: 'departmentCode',
      header: 'Dept.',
      render: s => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
          {s.departmentCode}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Data & Horário',
      render: s => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{s.date}</p>
          <p className="text-slate-400 text-[11px] font-mono">{s.startTime} - {s.endTime}</p>
        </div>
      )
    },
    {
      key: 'staffName',
      header: 'Escalados',
      render: s => (
        <div className="flex flex-wrap gap-1">
          {(s.staffNames?.length ? s.staffNames : [s.staffName]).map(name => (
            <span key={name} className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-[#14243B]">
              {name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Cumprimento',
      render: s => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit ${
            s.status === 'Cumprido'
              ? 'bg-emerald-100 text-emerald-800'
              : s.status === 'Falta'
              ? 'bg-rose-100 text-rose-800'
              : s.status === 'Justificado'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {s.status === 'Cumprido' && <CheckCircle className="w-3 h-3" />}
          {s.status === 'Falta' && <AlertCircle className="w-3 h-3" />}
          {s.status === 'Pendente' && <Clock className="w-3 h-3" />}
          {s.status === 'Justificado' && <FileCheck className="w-3 h-3" />}
          <span>{s.status}</span>
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Submenu Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {submenus.map(sub => {
          const Icon = sub.icon;
          const isActive = currentSubmenu === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSubmenuChange(sub.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-[#14243B] text-[#C9A44C] shadow-md border border-[#C9A44C]/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 text-[#C9A44C]" />
              <span>{sub.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px]">
                {sub.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submenu 1: Pessoal */}
      {currentSubmenu === 'pessoal' && (
        <GenericCRUDTable
          data={staff}
          columns={staffColumns}
          keyExtractor={s => s.id}
          onCreate={handleOpenNewStaff}
          createLabel="Adicionar Colaborador"
          onEdit={handleOpenEditStaff}
          onDelete={s => setDeleteConfirm({ open: true, type: 'staff', id: s.id })}
          searchFilter={(s, q) =>
            s.name.toLowerCase().includes(q) ||
            s.role_pt.toLowerCase().includes(q) ||
            s.departmentCode.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 2: Escalas */}
      {currentSubmenu === 'escalas' && (
        <GenericCRUDTable
          data={schedules}
          columns={scheduleColumns}
          keyExtractor={s => s.id}
          onCreate={handleOpenNewSchedule}
          createLabel="Nova Escala de Serviço"
          onEdit={handleOpenEditSchedule}
          onDelete={s => setDeleteConfirm({ open: true, type: 'schedule', id: s.id })}
          searchFilter={(s, q) =>
            s.serviceName.toLowerCase().includes(q) ||
            (s.staffNames || [s.staffName]).some(name => name.toLowerCase().includes(q)) ||
            s.status.toLowerCase().includes(q)
          }
        />
      )}

      {/* Staff Modal */}
      {staffModalOpen && (
        <GenericModal
          isOpen={staffModalOpen}
          onClose={() => setStaffModalOpen(false)}
          title={editingStaffId ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveStaff} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correio Eletrónico *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={e => setStaffEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Função / Cargo *
                </label>
                <input
                  type="text"
                  required
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value)}
                  placeholder="Ex: Repórter Fotográfico"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Departamento *
                </label>
                <select
                  value={staffDept}
                  onChange={e => setStaffDept(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="DIRECAO">Direção</option>
                  <option value="REPORTAGEM">Reportagem</option>
                  <option value="TRANSMISSAO">Transmissão</option>
                  <option value="REDACAO">Redação</option>
                  <option value="SECRETARIA_GERAL">Secretaria Geral</option>
                  <option value="DESIGN_GRAFICO">Design Gráfico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telemóvel
                </label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={e => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado
                </label>
                <select
                  value={staffStatus}
                  onChange={e => setStaffStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Férias">Férias</option>
                  <option value="Licença">Licença</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assiduidade (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={staffRating}
                  onChange={e => setStaffRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStaffModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Ficha
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <GenericModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title={editingScheduleId ? 'Editar Escala de Serviço' : 'Nova Escala de Serviço'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveSchedule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Serviço / Atividade *
              </label>
              <input
                type="text"
                required
                value={schService}
                onChange={e => setSchService(e.target.value)}
                placeholder="Ex: Transmissão do Culto Dominical Central"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Colaboradores Designados *
                </label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {staff.map(s => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={schStaffIds.includes(s.id)}
                        onChange={event => {
                          setSchStaffIds(current =>
                            event.target.checked
                              ? [...current, s.id]
                              : current.filter(id => id !== s.id)
                          );
                          setScheduleError('');
                        }}
                        className="h-4 w-4 accent-[#C9A44C]"
                      />
                      <span className="font-semibold text-slate-700">{s.name}</span>
                      <span className="ml-auto text-xs text-slate-500">{s.departmentCode}</span>
                    </label>
                  ))}
                  {staff.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-slate-500">Adicione colaboradores antes de criar a escala.</p>
                  )}
                </div>
                {scheduleError && <p role="alert" className="mt-1 text-xs text-rose-600">{scheduleError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Departamento *
                </label>
                <select
                  value={schDept}
                  onChange={e => setSchDept(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="REPORTAGEM">Reportagem</option>
                  <option value="TRANSMISSAO">Transmissão</option>
                  <option value="REDACAO">Redação</option>
                  <option value="DESIGN_GRAFICO">Design Gráfico</option>
                  <option value="SECRETARIA_GERAL">Secretaria Geral</option>
                  <option value="DIRECAO">Direção</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={schDate}
                  onChange={e => setSchDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Início
                </label>
                <input
                  type="time"
                  value={schStart}
                  onChange={e => setSchStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Término
                </label>
                <input
                  type="time"
                  value={schEnd}
                  onChange={e => setSchEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Local / Igreja
                </label>
                <input
                  type="text"
                  value={schLocation}
                  onChange={e => setSchLocation(e.target.value)}
                  placeholder="Ex: Templo Central IEGB"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado de Cumprimento
                </label>
                <select
                  value={schStatus}
                  onChange={e => setSchStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Cumprido">Cumprido</option>
                  <option value="Falta">Falta</option>
                  <option value="Justificado">Justificado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observações Técnicas / Instruções
              </label>
              <textarea
                rows={2}
                value={schNotes}
                onChange={e => setSchNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Escala
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: 'staff', id: '' })}
        onConfirm={() => {
          if (deleteConfirm.type === 'staff') {
            deleteStaff(deleteConfirm.id);
          } else {
            deleteSchedule(deleteConfirm.id);
          }
        }}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
      />
    </div>
  );
};
