import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Asset, Liability } from '../../types';
import { GenericCRUDTable, Column } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Boxes,
  CreditCard,
  Camera,
  Radio,
  Truck,
  Zap,
  Computer,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

interface PatrimonioManagerProps {
  currentSubmenu: string;
  onSubmenuChange: (submenu: string) => void;
}

export const PatrimonioManager: React.FC<PatrimonioManagerProps> = ({
  currentSubmenu,
  onSubmenuChange
}) => {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    totalAssetsValue,
    liabilities,
    addLiability,
    updateLiability,
    deleteLiability,
    totalLiabilitiesValue,
    staff
  } = useData();
  const { t } = useLanguage();

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; type: 'asset' | 'liability'; id: string }>({
    open: false,
    type: 'asset',
    id: ''
  });

  // Modal forms
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetCode, setAssetCode] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetCat, setAssetCat] = useState<Asset['category']>('Câmara & Óptica');
  const [assetCost, setAssetCost] = useState(0);
  const [assetDate, setAssetDate] = useState('');
  const [assetCondition, setAssetCondition] = useState<Asset['condition']>('Bom');
  const [assetLocation, setAssetLocation] = useState('Estúdio Bissau');
  const [assetAssignedTo, setAssetAssignedTo] = useState('');
  const [assetSerial, setAssetSerial] = useState('');

  const [liabModalOpen, setLiabModalOpen] = useState(false);
  const [editingLiabId, setEditingLiabId] = useState<string | null>(null);
  const [liabCreditor, setLiabCreditor] = useState('');
  const [liabDesc, setLiabDesc] = useState('');
  const [liabAmount, setLiabAmount] = useState(0);
  const [liabDueDate, setLiabDueDate] = useState('');
  const [liabCat, setLiabCat] = useState<Liability['category']>('Serviços Públicos');
  const [liabStatus, setLiabStatus] = useState<Liability['status']>('Pendente');

  const submenus = [
    { id: 'ativos', label: 'Ativos & Equipamento', icon: Boxes, count: assets.length },
    { id: 'passivos', label: 'Passivos & Dívidas', icon: CreditCard, count: liabilities.length }
  ];

  // =================== ASSETS HANDLERS ===================
  const handleOpenNewAsset = () => {
    setEditingAssetId(null);
    setAssetCode(`PGG-EQP-${assets.length + 1}`);
    setAssetName('');
    setAssetCat('Câmara & Óptica');
    setAssetCost(500000);
    setAssetDate(new Date().toISOString().substring(0, 10));
    setAssetCondition('Bom');
    setAssetLocation('Estúdio Bissau');
    setAssetAssignedTo(staff[0]?.name || '');
    setAssetSerial('');
    setAssetModalOpen(true);
  };

  const handleOpenEditAsset = (ast: Asset) => {
    setEditingAssetId(ast.id);
    setAssetCode(ast.code);
    setAssetName(ast.name);
    setAssetCat(ast.category);
    setAssetCost(ast.acquisitionCost);
    setAssetDate(ast.acquisitionDate);
    setAssetCondition(ast.condition);
    setAssetLocation(ast.location);
    setAssetAssignedTo(ast.assignedTo || '');
    setAssetSerial(ast.serialNumber || '');
    setAssetModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetCode || !assetName) return;

    if (editingAssetId) {
      updateAsset(editingAssetId, {
        code: assetCode,
        name: assetName,
        category: assetCat,
        acquisitionCost: assetCost,
        acquisitionDate: assetDate,
        condition: assetCondition,
        location: assetLocation,
        assignedTo: assetAssignedTo,
        serialNumber: assetSerial
      });
    } else {
      addAsset({
        code: assetCode,
        name: assetName,
        category: assetCat,
        acquisitionCost: assetCost,
        currency: 'XOF',
        acquisitionDate: assetDate,
        condition: assetCondition,
        location: assetLocation,
        assignedTo: assetAssignedTo,
        serialNumber: assetSerial
      });
    }
    setAssetModalOpen(false);
  };

  // Asset Table Columns
  const assetColumns: Column<Asset>[] = [
    {
      key: 'code',
      header: 'Código',
      render: a => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
          {a.code}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Item / Equipamento',
      render: a => (
        <div>
          <p className="font-bold text-xs text-slate-900 leading-snug">{a.name}</p>
          <p className="text-[11px] text-slate-500">S/N: {a.serialNumber || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Categoria',
      render: a => (
        <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {a.category}
        </span>
      )
    },
    {
      key: 'acquisitionCost',
      header: 'Valor Contabilístico',
      render: a => (
        <span className="font-heading font-bold text-xs text-[#14243B]">
          {a.acquisitionCost.toLocaleString()} XOF
        </span>
      )
    },
    {
      key: 'condition',
      header: 'Estado',
      render: a => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            a.condition === 'Novo'
              ? 'bg-emerald-100 text-emerald-800'
              : a.condition === 'Bom'
              ? 'bg-blue-100 text-blue-800'
              : a.condition === 'Requer Manutenção'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {a.condition}
        </span>
      )
    },
    {
      key: 'assignedTo',
      header: 'Alocado a',
      render: a => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{a.assignedTo || 'Geral'}</p>
          <p className="text-[10px] text-slate-400">{a.location}</p>
        </div>
      )
    }
  ];

  // =================== LIABILITIES HANDLERS ===================
  const handleOpenNewLiab = () => {
    setEditingLiabId(null);
    setLiabCreditor('');
    setLiabDesc('');
    setLiabAmount(200000);
    setLiabDueDate(new Date().toISOString().substring(0, 10));
    setLiabCat('Serviços Públicos');
    setLiabStatus('Pendente');
    setLiabModalOpen(true);
  };

  const handleOpenEditLiab = (liab: Liability) => {
    setEditingLiabId(liab.id);
    setLiabCreditor(liab.creditor);
    setLiabDesc(liab.description);
    setLiabAmount(liab.amount);
    setLiabDueDate(liab.dueDate);
    setLiabCat(liab.category);
    setLiabStatus(liab.status);
    setLiabModalOpen(true);
  };

  const handleSaveLiab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liabCreditor || !liabDesc) return;

    if (editingLiabId) {
      updateLiability(editingLiabId, {
        creditor: liabCreditor,
        description: liabDesc,
        amount: liabAmount,
        dueDate: liabDueDate,
        category: liabCat,
        status: liabStatus
      });
    } else {
      addLiability({
        creditor: liabCreditor,
        description: liabDesc,
        amount: liabAmount,
        currency: 'XOF',
        dueDate: liabDueDate,
        category: liabCat,
        status: liabStatus
      });
    }
    setLiabModalOpen(false);
  };

  // Liability Table Columns
  const liabColumns: Column<Liability>[] = [
    {
      key: 'creditor',
      header: 'Credor / Fornecedor',
      render: l => (
        <div>
          <p className="font-bold text-xs text-slate-900">{l.creditor}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{l.description}</p>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Categoria',
      render: l => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
          {l.category}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Montante',
      render: l => (
        <span className="font-heading font-black text-xs text-rose-600">
          {l.amount.toLocaleString()} XOF
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      render: l => (
        <span className="text-xs text-slate-600 font-medium">
          {l.dueDate}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: l => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            l.status === 'Pago'
              ? 'bg-emerald-100 text-emerald-800'
              : l.status === 'Parcial'
              ? 'bg-blue-100 text-blue-800'
              : l.status === 'Em Atraso'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {l.status}
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

      {/* Summary Valuation Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl shadow-soft border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Património em Ativos (Equipamento / Infraestrutura)
            </span>
            <p className="font-heading font-black text-2xl text-[#14243B] mt-1">
              {totalAssetsValue.toLocaleString()} <span className="text-xs font-sans text-[#C9A44C]">XOF</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C9A44C] flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl shadow-soft border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Passivos Pendentes (Dívidas a Vencer)
            </span>
            <p className="font-heading font-black text-2xl text-rose-600 mt-1">
              {totalLiabilitiesValue.toLocaleString()} <span className="text-xs font-sans text-slate-500">XOF</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Submenu 1: Ativos */}
      {currentSubmenu === 'ativos' && (
        <GenericCRUDTable
          data={assets}
          columns={assetColumns}
          keyExtractor={a => a.id}
          onCreate={handleOpenNewAsset}
          createLabel="Registar Novo Ativo"
          onEdit={handleOpenEditAsset}
          onDelete={a => setDeleteConfirm({ open: true, type: 'asset', id: a.id })}
          searchFilter={(a, q) =>
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 2: Passivos */}
      {currentSubmenu === 'passivos' && (
        <GenericCRUDTable
          data={liabilities}
          columns={liabColumns}
          keyExtractor={l => l.id}
          onCreate={handleOpenNewLiab}
          createLabel="Registar Dívida / Passivo"
          onEdit={handleOpenEditLiab}
          onDelete={l => setDeleteConfirm({ open: true, type: 'liability', id: l.id })}
          searchFilter={(l, q) =>
            l.creditor.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.category.toLowerCase().includes(q)
          }
        />
      )}

      {/* Asset Modal */}
      {assetModalOpen && (
        <GenericModal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          title={editingAssetId ? 'Editar Ativo' : 'Registar Novo Ativo'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveAsset} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Código de Identificação *
                </label>
                <input
                  type="text"
                  required
                  value={assetCode}
                  onChange={e => setAssetCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Série (S/N)
                </label>
                <input
                  type="text"
                  value={assetSerial}
                  onChange={e => setAssetSerial(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Equipamento / Bem *
              </label>
              <input
                type="text"
                required
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                placeholder="Ex: Mesa de Mistura Digital Behringer X32"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria *
                </label>
                <select
                  value={assetCat}
                  onChange={e => setAssetCat(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Câmara & Óptica">Câmara & Óptica</option>
                  <option value="Áudio & Transmissão">Áudio & Transmissão</option>
                  <option value="Informática">Informática</option>
                  <option value="Veículos">Veículos</option>
                  <option value="Mobiliário">Mobiliário</option>
                  <option value="Energia / Geradores">Energia / Geradores</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Custo de Aquisição (XOF) *
                </label>
                <input
                  type="number"
                  required
                  value={assetCost}
                  onChange={e => setAssetCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data de Aquisição
                </label>
                <input
                  type="date"
                  value={assetDate}
                  onChange={e => setAssetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado de Conservação
                </label>
                <select
                  value={assetCondition}
                  onChange={e => setAssetCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Novo">Novo</option>
                  <option value="Bom">Bom</option>
                  <option value="Requer Manutenção">Requer Manutenção</option>
                  <option value="Avariado">Avariado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Localização
                </label>
                <input
                  type="text"
                  value={assetLocation}
                  onChange={e => setAssetLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alocado ao Colaborador
              </label>
              <input
                type="text"
                value={assetAssignedTo}
                onChange={e => setAssetAssignedTo(e.target.value)}
                placeholder="Ex: Moisés Gomes"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Ativo
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Liability Modal */}
      {liabModalOpen && (
        <GenericModal
          isOpen={liabModalOpen}
          onClose={() => setLiabModalOpen(false)}
          title={editingLiabId ? 'Editar Passivo' : 'Registar Passivo / Dívida'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveLiab} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Credor / Fornecedor *
              </label>
              <input
                type="text"
                required
                value={liabCreditor}
                onChange={e => setLiabCreditor(e.target.value)}
                placeholder="Ex: EAGB Bissau, Fornecedor de Cabos"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição da Dívida / Fatura *
              </label>
              <textarea
                rows={2}
                required
                value={liabDesc}
                onChange={e => setLiabDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Montante a Pagar (XOF) *
                </label>
                <input
                  type="number"
                  required
                  value={liabAmount}
                  onChange={e => setLiabAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data Limite de Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={liabDueDate}
                  onChange={e => setLiabDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={liabCat}
                  onChange={e => setLiabCat(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Serviços Públicos">Serviços Públicos (EAGB)</option>
                  <option value="Aluguer">Aluguer de Instalações</option>
                  <option value="Fornecedores de TI">Fornecedores de TI & Equipamento</option>
                  <option value="Manutenção">Manutenção de Veículos / Geradores</option>
                  <option value="Empréstimos">Empréstimos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estado
                </label>
                <select
                  value={liabStatus}
                  onChange={e => setLiabStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Parcial">Pagamento Parcial</option>
                  <option value="Em Atraso">Em Atraso</option>
                  <option value="Pago">Pago / Liquidado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLiabModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Passivo
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: 'asset', id: '' })}
        onConfirm={() => {
          if (deleteConfirm.type === 'asset') {
            deleteAsset(deleteConfirm.id);
          } else {
            deleteLiability(deleteConfirm.id);
          }
        }}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
      />
    </div>
  );
};
