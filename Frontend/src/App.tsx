import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useLanguage } from './context/LanguageContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroCarousel } from './components/public/HeroCarousel';
import { FeaturedArticle } from './components/public/FeaturedArticle';
import { NewsList } from './components/public/NewsList';
import { NovidadesSection } from './components/public/NovidadesSection';
import { VideosSection } from './components/public/VideosSection';
import { ArtistsSection } from './components/public/ArtistsSection';
import { AccessMap } from './components/public/AccessMap';
import { ArtistZone } from './components/public/ArtistZone';
import { FollowerZone } from './components/public/FollowerZone';
import { AuthModal } from './components/public/AuthModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { ManagementLogin } from './components/admin/ManagementLogin';

import { Music, ArrowRight, ShieldCheck } from 'lucide-react';

export function App() {
  const { isAdmin } = useAuth();
  const { articles, videos, artists, dataReady, dataLoadError } = useData();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Featured article for home page
  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];

  if (!dataReady) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF8F4] px-4">
        <section role={dataLoadError ? 'alert' : 'status'} className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-[#14243B]">
            {dataLoadError ? 'Não foi possível ligar ao sistema' : 'A ligar ao sistema…'}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {dataLoadError || 'A carregar os dados do PostgreSQL.'}
          </p>
          {dataLoadError && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-[#14243B] px-5 py-3 text-sm font-bold text-white"
            >
              Tentar novamente
            </button>
          )}
        </section>
      </main>
    );
  }

  const handleNavigate = (view: string, detailId?: string) => {
    setCurrentView(view);
    if (detailId) {
      setSelectedArticleId(detailId);
    } else {
      setSelectedArticleId(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'management-login' || (currentView === 'admin' && !isAdmin)) {
    return (
      <ManagementLogin
        onBack={() => handleNavigate('home')}
        onSuccess={() => handleNavigate('admin')}
      />
    );
  }

  // If in Admin Area, render the complete administrative backoffice layout
  if (currentView === 'admin') {
    return (
      <AdminLayout onBackToPublic={() => handleNavigate('home')} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-slate-800">
      {/* Fixed Institutional Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenManagement={() => handleNavigate(isAdmin ? 'admin' : 'management-login')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* 1. Hero Slide Carousel */}
            <HeroCarousel onNavigate={handleNavigate} />

            {/* 2. Destaque Principal */}
            {featuredArticle && (
              <FeaturedArticle
                article={featuredArticle}
                onOpenArticle={art => {
                  setSelectedArticleId(art.id);
                  setCurrentView('news');
                }}
              />
            )}

            {/* 3. Últimas Notícias (Limit 3 on Home) */}
            <NewsList articles={articles} limit={6} />

            {/* 4. Novidades & Comunicados Oficiais */}
            <NovidadesSection articles={articles} />

            {/* 5. Vídeos e Transmissões */}
            <VideosSection videos={videos} limit={4} />

            {/* 6. Teaser da Zona do Artista */}
            <div className="my-12 rounded-3xl bg-gradient-to-r from-[#14243B] via-[#1E3554] to-[#0D1929] text-white p-8 sm:p-12 shadow-card border border-[#C9A44C]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A44C] text-[#14243B] text-xs font-black uppercase tracking-wider">
                  <Music className="w-3.5 h-3.5" />
                  Zona do Artista Gospel
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white leading-tight">
                  {t('artistZoneTeaser')}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Tem um novo louvor, videoclipe ou álbum para partilhar com o povo de Deus na Guiné-Bissau e no mundo? Submeta a sua proposta na nossa redação.
                </p>
              </div>

              <div className="z-10 shrink-0">
                <button
                  onClick={() => handleNavigate('artist-zone')}
                  className="px-6 py-3.5 rounded-2xl bg-[#C9A44C] hover:bg-[#B38F3B] text-[#14243B] font-extrabold text-sm shadow-gold transition-all flex items-center gap-2 group"
                >
                  <span>{t('submitMusicBtn')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#C9A44C]/10 blur-3xl pointer-events-none" />
            </div>

            {/* 7. Mapa de Acessos Mundial (Leaflet) */}
            <AccessMap />

            {/* 8. Artistas Gospel em Destaque */}
            <ArtistsSection
              artists={artists}
              limit={4}
              onOpenArtistZone={() => handleNavigate('artist-zone')}
            />
          </div>
        )}

        {/* VIEW 2: NOTÍCIAS */}
        {currentView === 'news' && (
          <div className="space-y-6">
            <NewsList
              articles={articles}
              selectedArticleId={selectedArticleId}
              onClearSelectedArticle={() => setSelectedArticleId(undefined)}
            />
          </div>
        )}

        {/* VIEW 3: NOVIDADES (COMUNICADOS) */}
        {currentView === 'announcements' && (
          <div className="space-y-6">
            <NovidadesSection articles={articles} />
          </div>
        )}

        {/* VIEW 4: VÍDEOS */}
        {currentView === 'videos' && (
          <div className="space-y-6">
            <VideosSection videos={videos} />
          </div>
        )}

        {/* VIEW 5: ARTISTAS */}
        {currentView === 'artists' && (
          <div className="space-y-6">
            <ArtistsSection
              artists={artists}
              onOpenArtistZone={() => handleNavigate('artist-zone')}
            />
          </div>
        )}

        {/* VIEW 6: MAPA DE ACESSOS */}
        {currentView === 'map' && (
          <div className="space-y-6">
            <AccessMap />
          </div>
        )}

        {/* VIEW 7: ZONA DO SEGUIDOR */}
        {currentView === 'follower-zone' && (
          <FollowerZone
            onOpenArticle={artId => handleNavigate('news', artId)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* VIEW 8: ZONA DO ARTISTA */}
        {currentView === 'artist-zone' && (
          <ArtistZone />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Split-screen Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
