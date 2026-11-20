import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Article, Video, CarouselSlide, Backup, SystemLog } from '../../types';
import { GenericCRUDTable, Column } from '../common/GenericCRUDTable';
import { GenericModal } from '../common/GenericModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UsersPrivilegesManager } from './UsersPrivilegesManager';
import { ImageUrlUploadField } from '../common/ImageUrlUploadField';
import {
  Settings,
  FileText,
  Video as VideoIcon,
  ShieldAlert,
  Database,
  Sliders,
  Download,
  Upload,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ConfiguracoesManagerProps {
  currentSubmenu: string;
}

export const ConfiguracoesManager: React.FC<ConfiguracoesManagerProps> = ({
  currentSubmenu
}) => {
  const {
    siteSettings,
    updateSiteSettings,
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    videos,
    addVideo,
    updateVideo,
    deleteVideo,
    carouselSlides,
    addCarouselSlide,
    updateCarouselSlide,
    deleteCarouselSlide,
    systemLogs,
    backups,
    addBackup,
    restoreFromJSON,
    exportDatabaseJSON
  } = useData();
  const { t, getLocalized } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =================== SITE SETTINGS STATE ===================
  const [portalName, setPortalName] = useState(siteSettings.portalName);
  const [sloganPt, setSloganPt] = useState(siteSettings.slogan_pt);
  const [sloganEn, setSloganEn] = useState(siteSettings.slogan_en);
  const [sloganFr, setSloganFr] = useState(siteSettings.slogan_fr);
  const [phone, setPhone] = useState(siteSettings.contactPhone);
  const [email, setEmail] = useState(siteSettings.contactEmail);
  const [address, setAddress] = useState(siteSettings.contactAddress);
  const [fbUrl, setFbUrl] = useState(siteSettings.facebookUrl);
  const [ytUrl, setYtUrl] = useState(siteSettings.youtubeUrl);
  const [igUrl, setIgUrl] = useState(siteSettings.instagramUrl);
  const [maintenance, setMaintenance] = useState(siteSettings.maintenanceMode);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      portalName,
      slogan_pt: sloganPt,
      slogan_en: sloganEn,
      slogan_fr: sloganFr,
      contactPhone: phone,
      contactEmail: email,
      contactAddress: address,
      facebookUrl: fbUrl,
      youtubeUrl: ytUrl,
      instagramUrl: igUrl,
      maintenanceMode: maintenance
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // =================== ARTICLE MODAL STATE ===================
  const [artModalOpen, setArtModalOpen] = useState(false);
  const [editingArtId, setEditingArtId] = useState<string | null>(null);
  const [artTitlePt, setArtTitlePt] = useState('');
  const [artTitleEn, setArtTitleEn] = useState('');
  const [artTitleFr, setArtTitleFr] = useState('');
  const [artSummaryPt, setArtSummaryPt] = useState('');
  const [artContentPt, setArtContentPt] = useState('');
  const [artCategory, setArtCategory] = useState<Article['category']>('Igrejas');
  const [artAuthor, setArtAuthor] = useState('Moisés Gomes');
  const [artImage, setArtImage] = useState('');
  const [artReadTime, setArtReadTime] = useState('3 min');
  const [artFeatured, setArtFeatured] = useState(false);
  const [artAnnouncement, setArtAnnouncement] = useState(false);

  const handleOpenNewArticle = () => {
    setEditingArtId(null);
    setArtTitlePt('');
    setArtTitleEn('');
    setArtTitleFr('');
    setArtSummaryPt('');
    setArtContentPt('');
    setArtCategory('Igrejas');
    setArtAuthor('Moisés Gomes');
    setArtImage('https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=900');
    setArtReadTime('3 min');
    setArtFeatured(false);
    setArtAnnouncement(false);
    setArtModalOpen(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArtId(art.id);
    setArtTitlePt(art.title_pt);
    setArtTitleEn(art.title_en);
    setArtTitleFr(art.title_fr);
    setArtSummaryPt(art.summary_pt);
    setArtContentPt(art.content_pt);
    setArtCategory(art.category);
    setArtAuthor(art.author);
    setArtImage(art.imageUrl);
    setArtReadTime(art.readTime);
    setArtFeatured(!!art.isFeatured);
    setArtAnnouncement(!!art.isAnnouncement);
    setArtModalOpen(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitlePt || !artSummaryPt) return;

    if (editingArtId) {
      updateArticle(editingArtId, {
        title_pt: artTitlePt,
        title_en: artTitleEn || artTitlePt,
        title_fr: artTitleFr || artTitlePt,
        summary_pt: artSummaryPt,
        summary_en: artSummaryPt,
        summary_fr: artSummaryPt,
        content_pt: artContentPt,
        content_en: artContentPt,
        content_fr: artContentPt,
        category: artCategory,
        author: artAuthor,
        imageUrl: artImage,
        readTime: artReadTime,
        isFeatured: artFeatured,
        isAnnouncement: artAnnouncement
      });
    } else {
      addArticle({
        title_pt: artTitlePt,
        title_en: artTitleEn || artTitlePt,
        title_fr: artTitleFr || artTitlePt,
        summary_pt: artSummaryPt,
        summary_en: artSummaryPt,
        summary_fr: artSummaryPt,
        content_pt: artContentPt,
        content_en: artContentPt,
        content_fr: artContentPt,
        category: artCategory,
        author: artAuthor,
        date: new Date().toISOString().substring(0, 10),
        imageUrl: artImage,
        readTime: artReadTime,
        isFeatured: artFeatured,
        isAnnouncement: artAnnouncement,
        tags: ['Portal Gospel', 'Guiné-Bissau']
      });
    }
    setArtModalOpen(false);
  };

  // =================== VIDEO MODAL STATE ===================
  const [vidModalOpen, setVidModalOpen] = useState(false);
  const [editingVidId, setEditingVidId] = useState<string | null>(null);
  const [vidTitlePt, setVidTitlePt] = useState('');
  const [vidDescPt, setVidDescPt] = useState('');
  const [vidYoutubeId, setVidYoutubeId] = useState('dQw4w9WgXcQ');
  const [vidDuration, setVidDuration] = useState('30m');
  const [vidCategory, setVidCategory] = useState<Video['category']>('Louvor & Adoração');

  const handleOpenNewVideo = () => {
    setEditingVidId(null);
    setVidTitlePt('');
    setVidDescPt('');
    setVidYoutubeId('dQw4w9WgXcQ');
    setVidDuration('30m');
    setVidCategory('Louvor & Adoração');
    setVidModalOpen(true);
  };

  const handleOpenEditVideo = (v: Video) => {
    setEditingVidId(v.id);
    setVidTitlePt(v.title_pt);
    setVidDescPt(v.description_pt);
    setVidYoutubeId(v.youtubeId);
    setVidDuration(v.duration);
    setVidCategory(v.category);
    setVidModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitlePt) return;

    if (editingVidId) {
      updateVideo(editingVidId, {
        title_pt: vidTitlePt,
        title_en: vidTitlePt,
        title_fr: vidTitlePt,
        description_pt: vidDescPt,
        description_en: vidDescPt,
        description_fr: vidDescPt,
        youtubeId: vidYoutubeId,
        videoUrl: `https://www.youtube.com/embed/${vidYoutubeId}`,
        duration: vidDuration,
        category: vidCategory
      });
    } else {
      addVideo({
        title_pt: vidTitlePt,
        title_en: vidTitlePt,
        title_fr: vidTitlePt,
        description_pt: vidDescPt,
        description_en: vidDescPt,
        description_fr: vidDescPt,
        youtubeId: vidYoutubeId,
        videoUrl: `https://www.youtube.com/embed/${vidYoutubeId}`,
        duration: vidDuration,
        category: vidCategory,
        date: new Date().toISOString().substring(0, 10)
      });
    }
    setVidModalOpen(false);
  };

  // =================== CAROUSEL MODAL STATE ===================
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitlePt, setSlideTitlePt] = useState('');
  const [slideSubtitlePt, setSlideSubtitlePt] = useState('');
  const [slideImg, setSlideImg] = useState('');
  const [slideBtnText, setSlideBtnText] = useState('Ver Notícia');
  const [slideBtnLink, setSlideBtnLink] = useState('news');
  const [slideActive, setSlideActive] = useState(true);
  const [slideOrder, setSlideOrder] = useState(1);

  const handleOpenNewSlide = () => {
    setEditingSlideId(null);
    setSlideTitlePt('');
    setSlideSubtitlePt('');
    setSlideImg('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600');
    setSlideBtnText('Ver Mais');
    setSlideBtnLink('news');
    setSlideActive(true);
    setSlideOrder(carouselSlides.length + 1);
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: CarouselSlide) => {
    setEditingSlideId(slide.id);
    setSlideTitlePt(slide.title_pt);
    setSlideSubtitlePt(slide.subtitle_pt);
    setSlideImg(slide.imageUrl);
    setSlideBtnText(slide.buttonText_pt);
    setSlideBtnLink(slide.buttonLink);
    setSlideActive(slide.active);
    setSlideOrder(slide.order);
    setSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitlePt) return;

    if (editingSlideId) {
      updateCarouselSlide(editingSlideId, {
        title_pt: slideTitlePt,
        title_en: slideTitlePt,
        title_fr: slideTitlePt,
        subtitle_pt: slideSubtitlePt,
        subtitle_en: slideSubtitlePt,
        subtitle_fr: slideSubtitlePt,
        imageUrl: slideImg,
        buttonText_pt: slideBtnText,
        buttonText_en: slideBtnText,
        buttonText_fr: slideBtnText,
        buttonLink: slideBtnLink,
        active: slideActive,
        order: slideOrder
      });
    } else {
      addCarouselSlide({
        title_pt: slideTitlePt,
        title_en: slideTitlePt,
        title_fr: slideTitlePt,
        subtitle_pt: slideSubtitlePt,
        subtitle_en: slideSubtitlePt,
        subtitle_fr: slideSubtitlePt,
        imageUrl: slideImg,
        buttonText_pt: slideBtnText,
        buttonText_en: slideBtnText,
        buttonText_fr: slideBtnText,
        buttonLink: slideBtnLink,
        active: slideActive,
        order: slideOrder
      });
    }
    setSlideModalOpen(false);
  };

  // =================== BACKUP HANDLERS ===================
  const handleDownloadFullBackup = async () => {
    try {
      const jsonStr = await exportDatabaseJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pgg_backup_completo_${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await addBackup('Completo');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível descarregar o backup.');
    }
  };

  const handleFileRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async evt => {
      const content = evt.target?.result as string;
      if (content) {
        try {
          await restoreFromJSON(content);
          alert('Base de dados restaurada com sucesso!');
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Erro ao carregar o ficheiro de cópia de segurança.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Submenu 1: Dados do Sistema */}
      {currentSubmenu === 'sistema' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-navy-100 max-w-4xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-heading font-black text-xl text-[#14243B]">
                Definições e Identidade do Portal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configuração geral de nomes, contactos, lemas trilingues e redes institucionais.
              </p>
            </div>
            {settingsSaved && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5 animate-bounce">
                <CheckCircle className="w-3.5 h-3.5" />
                Definições gravadas!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome da Plataforma *
              </label>
              <input
                type="text"
                required
                value={portalName}
                onChange={e => setPortalName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#14243B]"
              />
            </div>

            {/* Trilingual Slogans */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-[#14243B] uppercase tracking-wider block">
                Slogans Institucionais Trilingues (PT / EN / FR)
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Português (PT)
                </label>
                <input
                  type="text"
                  value={sloganPt}
                  onChange={e => setSloganPt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  English (EN)
                </label>
                <input
                  type="text"
                  value={sloganEn}
                  onChange={e => setSloganEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Français (FR)
                </label>
                <input
                  type="text"
                  value={sloganFr}
                  onChange={e => setSloganFr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telemóveis / WhatsApp da Redação
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correio Eletrónico Geral
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Morada das Instalações Principais em Bissau
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            {/* Social URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={fbUrl}
                  onChange={e => setFbUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={ytUrl}
                  onChange={e => setYtUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={igUrl}
                  onChange={e => setIgUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={e => setMaintenance(e.target.checked)}
                  className="w-4 h-4 rounded text-[#14243B] focus:ring-[#C9A44C]"
                />
                <span>Modo de Manutenção Ativado</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-[#C9A44C] font-bold text-xs shadow-md transition-all"
              >
                Gravar Definições
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submenu 2: Notícias CRUD */}
      {currentSubmenu === 'noticias' && (
        <GenericCRUDTable
          data={articles}
          columns={[
            {
              key: 'title_pt',
              header: 'Título & Categoria',
              render: a => (
                <div>
                  <p className="font-bold text-xs text-slate-900 leading-snug">{a.title_pt}</p>
                  <p className="text-[11px] text-[#C9A44C] font-semibold">{a.category} &bull; {a.author}</p>
                </div>
              )
            },
            {
              key: 'date',
              header: 'Data',
              render: a => <span className="text-xs text-slate-600">{a.date}</span>
            },
            {
              key: 'views',
              header: 'Leituras',
              render: a => <span className="text-xs font-mono font-bold text-slate-800">{a.views.toLocaleString()}</span>
            },
            {
              key: 'flags',
              header: 'Destaques',
              render: a => (
                <div className="flex items-center gap-1">
                  {a.isFeatured && (
                    <span className="px-2 py-0.5 rounded bg-[#14243B] text-[#C9A44C] text-[10px] font-bold">
                      Destaque
                    </span>
                  )}
                  {a.isAnnouncement && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Comunicado
                    </span>
                  )}
                </div>
              )
            }
          ]}
          keyExtractor={a => a.id}
          onCreate={handleOpenNewArticle}
          createLabel="Publicar Nova Notícia"
          onEdit={handleOpenEditArticle}
          onDelete={a => deleteArticle(a.id)}
          searchFilter={(a, q) =>
            a.title_pt.toLowerCase().includes(q) ||
            a.author.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 3: Vídeos CRUD */}
      {currentSubmenu === 'videos' && (
        <GenericCRUDTable
          data={videos}
          columns={[
            {
              key: 'title_pt',
              header: 'Título do Vídeo',
              render: v => (
                <div>
                  <p className="font-bold text-xs text-slate-900 leading-snug">{v.title_pt}</p>
                  <p className="text-[11px] text-slate-500">{v.category} &bull; Duração: {v.duration}</p>
                </div>
              )
            },
            {
              key: 'youtubeId',
              header: 'ID YouTube',
              render: v => <span className="font-mono text-xs text-slate-600">{v.youtubeId}</span>
            },
            {
              key: 'views',
              header: 'Visualizações',
              render: v => <span className="text-xs font-mono font-bold text-slate-800">{v.views.toLocaleString()}</span>
            },
            {
              key: 'date',
              header: 'Data',
              render: v => <span className="text-xs text-slate-600">{v.date}</span>
            }
          ]}
          keyExtractor={v => v.id}
          onCreate={handleOpenNewVideo}
          createLabel="Adicionar Novo Vídeo"
          onEdit={handleOpenEditVideo}
          onDelete={v => deleteVideo(v.id)}
          searchFilter={(v, q) =>
            v.title_pt.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 4: Logs de Auditoria */}
      {currentSubmenu === 'logs' && (
        <GenericCRUDTable
          data={systemLogs}
          columns={[
            {
              key: 'timestamp',
              header: 'Data / Hora',
              render: l => <span className="font-mono text-xs text-slate-600">{l.timestamp}</span>
            },
            {
              key: 'user',
              header: 'Utilizador',
              render: l => (
                <div>
                  <p className="font-bold text-xs text-slate-900">{l.user}</p>
                  <p className="text-[10px] text-slate-400">{l.ip}</p>
                </div>
              )
            },
            {
              key: 'action',
              header: 'Ação & Módulo',
              render: l => (
                <div>
                  <span className="font-bold text-xs text-[#14243B]">{l.action}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                    {l.module}
                  </span>
                </div>
              )
            },
            {
              key: 'details',
              header: 'Detalhes da Operação',
              render: l => <p className="text-xs text-slate-600 line-clamp-1">{l.details}</p>
            }
          ]}
          keyExtractor={l => l.id}
          searchFilter={(l, q) =>
            l.action.toLowerCase().includes(q) ||
            l.user.toLowerCase().includes(q) ||
            l.details.toLowerCase().includes(q)
          }
        />
      )}

      {/* Submenu 5: Backup e Restauro */}
      {currentSubmenu === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download snapshot */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-navy-100 flex flex-col justify-between">
              <div>
                <Download className="w-8 h-8 text-[#C9A44C] mb-3" />
                <h4 className="font-heading font-bold text-base text-[#14243B]">
                  Descarregar Backup Completo
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Exporta todas as notícias, finanças, colaboradores, escalas, património e acessos num ficheiro JSON instantâneo.
                </p>
              </div>
              <button
                onClick={handleDownloadFullBackup}
                className="mt-4 px-4 py-2.5 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#C9A44C]" />
                <span>Exportar Base de Dados (.JSON)</span>
              </button>
            </div>

            {/* Restore snapshot */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-navy-100 flex flex-col justify-between">
              <div>
                <Upload className="w-8 h-8 text-emerald-600 mb-3" />
                <h4 className="font-heading font-bold text-base text-[#14243B]">
                  Restaurar Ficheiro JSON
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Carregue uma cópia de segurança guardada anteriormente para repor todos os registos do portal.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileRestoreUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-4 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Selecionar Ficheiro (.JSON)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Backups History Table */}
          <GenericCRUDTable
            data={backups}
            columns={[
              {
                key: 'filename',
                header: 'Ficheiro de Backup',
                render: b => (
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-900">{b.filename}</p>
                    <p className="text-[11px] text-slate-400">Criado por: {b.createdBy}</p>
                  </div>
                )
              },
              {
                key: 'type',
                header: 'Tipo',
                render: b => (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                    {b.type}
                  </span>
                )
              },
              {
                key: 'size',
                header: 'Tamanho & Registos',
                render: b => (
                  <span className="text-xs text-slate-600">
                    {b.size} ({b.recordsCount} itens)
                  </span>
                )
              },
              {
                key: 'date',
                header: 'Data de Execução',
                render: b => <span className="text-xs text-slate-600">{b.date}</span>
              }
            ]}
            keyExtractor={b => b.id}
          />
        </div>
      )}

      {/* Submenu 6: Carrossel de Slides */}
      {currentSubmenu === 'carrossel' && (
        <GenericCRUDTable
          data={carouselSlides}
          columns={[
            {
              key: 'title_pt',
              header: 'Título do Slide',
              render: s => (
                <div className="flex items-center gap-3">
                  <img
                    src={s.imageUrl}
                    alt={s.title_pt}
                    className="w-16 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-900 leading-snug">{s.title_pt}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{s.subtitle_pt}</p>
                  </div>
                </div>
              )
            },
            {
              key: 'order',
              header: 'Ordem',
              render: s => <span className="font-bold text-xs text-slate-800">#{s.order}</span>
            },
            {
              key: 'active',
              header: 'Estado',
              render: s => (
                <button
                  onClick={() => updateCarouselSlide(s.id, { active: !s.active })}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.active ? 'Ativo' : 'Inativo'}
                </button>
              )
            }
          ]}
          keyExtractor={s => s.id}
          onCreate={handleOpenNewSlide}
          createLabel="Adicionar Novo Slide"
          onEdit={handleOpenEditSlide}
          onDelete={s => deleteCarouselSlide(s.id)}
        />
      )}

      {currentSubmenu === 'users' && <UsersPrivilegesManager />}

      {/* Article Modal */}
      {artModalOpen && (
        <GenericModal
          isOpen={artModalOpen}
          onClose={() => setArtModalOpen(false)}
          title={editingArtId ? 'Editar Artigo' : 'Nova Notícia / Comunicado'}
          maxWidth="3xl"
        >
          <form onSubmit={handleSaveArticle} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título em Português *
              </label>
              <input
                type="text"
                required
                value={artTitlePt}
                onChange={e => setArtTitlePt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título em Inglês (EN)
                </label>
                <input
                  type="text"
                  value={artTitleEn}
                  onChange={e => setArtTitleEn(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título em Francês (FR)
                </label>
                <input
                  type="text"
                  value={artTitleFr}
                  onChange={e => setArtTitleFr(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria *
                </label>
                <select
                  value={artCategory}
                  onChange={e => setArtCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="Igrejas">Igrejas</option>
                  <option value="Música">Música</option>
                  <option value="Testemunhos">Testemunhos</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Juventude">Juventude</option>
                  <option value="Opinião">Opinião</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Autor
                </label>
                <input
                  type="text"
                  value={artAuthor}
                  onChange={e => setArtAuthor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tempo Leitura
                </label>
                <input
                  type="text"
                  value={artReadTime}
                  onChange={e => setArtReadTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <ImageUrlUploadField
              label="Imagem da notícia"
              value={artImage}
              onChange={setArtImage}
              placeholder="https://... ou anexar do computador"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resumo / Lead *
              </label>
              <textarea
                rows={2}
                required
                value={artSummaryPt}
                onChange={e => setArtSummaryPt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corpo do Artigo
              </label>
              <textarea
                rows={4}
                value={artContentPt}
                onChange={e => setArtContentPt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={artFeatured}
                  onChange={e => setArtFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#14243B]"
                />
                <span>Marcar como Destaque Principal</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={artAnnouncement}
                  onChange={e => setArtAnnouncement(e.target.checked)}
                  className="w-4 h-4 rounded text-[#14243B]"
                />
                <span>Publicar como Comunicado Oficial (Novidades)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArtModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Notícia
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Video Modal */}
      {vidModalOpen && (
        <GenericModal
          isOpen={vidModalOpen}
          onClose={() => setVidModalOpen(false)}
          title={editingVidId ? 'Editar Vídeo' : 'Adicionar Vídeo'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveVideo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título do Vídeo *
              </label>
              <input
                type="text"
                required
                value={vidTitlePt}
                onChange={e => setVidTitlePt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ID do YouTube *
                </label>
                <input
                  type="text"
                  required
                  value={vidYoutubeId}
                  onChange={e => setVidYoutubeId(e.target.value)}
                  placeholder="Ex: dQw4w9WgXcQ"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duração
                </label>
                <input
                  type="text"
                  value={vidDuration}
                  onChange={e => setVidDuration(e.target.value)}
                  placeholder="Ex: 45m"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={vidCategory}
                onChange={e => setVidCategory(e.target.value as any)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              >
                <option value="Louvor & Adoração">Louvor & Adoração</option>
                <option value="Pregações">Pregações</option>
                <option value="Reportagens">Reportagens</option>
                <option value="Entrevistas">Entrevistas</option>
                <option value="Documentários">Documentários</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição do Vídeo
              </label>
              <textarea
                rows={3}
                value={vidDescPt}
                onChange={e => setVidDescPt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVidModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Vídeo
              </button>
            </div>
          </form>
        </GenericModal>
      )}

      {/* Slide Modal */}
      {slideModalOpen && (
        <GenericModal
          isOpen={slideModalOpen}
          onClose={() => setSlideModalOpen(false)}
          title={editingSlideId ? 'Editar Slide' : 'Novo Slide de Destaque'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveSlide} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título do Slide *
              </label>
              <input
                type="text"
                required
                value={slideTitlePt}
                onChange={e => setSlideTitlePt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtítulo / Descrição
              </label>
              <textarea
                rows={2}
                value={slideSubtitlePt}
                onChange={e => setSlideSubtitlePt(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <ImageUrlUploadField
              label="Imagem do slide"
              value={slideImg}
              onChange={setSlideImg}
              required
              placeholder="https://... ou anexar do computador"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={slideBtnText}
                  onChange={e => setSlideBtnText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destino da Ligação (Link)
                </label>
                <input
                  type="text"
                  value={slideBtnLink}
                  onChange={e => setSlideBtnLink(e.target.value)}
                  placeholder="Ex: news, videos, artist-zone"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ordem de Apresentação
                </label>
                <input
                  type="number"
                  min="1"
                  value={slideOrder}
                  onChange={e => setSlideOrder(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={slideActive}
                  onChange={e => setSlideActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#14243B]"
                />
                <span>Slide Ativo no Carrossel</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSlideModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554]"
              >
                Guardar Slide
              </button>
            </div>
          </form>
        </GenericModal>
      )}
    </div>
  );
};
