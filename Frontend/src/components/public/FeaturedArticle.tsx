import React from 'react';
import { Article } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Calendar, Clock, Eye, Bookmark, Share2, ArrowRight } from 'lucide-react';

interface FeaturedArticleProps {
  article: Article;
  onOpenArticle: (article: Article) => void;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article, onOpenArticle }) => {
  const { getLocalized, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isBookmarked, toggleBookmark } = useData();

  const bookmarked = currentUser ? isBookmarked(currentUser.id, article.id) : false;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Por favor inicie sessão para guardar artigos na sua Zona do Seguidor.');
      return;
    }
    void toggleBookmark(currentUser.id, article.id).catch(error => {
      alert(error instanceof Error ? error.message : 'Não foi possível guardar o artigo.');
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: getLocalized(article, 'title'),
        text: getLocalized(article, 'summary'),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div
      onClick={() => onOpenArticle(article)}
      className="bg-white rounded-3xl shadow-soft border border-navy-100 overflow-hidden hover:shadow-card transition-all cursor-pointer group my-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Image Container */}
        <div className="lg:col-span-7 relative h-72 lg:h-[420px] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={getLocalized(article, 'title')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-[#14243B] text-[#C9A44C] text-xs font-black uppercase tracking-wider shadow-md">
              {t('featuredNews')}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold">
              {article.category}
            </span>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={handleBookmarkClick}
              className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                bookmarked
                  ? 'bg-[#C9A44C] text-[#14243B]'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#14243B]'
              }`}
              title={bookmarked ? t('saved') : t('saveArticle')}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShareClick}
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-[#14243B] backdrop-blur-md shadow-md transition-all"
              title={t('share')}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#C9A44C]" />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#C9A44C]" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-[#C9A44C]" />
                {article.views.toLocaleString()} {t('views')}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-heading font-black text-xl sm:text-2xl text-[#14243B] group-hover:text-[#C9A44C] transition-colors leading-snug mb-4">
              {getLocalized(article, 'title')}
            </h2>

            {/* Summary */}
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {getLocalized(article, 'summary')}
            </p>
          </div>

          {/* Author & Action */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#14243B] text-[#C9A44C] flex items-center justify-center font-heading font-bold text-sm">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{article.author}</p>
                <p className="text-[11px] text-slate-500">{article.authorRole || 'Redação PGG'}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14243B] group-hover:text-[#C9A44C] group-hover:translate-x-1 transition-all">
              <span>{t('readMore')}</span>
              <ArrowRight className="w-4 h-4 text-[#C9A44C]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
