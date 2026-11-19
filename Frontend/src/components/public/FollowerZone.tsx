import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bookmark, Clock, CheckCircle, XCircle, ArrowRight, Plus, Send, Radio } from 'lucide-react';
import { GenericModal } from '../common/GenericModal';

interface FollowerZoneProps {
  onOpenArticle: (artId: string) => void;
  onOpenAuth: () => void;
}

export const FollowerZone: React.FC<FollowerZoneProps> = ({ onOpenArticle, onOpenAuth }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { getUserBookmarks, toggleBookmark, coverageRequests, musicRequests, addCoverageRequest } = useData();
  const { getLocalized, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'requests'>('bookmarks');
  const [coverageModalOpen, setCoverageModalOpen] = useState(false);

  // Form for coverage request
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'Culto Especial' | 'Concerto Gospel' | 'Conferência' | 'Cruzada Evangelística' | 'Casamento / Cerimónia' | 'Lançamento de Álbum'>('Culto Especial');
  const [churchOrEntity, setChurchOrEntity] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [notes, setNotes] = useState('');

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="my-12 max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-navy-100 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-[#C9A44C] mx-auto flex items-center justify-center mb-4">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-[#14243B] mb-2">
          {t('followerZone')}
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Inicie sessão para consultar os artigos que guardou para leitura posterior e acompanhar o estado dos seus pedidos de cobertura e publicação.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-xs tracking-wider shadow-md transition-all"
        >
          {t('login')} / Registar Conta
        </button>
      </div>
    );
  }

  const savedArticles = getUserBookmarks(currentUser.id);

  // Requests related to this user (filtered by email/name or recent submissions)
  const userCoverage = coverageRequests.filter(
    r => r.requesterEmail?.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'admin'
  );

  const userMusic = musicRequests.filter(
    m => m.contactEmail?.toLowerCase() === currentUser.email.toLowerCase() || currentUser.role === 'admin'
  );

  const handleCoverageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !location || !eventDate) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    try {
      await addCoverageRequest({
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        requesterPhone: currentUser.phone || '+245 955 000 000',
        eventTitle,
        eventType,
        churchOrEntity: churchOrEntity || 'Igreja Local',
        location,
        eventDate,
        eventTime: eventTime || '10:00',
        notes
      });
      setCoverageModalOpen(false);
      setActiveTab('requests');
      alert('Pedido de cobertura registado com sucesso! A redação irá analisar a solicitação.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível registar o pedido.');
    }
  };

  return (
    <div className="my-10 max-w-5xl mx-auto">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-navy-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9A44C] shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-xl sm:text-2xl text-[#14243B]">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14243B] text-[#C9A44C] text-[10px] font-extrabold uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <button
          onClick={() => setCoverageModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-[#C9A44C] text-xs font-bold border border-[#C9A44C]/40 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C9A44C]" />
          <span>{t('requestCoverageBtn')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 px-2 font-heading text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'bookmarks'
              ? 'text-[#14243B] border-b-2 border-[#C9A44C]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#C9A44C]" />
          <span>{t('savedArticles')} ({savedArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-2 font-heading text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'text-[#14243B] border-b-2 border-[#C9A44C]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C9A44C]" />
          <span>{t('myRequests')} ({userCoverage.length + userMusic.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div>
          {savedArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-navy-100">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm mb-1">{t('noSavedArticles')}</p>
              <p className="text-slate-400 text-xs">
                Clique no ícone de marcador nos artigos para consultá-los aqui a qualquer momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedArticles.map(art => (
                <div
                  key={art.id}
                  onClick={() => onOpenArticle(art.id)}
                  className="bg-white rounded-2xl shadow-soft border border-navy-100 overflow-hidden hover:shadow-card transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={art.imageUrl}
                        alt={getLocalized(art, 'title')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#14243B] text-white text-[10px] font-bold">
                        {art.category}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="font-heading font-bold text-sm text-[#14243B] group-hover:text-[#C9A44C] transition-colors line-clamp-2 leading-snug mb-2">
                        {getLocalized(art, 'title')}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {getLocalized(art, 'summary')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        void toggleBookmark(currentUser.id, art.id).catch(error => {
                          alert(error instanceof Error ? error.message : 'Não foi possível guardar o artigo.');
                        });
                      }}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      {t('removeSaved')}
                    </button>
                    <span className="text-xs font-bold text-[#14243B] flex items-center gap-1">
                      {t('readMore')} &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requests Status */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Coverage Requests */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100">
            <h3 className="font-heading font-bold text-base text-[#14243B] mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C9A44C]" />
              Pedidos de Cobertura de Eventos
            </h3>

            {userCoverage.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum pedido de cobertura submetido.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {userCoverage.map(cov => (
                  <div key={cov.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{cov.eventTitle}</span>
                        <span className="text-xs text-slate-500">({cov.eventType})</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {cov.churchOrEntity} &bull; {cov.location} &bull; {cov.eventDate} às {cov.eventTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          cov.status === 'Aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cov.status === 'Recusado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cov.status === 'Aprovado' && <CheckCircle className="w-3.5 h-3.5" />}
                        {cov.status === 'Recusado' && <XCircle className="w-3.5 h-3.5" />}
                        {cov.status === 'Pendente' && <Clock className="w-3.5 h-3.5" />}
                        {cov.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Music Requests */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-navy-100">
            <h3 className="font-heading font-bold text-base text-[#14243B] mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C9A44C]" />
              Pedidos da Zona do Artista
            </h3>

            {userMusic.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum pedido musical registado.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {userMusic.map(mus => (
                  <div key={mus.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{mus.songTitle}</span>
                        <span className="text-xs text-slate-500 font-medium">({mus.sessionType})</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {mus.artistName} &bull; {mus.genre} &bull; {mus.church} &bull; Submetido em {mus.requestedDate}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        mus.status === 'Aprovado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : mus.status === 'Rejeitado'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {mus.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coverage Request Modal Form */}
      {coverageModalOpen && (
        <GenericModal
          isOpen={coverageModalOpen}
          onClose={() => setCoverageModalOpen(false)}
          title="Solicitar Cobertura de Evento"
          subtitle="A nossa equipa de reportagem e transmissão analisará a viabilidade do evento."
          maxWidth="2xl"
        >
          <form onSubmit={handleCoverageSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Evento *
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={e => setEventTitle(e.target.value)}
                placeholder="Ex: Grande Cruzada Evangelística de Bafatá"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Evento *
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                >
                  <option value="Culto Especial">Culto Especial</option>
                  <option value="Concerto Gospel">Concerto Gospel</option>
                  <option value="Conferência">Conferência / Seminário</option>
                  <option value="Cruzada Evangelística">Cruzada Evangelística</option>
                  <option value="Casamento / Cerimónia">Casamento / Cerimónia</option>
                  <option value="Lançamento de Álbum">Lançamento de Álbum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Igreja ou Entidade Organizadora *
                </label>
                <input
                  type="text"
                  required
                  value={churchOrEntity}
                  onChange={e => setChurchOrEntity(e.target.value)}
                  placeholder="Ex: Assembleia de Deus de Gabú"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Local / Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Templo Central ou Praça Pública"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detalhes Adicionais / Observações
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Número esperado de pessoas, se requer transmissão em direto ou apenas reportagem fotográfica..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCoverageModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4 text-[#C9A44C]" />
                <span>Enviar Solicitação</span>
              </button>
            </div>
          </form>
        </GenericModal>
      )}
    </div>
  );
};
