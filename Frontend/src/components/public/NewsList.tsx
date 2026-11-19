import React, { useState } from 'react';
import { Article } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { GenericModal } from '../common/GenericModal';
import { Calendar, Clock, Eye, Bookmark, Share2, ArrowRight, Tag, User } from 'lucide-react';

interface NewsListProps {
  articles: Article[];
  showTitle?: boolean;
  limit?: number;
  selectedArticleId?: string;
  onClearSelectedArticle?: () => void;
}

export const NewsList: React.FC<NewsListProps> = ({
  articles,
  showTitle = true,
  limit,
  selectedArticleId,
  onClearSelectedArticle
}) => {
  const { getLocalized, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isBookmarked, toggleBookmark, incrementArticleViews } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<Article | null>(() => {
    if (selectedArticleId) {
      return articles.find(a => a.id === selectedArticleId) || null;
    }
    return null;
  });

  // Categories list
  const categories = ['all', 'Igrejas', 'Música', 'Testemunhos', 'Eventos', 'Juventude'];

  // Filtered
  const filtered = articles
    .filter(a => !a.isAnnouncement) // announcements go to Novidades
    .filter(a => (selectedCategory === 'all' ? true : a.category === selectedCategory));

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  const handleOpenArticle = (art: Article) => {
    setActiveArticle(art);
    incrementArticleViews(art.id);
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    if (onClearSelectedArticle) onClearSelectedArticle();
  };

  const handleBookmarkToggle = (e: React.MouseEvent, artId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Por favor inicie sessão para guardar artigos na sua Zona do Seguidor.');
      return;
    }
    void toggleBookmark(currentUser.id, artId).catch(error => {
      alert(error instanceof Error ? error.message : 'Não foi possível guardar o artigo.');
    });
  };

  const handleShare = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: getLocalized(art, 'title'),
        text: getLocalized(art, 'summary'),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="my-8">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A44C] mb-1">
              <span className="w-2.5 h-0.5 bg-[#C9A44C]"></span>
              <span>Informação Eclesial</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
              {t('latestNews')}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#14243B] text-[#C9A44C] shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? t('viewAll') : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map(article => {
          const bookmarked = currentUser ? isBookmarked(currentUser.id, article.id) : false;
          return (
            <div
              key={article.id}
              onClick={() => handleOpenArticle(article)}
              className="bg-white rounded-2xl shadow-soft border border-navy-100 overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={getLocalized(article, 'title')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#14243B]/90 backdrop-blur-sm text-white text-[11px] font-bold">
                    {article.category}
                  </span>
                  <button
                    onClick={e => handleBookmarkToggle(e, article.id)}
                    className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md transition-colors ${
                      bookmarked
                        ? 'bg-[#C9A44C] text-[#14243B]'
                        : 'bg-white/80 text-slate-700 hover:bg-white hover:text-[#14243B]'
                    }`}
                    title={bookmarked ? t('saved') : t('saveArticle')}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C9A44C]" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A44C]" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#14243B] group-hover:text-[#C9A44C] transition-colors line-clamp-2 leading-snug mb-2">
                    {getLocalized(article, 'title')}
                  </h3>

                  <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                    {getLocalized(article, 'summary')}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] flex items-center gap-1 truncate max-w-[150px]">
                  <User className="w-3 h-3 text-[#C9A44C]" />
                  {article.author}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleShare(e, article)}
                    className="p-1 text-slate-400 hover:text-[#14243B] transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-[#14243B] group-hover:text-[#C9A44C] flex items-center gap-1 text-[11px]">
                    {t('readMore')}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Modal Reader */}
      {activeArticle && (
        <GenericModal
          isOpen={!!activeArticle}
          onClose={handleCloseArticle}
          title={activeArticle.category}
          subtitle={`Publicado em ${activeArticle.date} por ${activeArticle.author}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B] leading-tight">
              {getLocalized(activeArticle, 'title')}
            </h1>

            {/* Featured Image */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-md">
              <img
                src={activeArticle.imageUrl}
                alt={getLocalized(activeArticle, 'title')}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#C9A44C]" />
                  <strong>{activeArticle.author}</strong> ({activeArticle.authorRole || 'Redação'})
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C9A44C]" />
                  {activeArticle.readTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#C9A44C]" />
                  {activeArticle.views.toLocaleString()} {t('views')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={e => handleBookmarkToggle(e, activeArticle.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    currentUser && isBookmarked(currentUser.id, activeArticle.id)
                      ? 'bg-[#C9A44C] text-[#14243B] border-[#C9A44C]'
                      : 'border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>
                    {currentUser && isBookmarked(currentUser.id, activeArticle.id)
                      ? t('saved')
                      : t('saveArticle')}
                  </span>
                </button>

                <button
                  onClick={e => handleShare(e, activeArticle)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C9A44C]" />
                  <span>{t('share')}</span>
                </button>
              </div>
            </div>

            {/* Summary Block */}
            <div className="p-4 rounded-xl bg-amber-50/70 border-l-4 border-l-[#C9A44C] border border-amber-100 text-slate-700 text-sm font-medium italic leading-relaxed">
              {getLocalized(activeArticle, 'summary')}
            </div>

            {/* Article Body */}
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
              {getLocalized(activeArticle, 'content')}
            </div>

            {/* Tags */}
            {activeArticle.tags && activeArticle.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#C9A44C]" />
                <span className="text-xs font-bold text-slate-600">Tags:</span>
                {activeArticle.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </GenericModal>
      )}
    </div>
  );
};
