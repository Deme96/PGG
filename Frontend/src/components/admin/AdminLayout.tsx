import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Boxes,
  Mail,
  Wallet,
  Settings,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Bell,
  Globe,
  Radio,
  Compass,
  Mic,
  FileText,
  Palette,
  CreditCard,
  Handshake,
  Music,
  Sliders,
  ShieldAlert,
  Database,
  UserCog
} from 'lucide-react';

import { AdminPermission } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { DepartamentosManager } from './DepartamentosManager';
import { RHManager } from './RHManager';
import { PatrimonioManager } from './PatrimonioManager';
import { CorrespondenciasManager } from './CorrespondenciasManager';
import { FinancasManager } from './FinancasManager';
import { ConfiguracoesManager } from './ConfiguracoesManager';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminSubmenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

interface AdminMenuItem {
  id: string;
  label: string;
  icon: any;
  hasSubmenus: boolean;
  defaultSub?: string;
  badge?: number;
  submenus?: AdminSubmenuItem[];
}

interface AdminLayoutProps {
  onBackToPublic: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToPublic }) => {
  const { currentUser, logout } = useAuth();
  const { coverageRequests } = useData();
  const { t } = useLanguage();
  const isRootAdmin = currentUser?.role === 'admin' && currentUser.email.toLowerCase() === 'admin@portalgospel.gw';

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [activeSubmenu, setActiveSubmenu] = useState<string>('');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleSelectMenu = (menuId: string, defaultSub?: string) => {
    setActiveMenu(menuId);
    if (defaultSub) {
      setActiveSubmenu(defaultSub);
    }
  };

  const handleSelectSubmenu = (menuId: string, subId: string) => {
    setActiveMenu(menuId);
    setActiveSubmenu(subId);
  };

  const pendingCoverageCount = coverageRequests.filter(c => c.status === 'Pendente').length;

  // The Exact requested menus & submenus:
  const menuStructure: AdminMenuItem[] = [
    {
      id: 'dashboard',
      label: t('adminDashboard'),
      icon: LayoutDashboard,
      hasSubmenus: false
    },
    {
      id: 'departments',
      label: 'Departamentos',
      icon: Building2,
      hasSubmenus: true,
      defaultSub: 'direcao',
      submenus: [
        { id: 'direcao', label: 'Direção', icon: Compass },
        { id: 'reportagem', label: 'Reportagem', icon: Mic },
        { id: 'transmissao', label: 'Transmissão', icon: Radio },
        { id: 'redacao', label: 'Redação', icon: FileText },
        { id: 'secretariageral', label: 'Secretaria Geral', icon: Building2 },
        { id: 'designgrafico', label: 'Design Gráfico', icon: Palette }
      ]
    },
    {
      id: 'hr',
      label: 'Recursos Humanos',
      icon: Users,
      hasSubmenus: true,
      defaultSub: 'pessoal',
      submenus: [
        { id: 'pessoal', label: 'Pessoal', icon: Users },
        { id: 'escalas', label: 'Escalas', icon: FileText }
      ]
    },
    {
      id: 'patrimony',
      label: 'Património',
      icon: Boxes,
      hasSubmenus: true,
      defaultSub: 'ativos',
      submenus: [
        { id: 'ativos', label: 'Ativos', icon: Boxes },
        { id: 'passivos', label: 'Passivos', icon: CreditCard }
      ]
    },
    {
      id: 'correspondence',
      label: 'Correspondências',
      icon: Mail,
      hasSubmenus: true,
      defaultSub: 'cobertura',
      badge: pendingCoverageCount > 0 ? pendingCoverageCount : undefined,
      submenus: [
        { id: 'cobertura', label: 'Pedidos de Cobertura', icon: Radio, badge: pendingCoverageCount },
        { id: 'parcerias', label: 'Parcerias e Acordos', icon: Handshake },
        { id: 'publicacao', label: 'Pedidos de Publicação', icon: Music }
      ]
    },
    {
      id: 'finances',
      label: 'Finanças',
      icon: Wallet,
      hasSubmenus: true,
      defaultSub: 'entries',
      submenus: [
        { id: 'entries', label: 'Entradas', icon: Wallet },
        { id: 'exits', label: 'Saídas', icon: Wallet }
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      hasSubmenus: true,
      defaultSub: 'sistema',
      submenus: [
        { id: 'sistema', label: 'Dados do Sistema', icon: Settings },
        { id: 'noticias', label: 'Notícias', icon: FileText },
        { id: 'videos', label: 'Vídeos', icon: Radio },
        { id: 'logs', label: 'Logs', icon: ShieldAlert },
        { id: 'backup', label: 'Backup', icon: Database },
        { id: 'carrossel', label: 'Carrossel', icon: Sliders },
        ...(isRootAdmin ? [{ id: 'users', label: 'Utilizadores e Privilégios', icon: UserCog }] : [])
      ]
    }
  ];
  const accessibleMenuStructure = menuStructure.filter(item =>
    item.id === 'dashboard' ||
    isRootAdmin ||
    currentUser?.adminPermissions?.includes(item.id as AdminPermission) === true
  );

  return (
    <div className="admin-area flex h-screen overflow-hidden bg-[#F4EFE6] text-slate-800">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#C9A44C]/30 bg-[#14243B] text-white shadow-card select-none">
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D1929] border border-[#C9A44C] flex items-center justify-center shadow-gold">
              <span className="font-heading font-black text-lg text-[#C9A44C]">PGG</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-white leading-tight">
                ÁREA DE GESTÃO
              </h2>
              <p className="text-[10px] text-[#C9A44C] font-semibold tracking-wider uppercase">
                Redação Central
              </p>
            </div>
          </div>

          {/* Navigation Accordion List */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {accessibleMenuStructure.map(item => {
              const Icon = item.icon;
              const isSelected = activeMenu === item.id;
              const isExpanded = !!expandedMenus[item.id];

              if (!item.hasSubmenus) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMenu(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#C9A44C] text-[#14243B] shadow-md font-extrabold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#14243B]' : 'text-[#C9A44C]'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              }

              return (
                <div
                  key={item.id}
                  className={item.id === 'settings'
                    ? 'mt-4 border-t border-white/10 pt-4'
                    : 'space-y-0.5'}
                >
                  <button
                    onClick={() => {
                      toggleExpand(item.id);
                      handleSelectMenu(item.id, item.defaultSub);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white/10 text-[#C9A44C]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#C9A44C]" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#C9A44C] text-[#14243B] text-[10px] font-black">
                          {item.badge}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Submenu Children */}
                  {isExpanded && item.submenus && (
                    <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-[#C9A44C]/30 ml-4 my-1">
                      {item.submenus.map(sub => {
                        const isSubSelected = activeMenu === item.id && activeSubmenu === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectSubmenu(item.id, sub.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                              isSubSelected
                                ? 'bg-[#C9A44C] text-[#14243B] font-bold shadow-xs'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {sub.badge ? (
                              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                                {sub.badge}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-white/10 bg-[#0D1929]/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover border border-[#C9A44C]"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-[#C9A44C] capitalize">{currentUser?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title={t('logout')}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onBackToPublic}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C9A44C]" />
            <span>Voltar ao Portal Público</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-heading font-black text-sm text-[#14243B] uppercase tracking-wider">
              {menuStructure.find(m => m.id === activeMenu)?.label || 'Painel'}
            </span>
            {activeSubmenu && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-[#C9A44C] uppercase tracking-wider">
                  {menuStructure
                    .find(m => m.id === activeMenu)
                    ?.submenus?.find(s => s.id === activeSubmenu)?.label || activeSubmenu}
                </span>
              </>
            )}
          </div>

          {/* Right Header Status Badges */}
          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} />

            <div className="hidden sm:flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt=""
                className="h-8 w-8 rounded-full border border-[#C9A44C] object-cover"
              />
              <div className="min-w-0">
                <p className="max-w-40 truncate text-xs font-bold text-[#14243B]">
                  {currentUser?.name || 'Gestor'}
                </p>
                <p className="max-w-40 truncate text-xs capitalize text-slate-500">
                  {currentUser?.email || currentUser?.role}
                </p>
              </div>
            </div>

            {/* Back to Public Site Shortcut */}
            <button
              onClick={onBackToPublic}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#C9A44C]" />
              <span className="hidden sm:inline">Ver Site Público</span>
            </button>
          </div>
        </header>

        {/* View Router */}
        <div className="p-6 sm:p-8 flex-1">
          {activeMenu === 'dashboard' && (
            <AdminDashboard
              isRootAdmin={isRootAdmin}
              permissions={currentUser?.adminPermissions || []}
              onNavigateSubmenu={(m, sub) => {
                if (!isRootAdmin && !currentUser?.adminPermissions?.includes(m as AdminPermission)) return;
                setActiveMenu(m);
                setActiveSubmenu(sub);
                setExpandedMenus(prev => ({ ...prev, [m]: true }));
              }}
            />
          )}

          {activeMenu === 'departments' && (
            <DepartamentosManager
              currentSubmenu={activeSubmenu || 'direcao'}
              onSubmenuChange={sub => setActiveSubmenu(sub)}
            />
          )}

          {activeMenu === 'hr' && (
            <RHManager
              currentSubmenu={activeSubmenu || 'pessoal'}
              onSubmenuChange={sub => setActiveSubmenu(sub)}
            />
          )}

          {activeMenu === 'patrimony' && (
            <PatrimonioManager
              currentSubmenu={activeSubmenu || 'ativos'}
              onSubmenuChange={sub => setActiveSubmenu(sub)}
            />
          )}

          {activeMenu === 'correspondence' && (
            <CorrespondenciasManager
              currentSubmenu={activeSubmenu || 'cobertura'}
              onSubmenuChange={sub => setActiveSubmenu(sub)}
            />
          )}

          {activeMenu === 'finances' && (
            <FinancasManager
              currentSubmenu={activeSubmenu || 'entries'}
              onSubmenuChange={sub => setActiveSubmenu(sub)}
            />
          )}

          {activeMenu === 'settings' && (
            <ConfiguracoesManager
              currentSubmenu={activeSubmenu || 'sistema'}
            />
          )}
        </div>
      </main>
    </div>
  );
};
