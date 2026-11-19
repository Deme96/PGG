import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { MapPin, Phone, Mail, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { siteSettings } = useData();

  return (
    <footer className="bg-[#0D1929] text-slate-300 pt-16 pb-12 border-t border-[#C9A44C]/30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Institutional */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14243B] border border-[#C9A44C] flex items-center justify-center">
                <span className="font-heading font-black text-lg text-[#C9A44C]">PGG</span>
              </div>
              <span className="font-heading font-bold text-white text-base tracking-wider">
                PORTAL GOSPEL GUINEENSE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('aboutPortal')}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-[#C9A44C] font-semibold uppercase tracking-wider">
                Trilingue:
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-white">Português</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-white">English</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-white">Français</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-[#C9A44C] tracking-wider uppercase mb-4">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {t('news')} & Artigos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {t('announcements')} Oficiais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('videos')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {t('videos')} & Cultos ao Vivo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('artists')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {t('artists')} Gospel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-white hover:underline transition-colors"
                >
                  {t('accessMap')} Mundial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('artist-zone')}
                  className="hover:text-white hover:underline transition-colors text-[#C9A44C] font-medium"
                >
                  {t('artistZone')} & Submissão
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacts */}
          <div>
            <h4 className="font-heading text-sm font-bold text-[#C9A44C] tracking-wider uppercase mb-4">
              {t('contacts')}
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A44C] shrink-0 mt-0.5" />
                <span>{siteSettings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A44C] shrink-0" />
                <span>{siteSettings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A44C] shrink-0" />
                <span>{siteSettings.contactEmail}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Redação & Gestão */}
          <div className="space-y-4">
            <h4 className="font-heading text-sm font-bold text-[#C9A44C] tracking-wider uppercase mb-2">
              Área Reservada
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acesso exclusivo aos administradores, jornalistas da redação, técnicos de transmissão e secretariado.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14243B] hover:bg-[#1E3554] border border-[#C9A44C]/50 text-[#C9A44C] hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Painel de Gestão (Admin)</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} {siteSettings.portalName}. {t('rightsReserved')}
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Desenvolvido para a glória do Reino de Deus na Guiné-Bissau</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
