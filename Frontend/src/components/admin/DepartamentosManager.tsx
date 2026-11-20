import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Department, DepartmentCode } from '../../types';
import {
  Compass,
  Mic,
  Radio,
  FileText,
  Building2,
  Palette,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Coins,
  Users,
  Edit2,
  Plus,
  Trash2
} from 'lucide-react';
import { GenericModal } from '../common/GenericModal';

interface DepartamentosManagerProps {
  currentSubmenu: string;
  onSubmenuChange: (submenu: string) => void;
}

export const DepartamentosManager: React.FC<DepartamentosManagerProps> = ({
  currentSubmenu,
  onSubmenuChange
}) => {
  const { departments, updateDepartment, staff } = useData();
  const { t, getLocalized } = useLanguage();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states
  const [namePt, setNamePt] = useState('');
  const [descPt, setDescPt] = useState('');
  const [budget, setBudget] = useState(0);
  const [headName, setHeadName] = useState('');
  const [headPhone, setHeadPhone] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResp, setNewResp] = useState('');

  // Department Submenu Config matching user prompt:
  // "Departamentos: Direção, Reportagem, Transmissão, redação, Secretaria Geral e Design gráfico."
  const submenus: { id: string; code: DepartmentCode; label: string; icon: any }[] = [
    { id: 'direcao', code: 'DIRECAO', label: 'Direção', icon: Compass },
    { id: 'reportagem', code: 'REPORTAGEM', label: 'Reportagem', icon: Mic },
    { id: 'transmissao', code: 'TRANSMISSAO', label: 'Transmissão', icon: Radio },
    { id: 'redacao', code: 'REDACAO', label: 'Redação', icon: FileText },
    { id: 'secretariageral', code: 'SECRETARIA_GERAL', label: 'Secretaria Geral', icon: Building2 },
    { id: 'designgrafico', code: 'DESIGN_GRAFICO', label: 'Design Gráfico', icon: Palette }
  ];

  // Map currentSubmenu to active department
  const activeSubmenuConfig = submenus.find(s => s.id === currentSubmenu) || submenus[0];
  const activeDepartment = departments.find(d => d.code === activeSubmenuConfig.code);

  // Team members belonging to this department
  const deptStaff = activeDepartment
    ? staff.filter(s => s.departmentCode === activeDepartment.code)
    : [];

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setNamePt(dept.name_pt);
    setDescPt(dept.description_pt);
    setBudget(dept.budget);
    setHeadName(dept.headOfDept.name);
    setHeadPhone(dept.headOfDept.phone);
    setHeadEmail(dept.headOfDept.email);
    setResponsibilities([...dept.responsibilities_pt]);
    setEditModalOpen(true);
  };

  const handleAddResponsibility = () => {
    if (!newResp.trim()) return;
    setResponsibilities(prev => [...prev, newResp.trim()]);
    setNewResp('');
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    updateDepartment(selectedDept.id, {
      name_pt: namePt,
      description_pt: descPt,
      budget,
      responsibilities_pt: responsibilities,
      headOfDept: {
        ...selectedDept.headOfDept,
        name: headName,
        phone: headPhone,
        email: headEmail
      }
    });

    setEditModalOpen(false);
  };

  if (!activeDepartment) {
    return (
      <section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Não há departamentos configurados. Atualize os dados do sistema ou contacte o administrador.
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Submenus Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {submenus.map(sub => {
          const Icon = sub.icon;
          const isActive = activeSubmenuConfig.id === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSubmenuChange(sub.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#14243B] text-[#C9A44C] shadow-md border border-[#C9A44C]/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 text-[#C9A44C]" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Department Dossier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-navy-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#14243B] text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A44C]"></span>
              Departamento {activeSubmenuConfig.label}
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
              {getLocalized(activeDepartment, 'name')}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {getLocalized(activeDepartment, 'description')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenEdit(activeDepartment)}
              className="px-4 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs flex items-center gap-1.5 hover:bg-[#1E3554] transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Departamento</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Orçamento Afeto
            </span>
            <p className="font-heading font-black text-xl text-[#14243B] mt-1">
              {activeDepartment.budget.toLocaleString()} <span className="text-xs font-sans text-[#C9A44C]">XOF</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Equipa Alocada
            </span>
            <p className="font-heading font-black text-xl text-[#14243B] mt-1">
              {deptStaff.length} Colaboradores
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Estado Operacional
            </span>
            <p className="font-heading font-black text-xl text-emerald-600 mt-1">
              {activeDepartment.status}
            </p>
          </div>
        </div>

        {/* Split: Responsible Leader (Left) & Responsibilities Checklist (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Head of Dept */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#14243B] to-[#0D1929] text-white p-6 rounded-2xl shadow-card border border-[#C9A44C]/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#C9A44C] uppercase tracking-widest">
                Responsável pelo Departamento
              </span>
              <div className="flex items-center gap-4 my-4">
                <img
                  src={activeDepartment.headOfDept.avatar}
                  alt={activeDepartment.headOfDept.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9A44C]"
                />
                <div>
                  <h4 className="font-heading font-bold text-lg text-white">
                    {activeDepartment.headOfDept.name}
                  </h4>
                  <p className="text-xs text-slate-300">{activeDepartment.headOfDept.role}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A44C]" />
                  <span>{activeDepartment.headOfDept.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A44C]" />
                  <span>{activeDepartment.headOfDept.email}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 text-[11px] text-slate-400 italic">
              Supervisão direta com prestação de contas à Direção Executiva.
            </div>
          </div>

          {/* Right: Responsibilities */}
          <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
            <h4 className="font-heading font-bold text-sm text-[#14243B] uppercase tracking-wider mb-3">
              Competências e Responsabilidades Oficiais
            </h4>
            <ul className="space-y-2.5">
              {activeDepartment.responsibilities_pt.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A44C] shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Staff Members List */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="font-heading font-bold text-sm text-[#14243B] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C9A44C]" />
            Membros Integrantes do Departamento ({deptStaff.length})
          </h4>

          {deptStaff.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum colaborador atribuído atualmente a este departamento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deptStaff.map(member => (
                <div key={member.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#C9A44C]"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{member.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{member.role_pt}</p>
                    <p className="text-[10px] text-[#C9A44C] font-semibold">{member.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Department Modal */}
      {editModalOpen && selectedDept && (
        <GenericModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Editar Departamento: ${selectedDept.code}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Departamento *
              </label>
              <input
                type="text"
                required
                value={namePt}
                onChange={e => setNamePt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição Geral *
              </label>
              <textarea
                rows={2}
                required
                value={descPt}
                onChange={e => setDescPt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Orçamento Afeto (XOF)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={headName}
                  onChange={e => setHeadName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telemóvel do Responsável
                </label>
                <input
                  type="text"
                  value={headPhone}
                  onChange={e => setHeadPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email do Responsável
                </label>
                <input
                  type="email"
                  value={headEmail}
                  onChange={e => setHeadEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Responsibilities editor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lista de Responsabilidades
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newResp}
                  onChange={e => setNewResp(e.target.value)}
                  placeholder="Nova competência ou atribuição..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="px-3 py-1.5 bg-[#14243B] text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {responsibilities.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(i)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Gravar Alterações
              </button>
            </div>
          </form>
        </GenericModal>
      )}
    </div>
  );
};
