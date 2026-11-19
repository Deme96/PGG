import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Globe,
  Radio,
  Bookmark as BookmarkIcon,
  ChevronDown,
  Music,
  Shield,
  User as UserIcon,
  Menu,
  X,
  FileText,
  Video as VideoIcon,
  Users
} from 'lucide-react';
import { Language } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

const languageOptions: { code: Language; label: string }[] = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' }
];

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (language: Language) => void;
  fullWidth?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage, fullWidth = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedLanguage = languageOptions.find(option => option.code === language) || languageOptions[0];

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={menuRef} className={`menu-font relative ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
        className={`flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0D1929] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#C9A44C]/60 hover:bg-[#1E3554] ${fullWidth ? 'w-full' : ''}`}
      >
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#C9A44C]" />
          <span aria-label={selectedLanguage.code === 'pt' ? 'Português' : selectedLanguage.code === 'en' ? 'English' : 'Français'}>
            {selectedLanguage.label}
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#C9A44C] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label="Selecionar idioma"
          className={`absolute top-full z-50 mt-2 min-w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-card ${fullWidth ? 'left-0 w-full' : 'right-0'}`}
        >
          {languageOptions.filter(option => option.code !== language).map(option => (
            <button
              key={option.code}
              type="button"
              role="menuitem"
              aria-label={option.code === 'pt' ? 'Português' : option.code === 'en' ? 'English' : 'Français'}
              onClick={() => {
                setLanguage(option.code);
                setIsOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#FAF8F4] hover:text-[#14243B]"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenManagement: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth, onOpenManagement }) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { bookmarks, siteSettings } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const userBookmarkCount = currentUser
    ? bookmarks.filter(b => b.userId === currentUser.id).length
    : 0;
  const brandNameParts = siteSettings.portalName.trim().split(/\s+/);
  const brandLastWord = brandNameParts.pop() || 'Guineense';
  const brandFirstLine = brandNameParts.join(' ') || 'Portal Gospel';

  const navItems = [
    { id: 'news', label: t('news'), icon: FileText },
    { id: 'announcements', label: t('announcements'), icon: Radio },
    { id: 'videos', label: t('videos'), icon: VideoIcon },
    { id: 'artists', label: t('artists'), icon: Users },
    { id: 'map', label: t('accessMap'), icon: Globe },
    {
      id: 'follower-zone',
      label: t('followerZone'),
      icon: BookmarkIcon,
      badge: userBookmarkCount > 0 ? userBookmarkCount : undefined
    },
    { id: 'artist-zone', label: t('artistZone'), icon: Music }
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#14243B] text-white shadow-card border-b border-[#C9A44C]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo & Brand */}
          <button
            type="button"
            aria-label="Início — Portal Gospel Guineense"
            title="Início"
            onClick={() => handleNavClick('home')}
            className="group flex min-w-0 cursor-pointer select-none items-center gap-2 text-left sm:gap-3.5"
          >
            <img
              src="/logo-pgg.jpeg"
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border border-[#C9A44C] object-cover shadow-gold transition-transform group-hover:scale-105 sm:h-[3.25rem] sm:w-[3.25rem]"
            />
            <div className="min-w-0 font-heading font-bold uppercase leading-[0.95] tracking-wide text-white">
              <span className="block whitespace-nowrap text-sm sm:text-base lg:text-lg">
                {brandFirstLine}
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-sm sm:text-base lg:text-lg">
                {brandLastWord}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="menu-font hidden xl:ml-6 xl:flex items-center gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-2 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-white/10 text-[#C9A44C] shadow-inner'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C9A44C]" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 bg-[#C9A44C] text-[#14243B] text-[10px] font-extrabold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#C9A44C] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Lang Switcher & User Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher language={language} setLanguage={setLanguage} />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle showLabel={false} />
            </div>

            <button
              onClick={onOpenManagement}
              className="hidden items-center gap-1.5 rounded-xl border border-[#C9A44C]/50 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-colors hover:border-[#C9A44C] hover:bg-white/10 sm:flex"
            >
              <Shield className="h-4 w-4 text-[#E2C477]" />
              <span className="hidden sm:inline">{isAdmin ? 'Gestão' : 'Área de gestão'}</span>
            </button>

            {/* Auth Profile / Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={currentUser?.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#C9A44C]"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-none">
                      {currentUser?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#C9A44C] capitalize">
                      {currentUser?.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="menu-font absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-card border border-slate-200 py-1.5 text-slate-800 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{currentUser?.name}</p>
                      <p className="text-slate-500 text-[11px] truncate">{currentUser?.email}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <Shield className="w-4 h-4 text-[#C9A44C]" />
                        <span>{t('adminArea')}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onNavigate('follower-zone');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <BookmarkIcon className="w-4 h-4 text-[#C9A44C]" />
                      <span>{t('savedArticles')}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#C9A44C] to-[#B38F3B] p-2.5 text-xs font-bold text-[#14243B] shadow-md transition-all hover:brightness-110 sm:px-4 sm:py-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="menu-font xl:hidden bg-[#0D1929] border-t border-[#C9A44C]/20 px-4 pt-3 pb-6 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/10 text-[#C9A44C]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#C9A44C]" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-[#C9A44C] text-[#14243B] text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="px-3 py-2 sm:hidden">
            <ThemeToggle className="w-full justify-start" />
          </div>
          <div className="px-3 py-2 sm:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Idioma</p>
            <LanguageSwitcher language={language} setLanguage={setLanguage} fullWidth />
          </div>
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#C9A44C] bg-white/5 mt-2"
            >
              <Shield className="w-4 h-4 text-[#C9A44C]" />
              <span>{t('adminArea')}</span>
            </button>
          )}
          <button
            onClick={() => {
              onOpenManagement();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-[#E2C477] hover:bg-white/5"
          >
            <Shield className="w-4 h-4" />
            <span>{isAdmin ? 'Área de gestão' : 'Acesso à área de gestão'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
