import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { FinanceEntry } from '../../types';
import { GenericCRUDTable, Column } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Coins,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  FileText
} from 'lucide-react';

interface FinancasManagerProps {
  currentSubmenu: string;
  onSubmenuChange: (submenu: string) => void;
}

export const FinancasManager: React.FC<FinancasManagerProps> = ({
  currentSubmenu,
  onSubmenuChange
}) => {
  const {
    finances,
    addFinanceEntry,
    updateFinanceEntry,
    deleteFinanceEntry,
    totalIncome,
    totalExpense,
    currentBalance,
    staff
  } = useData();
  const { t } = useLanguage();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<'Entrada' | 'Saída'>('Entrada');
  const [category, setCategory] = useState<FinanceEntry['category']>('Dízimos & Ofertas');
  const [amount, setAmount] = useState<number>(100000);
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<FinanceEntry['paymentMethod']>('Orange Money');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [registeredBy, setRegisteredBy] = useState('Pr. Daniel Sanhá');

  // Submenu tabs
  const submenus = [
    { id: 'entries', label: 'Entradas (Receitas)', icon: ArrowUpRight, count: finances.filter(f => f.type === 'Entrada').length },
    { id: 'exits', label: 'Saídas (Despesas)', icon: ArrowDownRight, count: finances.filter(f => f.type === 'Saída').length }
  ];

  const currentType = currentSubmenu === 'exits' ? 'Saída' : 'Entrada';
  const displayedFinances = finances.filter(f => f.type === currentType);

  const handleOpenNew = () => {
    setEditingId(null);
    setType(currentType);
    setCategory(currentType === 'Entrada' ? 'Dízimos & Ofertas' : 'Combustível / Deslocações');
    setAmount(150000);
    setDate(new Date().toISOString().substring(0, 10));
    setPaymentMethod('Wave');
    setReference(`REF-${Date.now().toString().slice(-6)}`);
    setDescription('');
    setRegisteredBy(staff[0]?.name || 'Pr. Daniel Sanhá');
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: FinanceEntry) => {
    setEditingId(entry.id);
    setType(entry.type);
    setCategory(entry.category);
    setAmount(entry.amount);
    setDate(entry.date);
    setPaymentMethod(entry.paymentMethod);
    setReference(entry.reference);
    setDescription(entry.description);
    setRegisteredBy(entry.registeredBy);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    if (editingId) {
      updateFinanceEntry(editingId, {
        type,
        category,
        amount,
        currency: 'XOF',
        date,
        paymentMethod,
        reference,
        description,
        registeredBy
      });
    } else {
      addFinanceEntry({
        type,
        category,
        amount,
        currency: 'XOF',
        date,
        paymentMethod,
        reference,
        description,
        registeredBy
      });
    }
    setModalOpen(false);
  };

  const columns: Column<FinanceEntry>[] = [
    {
      key: 'date',
      header: 'Data & Referência',
      render: f => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{f.date}</p>
          <p className="text-[10px] font-mono text-slate-400">{f.reference}</p>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Descrição / Finalidade',
      render: f => (
        <div>
          <p className="font-bold text-xs text-slate-900 leading-snug">{f.description}</p>
          <p className="text-[11px] text-slate-500">{f.category}</p>
        </div>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Método',
      render: f => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
          {f.paymentMethod === 'Orange Money' || f.paymentMethod === 'Wave' ? (
            <Smartphone className="w-3 h-3 text-[#C9A44C]" />
          ) : f.paymentMethod === 'Transferência Bancária' ? (
            <Building className="w-3 h-3 text-[#C9A44C]" />
          ) : (
            <Banknote className="w-3 h-3 text-[#C9A44C]" />
          )}
          <span>{f.paymentMethod}</span>
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Valor (XOF)',
      render: f => (
        <span
          className={`font-heading font-black text-xs ${
            f.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {f.type === 'Entrada' ? '+' : '-'} {f.amount.toLocaleString()} XOF
        </span>
      )
    },
    {
      key: 'registeredBy',
      header: 'Responsável',
      render: f => (
        <span className="text-xs text-slate-600">
          {f.registeredBy}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* 3 Header Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-[#14243B] via-[#0D1929] to-[#0A131F] text-white p-6 rounded-2xl shadow-card border border-[#C9A44C]/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#C9A44C] uppercase tracking-wider">
              {t('totalBalance')}
            </span>
            <p className="font-heading font-black text-2xl text-white mt-1">
              {currentBalance.toLocaleString()} <span className="text-xs font-sans text-[#C9A44C]">XOF</span>
            </p>
            <p className="text-[11px] text-slate-300 mt-1">Entradas &minus; Saídas em tempo real</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 text-[#C9A44C] flex items-center justify-center border border-white/10 shadow-gold">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Total Entradas */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Entradas
            </span>
            <p className="font-heading font-black text-2xl text-emerald-600 mt-1">
              +{totalIncome.toLocaleString()} <span className="text-xs font-sans text-slate-500">XOF</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{finances.filter(f => f.type === 'Entrada').length} lançamentos de receita</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Saídas */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-navy-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Saídas
            </span>
            <p className="font-heading font-black text-2xl text-rose-600 mt-1">
              -{totalExpense.toLocaleString()} <span className="text-xs font-sans text-slate-500">XOF</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{finances.filter(f => f.type === 'Saída').length} despesas contabilizadas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
      </div>

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

      {/* Financial Movements Table */}
      <GenericCRUDTable
        data={displayedFinances}
        columns={columns}
        keyExtractor={f => f.id}
        onCreate={handleOpenNew}
        createLabel={currentType === 'Entrada' ? 'Registar Nova Entrada' : 'Registar Nova Saída'}
        onEdit={handleOpenEdit}
        onDelete={f => {
          setDeletingId(f.id);
          setDeleteConfirmOpen(true);
        }}
        searchFilter={(f, q) =>
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.reference.toLowerCase().includes(q) ||
          f.paymentMethod.toLowerCase().includes(q)
        }
      />

      {/* Modal Form */}
      {modalOpen && (
        <GenericModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Editar Movimento Financeiro' : `Novo Movimento: ${type}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Movimento *
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                >
                  <option value="Entrada">Entrada (Receita)</option>
                  <option value="Saída">Saída (Despesa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Montante (XOF) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição da Operação *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Doação de parceiros para transmissão, Compra de cabos de som"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Dízimos & Ofertas">Dízimos & Ofertas</option>
                  <option value="Patrocínio">Patrocínio</option>
                  <option value="Doações Internacionais">Doações Internacionais</option>
                  <option value="Publicidade">Publicidade</option>
                  <option value="Serviços de Mídia">Serviços de Mídia</option>
                  <option value="Equipamentos">Equipamentos</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Combustível / Deslocações">Combustível / Deslocações</option>
                  <option value="Comunicações / Internet">Comunicações / Internet</option>
                  <option value="Honorários / Subsídios">Honorários / Subsídios</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Método de Pagamento *
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="Wave">Wave</option>
                  <option value="Transferência Bancária">Transferência Bancária (BAO / Ecobank)</option>
                  <option value="Numerário">Numerário / Caixa</option>
                  <option value="Cheque">Cheque</option>
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
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Referência
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registado por
                </label>
                <input
                  type="text"
                  value={registeredBy}
                  onChange={e => setRegisteredBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Lançamento
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteFinanceEntry(deletingId)}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
      />
    </div>
  );
};
