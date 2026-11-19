import React, { useState } from 'react';
import { Article } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { GenericModal } from '../common/GenericModal';
import { Bell, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface NovidadesSectionProps {
  articles: Article[];
}

export const NovidadesSection: React.FC<NovidadesSectionProps> = ({ articles }) => {
  const { getLocalized, t } = useLanguage();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Article | null>(null);

  // Filter announcements
  const announcements = articles.filter(a => a.isAnnouncement);

  if (announcements.length === 0) return null;

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A44C] mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Avisos Oficiais</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
            {t('officialAnnouncements')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedAnnouncement(item)}
            className="bg-white rounded-2xl p-6 shadow-soft border-l-4 border-l-[#C9A44C] border border-navy-100 hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#14243B] text-[#C9A44C] text-[10px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  Oficial &bull; {item.author}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3 text-[#C9A44C]" />
                  {item.date}
                </span>
              </div>

              <h3 className="font-heading font-bold text-base sm:text-lg text-[#14243B] group-hover:text-[#C9A44C] transition-colors line-clamp-2 leading-snug mb-2">
                {getLocalized(item, 'title')}
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {getLocalized(item, 'summary')}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Tempo de leitura: {item.readTime}
              </span>
              <span className="font-bold text-[#14243B] group-hover:text-[#C9A44C] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                <span>{t('readMore')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A44C]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <GenericModal
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          title="Comunicado Oficial da Redação"
          subtitle={`Emitido em ${selectedAnnouncement.date}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-[#14243B]/5 rounded-xl border border-[#C9A44C]/30 flex items-center justify-between">
              <span className="text-xs font-bold text-[#14243B] uppercase tracking-wider">
                Origem: {selectedAnnouncement.author}
              </span>
              <span className="text-xs text-slate-500">{selectedAnnouncement.date}</span>
            </div>

            <h2 className="font-heading font-black text-xl text-[#14243B] leading-tight">
              {getLocalized(selectedAnnouncement, 'title')}
            </h2>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line border-t border-slate-100 pt-4">
              {getLocalized(selectedAnnouncement, 'content')}
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 italic text-right">
              Portal Gospel Guineense &mdash; A Direção de Informação
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};
