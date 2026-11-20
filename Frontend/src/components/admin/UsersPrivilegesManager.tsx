import React, { useEffect, useState } from 'react';
import { AdminPermission, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GenericCRUDTable, Column, CustomAction } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { KeyRound, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { ImageUrlUploadField } from '../common/ImageUrlUploadField';

const ROOT_ADMIN_EMAIL = 'admin@portalgospel.gw';

const permissionOptions: Array<{ value: AdminPermission; label: string }> = [
  { value: 'departments', label: 'Departamentos' },
  { value: 'hr', label: 'Recursos Humanos e escalas' },
  { value: 'patrimony', label: 'Património' },
  { value: 'correspondence', label: 'Correspondências' },
  { value: 'finances', label: 'Finanças' },
  { value: 'settings', label: 'Configurações, conteúdo e auditoria' }
];

const isRootAdmin = (user: User) =>
  user.role === 'admin' && user.email.toLowerCase() === ROOT_ADMIN_EMAIL;

export const UsersPrivilegesManager: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('journalist');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);

  useEffect(() => {
    let isMounted = true;
    api.getAdminUsers().then(records => {
      if (!isMounted) return;
      if (records) {
        setUsers(records);
      } else {
        setErrorMessage('Não foi possível carregar os utilizadores. Verifique a ligação ao servidor.');
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('journalist');
    setPhone('');
    setAvatar('');
    setPassword('');
    setCurrentPassword('');
    setIsActive(true);
    setSelectedPermissions([]);
    setErrorMessage('');
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPhone(user.phone || '');
    setAvatar(user.avatar || '');
    setPassword('');
    setCurrentPassword('');
    setIsActive(user.isActive !== false);
    setSelectedPermissions(user.adminPermissions || []);
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Preencha o nome e o e-mail do utilizador.');
      return;
    }
    const rootAccount = editingUser ? isRootAdmin(editingUser) : false;
    if (!editingUser && password.length < 12) {
      setErrorMessage('Defina uma palavra-passe inicial com pelo menos 12 caracteres.');
      return;
    }
    if (rootAccount && password && currentPassword.length === 0) {
      setErrorMessage('Informe a palavra-passe atual para alterar a conta principal.');
      return;
    }

    const userData: Omit<User, 'id'> = {
      name: name.trim(),
      email: email.trim(),
      role,
      phone: phone.trim() || undefined,
      avatar: avatar.trim() || undefined,
      twoFactorEnabled: editingUser?.twoFactorEnabled ?? false,
      isActive,
      ...(!rootAccount ? { adminPermissions: selectedPermissions } : {})
    };

    setIsSaving(true);
    setErrorMessage('');
    try {
      const savedUser = editingUser
        ? await api.updateAdminUser(editingUser.id, {
            ...userData,
            ...(password ? { password, ...(rootAccount ? { currentPassword } : {}) } : {})
          })
        : await api.createAdminUser({ ...userData, password });
      if (!savedUser) throw new Error('O servidor não confirmou a alteração do utilizador.');

      setUsers(current =>
        editingUser
          ? current.map(user => user.id === savedUser.id ? savedUser : user)
          : [savedUser, ...current]
      );
      if (currentUser?.id === savedUser.id) updateUser(savedUser);
      setModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível guardar o utilizador.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await api.deleteAdminUser(deleteTarget.id);
    if (!result) {
      setErrorMessage('Não foi possível eliminar o utilizador.');
      return;
    }
    setUsers(current => current.filter(user => user.id !== deleteTarget.id));
    setDeleteTarget(null);
    setErrorMessage('');
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Utilizador',
      render: user => (
        <div className="flex items-center gap-2.5">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
            alt=""
            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Perfil',
      render: user => <span className="capitalize">{user.role}</span>
    },
    {
      key: 'adminPermissions',
      header: 'Privilégios',
      render: user => {
        const labels = isRootAdmin(user)
          ? ['Acesso total']
          : permissionOptions
              .filter(option => user.adminPermissions?.includes(option.value))
              .map(option => option.label);
        return (
          <div className="flex max-w-sm flex-wrap gap-1">
            {labels.length
              ? labels.map(label => <span key={label} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{label}</span>)
              : <span className="text-slate-500">Sem acesso ao painel</span>}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: user => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          user.isActive === false ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {user.isActive === false ? 'Inativo' : 'Ativo'}
        </span>
      )
    }
  ];

  const deleteActions: CustomAction<User>[] = [{
    key: 'delete',
    label: 'Eliminar',
    icon: <Trash2 className="h-3.5 w-3.5" />,
    className: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    showIf: user => !isRootAdmin(user) && user.id !== currentUser?.id,
    onClick: setDeleteTarget
  }];

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-[#C9A44C]/30 bg-white p-5 shadow-soft">
        <div className="rounded-xl bg-[#14243B] p-2.5 text-[#C9A44C]">
          <UserCog className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-[#14243B]">Utilizadores e privilégios</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Crie contas de gestão, personalize os dados do perfil e atribua acesso por área. As permissões são verificadas no servidor.
          </p>
        </div>
      </div>

      {errorMessage && !modalOpen && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-xs text-slate-500">A carregar utilizadores…</div>
      ) : (
        <GenericCRUDTable
          data={users}
          columns={columns}
          keyExtractor={user => user.id}
          onCreate={handleOpenNew}
          createLabel="Criar utilizador"
          onEdit={handleOpenEdit}
          customActions={deleteActions}
          searchFilter={(user, query) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
          }
          emptyMessage="Nenhum utilizador encontrado."
        />
      )}

      {modalOpen && (
        <GenericModal
          isOpen
          onClose={() => setModalOpen(false)}
          title={editingUser ? 'Personalizar utilizador' : 'Criar conta de gestão'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                Nome completo *
                <input required maxLength={120} value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                E-mail *
                <input required type="email" maxLength={254} disabled={!!editingUser && isRootAdmin(editingUser)} value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-100" />
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                Perfil
                <select disabled={!!editingUser && isRootAdmin(editingUser)} value={role} onChange={event => setRole(event.target.value as User['role'])} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm disabled:bg-slate-100">
                  <option value="admin">Administrador</option>
                  <option value="journalist">Jornalista</option>
                  <option value="artist">Artista</option>
                  <option value="follower">Seguidor</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                Telefone
                <input maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <div className="sm:col-span-2">
                <ImageUrlUploadField
                  label="Fotografia do utilizador"
                  value={avatar}
                  onChange={setAvatar}
                  placeholder="https://… ou anexar do computador"
                  compact
                />
              </div>
              {editingUser && isRootAdmin(editingUser) ? (
                <>
                  <label className="space-y-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
                    Palavra-passe atual
                    <input
                      type="password"
                      required={!!password}
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={event => setCurrentPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
                    Nova palavra-passe (opcional)
                    <input
                      type="password"
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    />
                    <span className="block font-normal text-slate-500">Mínimo de 12 caracteres. A palavra-passe não é exibida nem armazenada em texto simples.</span>
                  </label>
                </>
              ) : (
                <label className="space-y-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
                  {editingUser ? 'Nova palavra-passe (opcional)' : 'Palavra-passe inicial *'}
                  <input
                    type="password"
                    required={!editingUser}
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                  <span className="block font-normal text-slate-500">Mínimo de 12 caracteres. A palavra-passe não é exibida nem armazenada em texto simples.</span>
                </label>
              )}
            </div>

            {editingUser && isRootAdmin(editingUser) ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>A conta principal mantém acesso total. Para alterar a palavra-passe, informe a atual e escolha uma nova com pelo menos 12 caracteres.</p>
              </div>
            ) : (
              <fieldset className="space-y-2 rounded-xl border border-slate-200 p-4">
                <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[#14243B]">Acesso às áreas do painel</legend>
                <p className="text-xs text-slate-500">O painel inicial é comum; marque as áreas que esta conta pode consultar e gerir.</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {permissionOptions.map(option => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(option.value)}
                        onChange={event => setSelectedPermissions(current =>
                          event.target.checked
                            ? [...current, option.value]
                            : current.filter(permission => permission !== option.value)
                        )}
                        className="h-4 w-4 accent-[#C9A44C]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={!!editingUser && isRootAdmin(editingUser)}
                  onChange={event => setIsActive(event.target.checked)}
                  className="h-4 w-4 accent-[#C9A44C]"
                />
                Conta ativa
              </label>
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <KeyRound className="h-3.5 w-3.5" />
                Acesso autenticado individualmente
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="rounded-xl bg-[#14243B] px-5 py-2 text-xs font-bold text-[#C9A44C] hover:bg-[#1E3554] disabled:opacity-60">
                  {isSaving ? 'A guardar…' : 'Guardar utilizador'}
                </button>
              </div>
            </div>
          </form>
        </GenericModal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { void handleDelete(); }}
        title="Eliminar utilizador"
        message={`Tem a certeza de que pretende eliminar ${deleteTarget?.name || 'este utilizador'}? A sessão também será terminada.`}
      />
    </div>
  );
};
