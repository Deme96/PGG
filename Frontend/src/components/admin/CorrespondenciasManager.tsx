import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { CoverageRequest, Partnership, MusicRequest } from '../../types';
import { GenericCRUDTable, Column } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Radio,
  Handshake,
  Music,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  User,
  ExternalLink,
  Plus
} from 'lucide-react';

interface CorrespondenciasManagerProps {
  currentSubmenu: string;
  onSubmenuChange: (submenu: string) => void;
}

export const CorrespondenciasManager: React.FC<CorrespondenciasManagerProps> = ({
  currentSubmenu,
  onSubmenuChange
}) => {
  const {
    coverageRequests,
    addCoverageRequest,
    updateCoverageRequest,
    deleteCoverageRequest,
    approveCoverageAndCreateSchedule,
    partnerships,
    addPartnership,
    updatePartnership,
    deletePartnership,
    musicRequests,
    updateMusicRequest,
    deleteMusicRequest,
    staff
  } = useData();
  const { t } = useLanguage();

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'coverage' | 'partnership' | 'music'; id: string }>({
    open: false,
    type: 'coverage',
    id: ''
  });

  // Approve and Schedule Dialog
  const [approvingReq, setApprovingReq] = useState<CoverageRequest | null>(null);
  const [assignedStaffId, setAssignedStaffId] = useState(staff[0]?.id || '');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignedTime, setAssignedTime] = useState('09:00');

  // Partnership Modal
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [partName, setPartName] = useState('');
  const [partType, setPartType] = useState<Partnership['partnerType']>('Igreja');
  const [partContact, setPartContact] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partPhone, setPartPhone] = useState('');
  const [partCountry, setPartCountry] = useState('Guiné-Bissau');
  const [partScope, setPartScope] = useState('');
  const [partStart, setPartStart] = useState('');
  const [partEnd, setPartEnd] = useState('');
  const [partStatus, setPartStatus] = useState<Partnership['status']>('Ativo');
  const [partValue, setPartValue] = useState(0);

  // Submenu Tabs config matching prompt:
  // "Correspondencias: Pedidos de cobertura, Parcerias e acordos, Pedidos de publicação."
  const submenus = [
    { id: 'cobertura', label: 'Pedidos de Cobertura', icon: Radio, count: coverageRequests.length },
    { id: 'parcerias', label: 'Parcerias e Acordos', icon: Handshake, count: partnerships.length },
    { id: 'publicacao', label: 'Pedidos de Publicação', icon: Music, count: musicRequests.length }
  ];

  // =================== COVERAGE HANDLERS ===================
  const handleOpenApproveModal = (req: CoverageRequest) => {
    setApprovingReq(req);
    setAssignedStaffId(staff[0]?.id || '');
    setAssignedDate(req.eventDate || '');
    setAssignedTime(req.eventTime || '09:00');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingReq) return;
    approveCoverageAndCreateSchedule(approvingReq.id, assignedStaffId, assignedDate, assignedTime);
    setApprovingReq(null);
  };

  const handleRejectCoverage = (req: CoverageRequest) => {
    updateCoverageRequest(req.id, { status: 'Recusado' });
  };

  const coverageColumns: Column<CoverageRequest>[] = [
    {
      key: 'eventTitle',
      header: 'Evento & Igreja',
      render: r => (
        <div>
          <p className="font-bold text-xs text-slate-900 leading-snug">{r.eventTitle}</p>
          <p className="text-[11px] text-slate-500">{r.churchOrEntity} &bull; {r.location}</p>
        </div>
      )
    },
    {
      key: 'eventType',
      header: 'Tipo',
      render: r => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
          {r.eventType}
        </span>
      )
    },
    {
      key: 'eventDate',
      header: 'Data & Hora',
      render: r => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{r.eventDate}</p>
          <p className="text-slate-400 text-[11px] font-mono">{r.eventTime}</p>
        </div>
      )
    },
    {
      key: 'requesterName',
      header: 'Solicitante',
      render: r => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">{r.requesterName}</p>
          <p className="text-slate-400 text-[11px]">{r.requesterPhone}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: r => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit ${
            r.status === 'Aprovado'
              ? 'bg-emerald-100 text-emerald-800'
              : r.status === 'Recusado'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {r.status === 'Aprovado' && <CheckCircle className="w-3 h-3" />}
          {r.status === 'Recusado' && <XCircle className="w-3 h-3" />}
          {r.status === 'Pendente' && <Clock className="w-3 h-3" />}
          <span>{r.status}</span>
        </span>
      )
    }
  ];

  // =================== PARTNERSHIPS HANDLERS ===================
  const handleOpenNewPart = () => {
    setEditingPartId(null);
    setPartName('');
    setPartType('Igreja');
    setPartContact('');
    setPartEmail('');
    setPartPhone('');
    setPartCountry('Guiné-Bissau');
    setPartScope('');
    setPartStart(new Date().toISOString().substring(0, 10));
    setPartEnd('2027-12-31');
    setPartStatus('Ativo');
    setPartValue(1000000);
    setPartModalOpen(true);
  };

  const handleOpenEditPart = (p: Partnership) => {
    setEditingPartId(p.id);
    setPartName(p.partnerName);
    setPartType(p.partnerType);
    setPartContact(p.contactPerson);
    setPartEmail(p.email);
    setPartPhone(p.phone);
    setPartCountry(p.country);
    setPartScope(p.agreementScope);
    setPartStart(p.startDate);
    setPartEnd(p.endDate);
    setPartStatus(p.status);
    setPartValue(p.contributionValue);
    setPartModalOpen(true);
  };

  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partContact) return;

    if (editingPartId) {
      updatePartnership(editingPartId, {
        partnerName: partName,
        partnerType: partType,
        contactPerson: partContact,
        email: partEmail,
        phone: partPhone,
        country: partCountry,
        agreementScope: partScope,
        startDate: partStart,
        endDate: partEnd,
        status: partStatus,
        contributionValue: partValue
      });
    } else {
      addPartnership({
        partnerName: partName,
        partnerType: partType,
        contactPerson: partContact,
        email: partEmail,
        phone: partPhone,
        country: partCountry,
        agreementScope: partScope,
        startDate: partStart,
        endDate: partEnd,
        status: partStatus,
        contributionValue: partValue
      });
    }
    setPartModalOpen(false);
  };

  const partnershipColumns: Column<Partnership>[] = [
    {
      key: 'partnerName',
      header: 'Entidade / Parceiro',
      render: p => (
        <div>
          <p className="font-bold text-xs text-slate-900">{p.partnerName}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{p.agreementScope}</p>
        </div>
      )
    },
    {
      key: 'partnerType',
      header: 'Tipo',
      render: p => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
          {p.partnerType}
        </span>
      )
    },
    {
      key: 'contactPerson',
      header: 'Representante',
      render: p => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{p.contactPerson}</p>
          <p className="text-slate-400 text-[11px]">{p.phone}</p>
        </div>
      )
    },
    {
      key: 'contributionValue',
      header: 'Aporte Anual',
      render: p => (
        <span className="font-heading font-bold text-xs text-[#14243B]">
          {p.contributionValue.toLocaleString()} XOF
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: p => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            p.status === 'Ativo'
              ? 'bg-emerald-100 text-emerald-800'
              : p.status === 'Renovação'
              ? 'bg-blue-100 text-blue-800'
              : p.status === 'Em Negociação'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {p.status}
        </span>
      )
    }
  ];

  // =================== MUSIC PUBLISH HANDLERS ===================
  const musicColumns: Column<MusicRequest>[] = [
    {
      key: 'songTitle',
      header: 'Faixa & Artista',
      render: m => (
        <div>
          <p className="font-bold text-xs text-slate-900">{m.songTitle}</p>
          <p className="text-[11px] text-[#C9A44C] font-semibold">{m.artistName} &bull; {m.genre}</p>
        </div>
      )
    },
    {
      key: 'sessionType',
      header: 'Tipo de Pedido',
      render: m => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
          {m.sessionType}
        </span>
      )
    },
    {
      key: 'church',
      header: 'Congregação',
      render: m => (
        <span className="text-xs text-slate-600 truncate max-w-[150px] inline-block">
          {m.church}
        </span>
      )
    },
    {
      key: 'audioUrl',
      header: 'Áudio & Capa',
      render: m => (
        <div className="flex min-w-44 items-center gap-2">
          {m.coverImageUrl ? (
            <img
              src={m.coverImageUrl}
              alt={`Capa de ${m.songTitle}`}
              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <Music className="h-4 w-4" />
            </div>
          )}
          {m.audioUrl?.startsWith('/api/uploads/') ? (
            <audio controls preload="none" src={m.audioUrl} className="h-8 w-40" aria-label={`Ouvir ${m.songTitle}`} />
          ) : m.audioUrl ? (
            <a href={m.audioUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#14243B] underline">
              Abrir áudio
            </a>
          ) : (
            <span className="text-xs text-slate-400">Sem áudio</span>
          )}
        </div>
      )
    },
    {
      key: 'contactPhone',
      header: 'Contacto',
      render: m => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{m.contactPhone}</p>
          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{m.contactEmail}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: m => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            m.status === 'Aprovado'
              ? 'bg-emerald-100 text-emerald-800'
              : m.status === 'Rejeitado'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {m.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Submenus Pills */}
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

      {/* Submenu 1: Cobertura */}
      {currentSubmenu === 'cobertura' && (
        <GenericCRUDTable
          data={coverageRequests}
          columns={coverageColumns}
          keyExtractor={r => r.id}
          customActions={[
            {
              key: 'approve',
              label: 'Aprovar & Gerar Escala',
              icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
              className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200',
              showIf: r => r.status === 'Pendente',
              onClick: r => handleOpenApproveModal(r)
            },
            {
              key: 'reject',
              label: 'Recusar',
              icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
              className: 'bg-rose-50 hover:bg-rose-100 text-rose-700',
              showIf: r => r.status === 'Pendente',
              onClick: r => handleRejectCoverage(r)
            }
          ]}
          onDelete={r => setDeleteConfirm({ open: true, type: 'coverage', id: r.id })}
          searchFilter={(r, q) =>
            r.eventTitle.toLowerCase().includes(q) ||
            r.churchOrEntity.toLowerCase().includes(q) ||
            r.requesterName.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 2: Parcerias */}
      {currentSubmenu === 'parcerias' && (
        <GenericCRUDTable
          data={partnerships}
          columns={partnershipColumns}
          keyExtractor={p => p.id}
          onCreate={handleOpenNewPart}
          createLabel="Registar Parceria / Acordo"
          onEdit={handleOpenEditPart}
          onDelete={p => setDeleteConfirm({ open: true, type: 'partnership', id: p.id })}
          searchFilter={(p, q) =>
            p.partnerName.toLowerCase().includes(q) ||
            p.contactPerson.toLowerCase().includes(q) ||
            p.partnerType.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 3: Pedidos de Publicação */}
      {currentSubmenu === 'publicacao' && (
        <GenericCRUDTable
          data={musicRequests}
          columns={musicColumns}
          keyExtractor={m => m.id}
          customActions={[
            {
              key: 'approve_music',
              label: 'Aprovar Faixa',
              icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
              className: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800',
              showIf: m => m.status !== 'Aprovado',
              onClick: m => updateMusicRequest(m.id, { status: 'Aprovado' })
            },
            {
              key: 'reject_music',
              label: 'Rejeitar',
              icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
              className: 'bg-rose-50 hover:bg-rose-100 text-rose-700',
              showIf: m => m.status !== 'Rejeitado',
              onClick: m => updateMusicRequest(m.id, { status: 'Rejeitado' })
            }
          ]}
          onDelete={m => setDeleteConfirm({ open: true, type: 'music', id: m.id })}
          searchFilter={(m, q) =>
            m.songTitle.toLowerCase().includes(q) ||
            m.artistName.toLowerCase().includes(q) ||
            m.genre.toLowerCase().includes(q)
          }
        />
      )}

      {/* Approve & Schedule Modal Dialog */}
      {approvingReq && (
        <GenericModal
          isOpen={!!approvingReq}
          onClose={() => setApprovingReq(null)}
          title="Aprovar Pedido & Gerar Escala"
          subtitle={`Evento: ${approvingReq.eventTitle}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmApproval} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              O pedido mudará para o estado <strong>Aprovado</strong> e gerará uma nova entrada de serviço na <strong>Escala de Recursos Humanos</strong> com os dados abaixo.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Colaborador Designado para o Serviço *
              </label>
              <select
                required
                value={assignedStaffId}
                onChange={e => setAssignedStaffId(e.target.value)}
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
                onClick={() => setApprovingReq(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554] flex items-center gap-2 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar & Gerar Escala</span>
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Partnership Modal */}
      {partModalOpen && (
        <GenericModal
          isOpen={partModalOpen}
          onClose={() => setPartModalOpen(false)}
          title={editingPartId ? 'Editar Parceria' : 'Registar Nova Parceria'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSavePart} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome da Entidade / Parceiro *
              </label>
              <input
                type="text"
                required
                value={partName}
                onChange={e => setPartName(e.target.value)}
                placeholder="Ex: Convenção Batista, Rádio Sol Mansi"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Parceiro *
                </label>
                <select
                  value={partType}
                  onChange={e => setPartType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Igreja">Igreja / Denominação</option>
                  <option value="Patrocinador">Patrocinador Empresarial</option>
                  <option value="ONG / Missão Internacional">ONG / Missão Internacional</option>
                  <option value="Media Partner">Media Partner (Rádio/TV)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  País de Origem
                </label>
                <input
                  type="text"
                  value={partCountry}
                  onChange={e => setPartCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pessoa de Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={partContact}
                  onChange={e => setPartContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telemóvel
                </label>
                <input
                  type="text"
                  value={partPhone}
                  onChange={e => setPartPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={partEmail}
                  onChange={e => setPartEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Âmbito do Acordo / Protocolo
              </label>
              <textarea
                rows={2}
                value={partScope}
                onChange={e => setPartScope(e.target.value)}
                placeholder="Ex: Cobertura mútua e apoio técnico em streaming..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Aporte Financeiro Anual (XOF)
                </label>
                <input
                  type="number"
                  value={partValue}
                  onChange={e => setPartValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado do Acordo
                </label>
                <select
                  value={partStatus}
                  onChange={e => setPartStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Negociação">Em Negociação</option>
                  <option value="Renovação">Renovação</option>
                  <option value="Expirado">Expirado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPartModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Acordo
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: 'coverage', id: '' })}
        onConfirm={() => {
          if (deleteConfirm.type === 'coverage') {
            deleteCoverageRequest(deleteConfirm.id);
          } else if (deleteConfirm.type === 'partnership') {
            deletePartnership(deleteConfirm.id);
          } else {
            deleteMusicRequest(deleteConfirm.id);
          }
        }}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
      />
    </div>
  );
};
