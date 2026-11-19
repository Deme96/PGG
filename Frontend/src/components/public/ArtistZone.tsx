import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { Music, CheckCircle2, Send, Radio, Mic, Disc, ImagePlus, UploadCloud } from 'lucide-react';

const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;

export const ArtistZone: React.FC = () => {
  const { t } = useLanguage();
  const { addMusicRequest } = useData();

  const [artistName, setArtistName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('Afro-Gospel');
  const [audioUrl, setAudioUrl] = useState('');
  const [church, setChurch] = useState('');
  const [sessionType, setSessionType] = useState<'Publicação de Música' | 'Agendamento de Sessão de Estúdio' | 'Entrevista ao Vivo'>('Publicação de Música');
  const [biography, setBiography] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!audioFile) {
      setAudioPreviewUrl('');
      return;
    }
    const previewUrl = URL.createObjectURL(audioFile);
    setAudioPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [audioFile]);

  useEffect(() => {
    if (!coverImageFile) {
      setCoverPreviewUrl('');
      return;
    }
    const previewUrl = URL.createObjectURL(coverImageFile);
    setCoverPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverImageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName || !contactPhone || !songTitle) {
      setSubmitError('Por favor preencha os campos obrigatórios (*).');
      return;
    }

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
      setSubmitError('O áudio deve ter no máximo 20 MB.');
      return;
    }
    if (coverImageFile && coverImageFile.size > MAX_COVER_SIZE) {
      setSubmitError('A imagem de capa deve ter no máximo 5 MB.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addMusicRequest(
        {
          artistName,
          contactPhone,
          contactEmail,
          songTitle,
          genre,
          audioUrl,
          biography,
          church: church || 'Independente / Guiné-Bissau',
          requestedDate: new Date().toISOString().substring(0, 10),
          sessionType
        },
        { audio: audioFile || undefined, coverImage: coverImageFile || undefined }
      );
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível enviar o pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setArtistName('');
    setContactPhone('');
    setContactEmail('');
    setSongTitle('');
    setAudioUrl('');
    setChurch('');
    setBiography('');
    setAudioFile(null);
    setCoverImageFile(null);
    setSubmitError('');
    setIsSuccess(false);
  };

  return (
    <div className="my-10 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#14243B] via-[#1E3554] to-[#0D1929] text-white p-8 sm:p-10 rounded-3xl shadow-card border border-[#C9A44C]/30 relative overflow-hidden mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A44C] text-[#14243B] text-xs font-black uppercase tracking-wider mb-3">
            <Music className="w-3.5 h-3.5" />
            <span>Zona do Artista Gospel</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-3">
            {t('artistFormTitle')}
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            {t('artistFormSubtitle')}
          </p>
        </div>

        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-[#C9A44C]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-soft border border-navy-100 p-6 sm:p-10">
        {isSuccess ? (
          <div className="text-center py-12 px-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-heading font-black text-2xl text-[#14243B]">
              Solicitação Enviada com Sucesso!
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              {t('applicationSuccess')} Acompanhe o estado da sua proposta através da Zona do Seguidor ou aguarde o contacto telefónico da redação.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#14243B] text-[#C9A44C] font-bold text-xs hover:bg-[#1E3554] transition-colors"
              >
                Submeter Novo Pedido
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Type Selectors */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                {t('sessionType')} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionType('Publicação de Música')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    sessionType === 'Publicação de Música'
                      ? 'border-[#C9A44C] bg-amber-50/50 shadow-sm ring-1 ring-[#C9A44C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Disc className="w-5 h-5 text-[#C9A44C] mb-2" />
                  <div>
                    <p className="font-bold text-xs text-[#14243B]">{t('musicRelease')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Lançamento de áudio/videoclipe no portal</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionType('Agendamento de Sessão de Estúdio')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    sessionType === 'Agendamento de Sessão de Estúdio'
                      ? 'border-[#C9A44C] bg-amber-50/50 shadow-sm ring-1 ring-[#C9A44C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Mic className="w-5 h-5 text-[#C9A44C] mb-2" />
                  <div>
                    <p className="font-bold text-xs text-[#14243B]">{t('studioBooking')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Gravação nos estúdios PGG em Bissau</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionType('Entrevista ao Vivo')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    sessionType === 'Entrevista ao Vivo'
                      ? 'border-[#C9A44C] bg-amber-50/50 shadow-sm ring-1 ring-[#C9A44C]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Radio className="w-5 h-5 text-[#C9A44C] mb-2" />
                  <div>
                    <p className="font-bold text-xs text-[#14243B]">{t('liveInterview')}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Presença na rádio web e redes sociais</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('artistName')} *
                </label>
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={e => setArtistName(e.target.value)}
                  placeholder="Ex: Irmão Moisés, Coral Betel"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('songTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={songTitle}
                  onChange={e => setSongTitle(e.target.value)}
                  placeholder="Ex: Fonte di Vida, Aleluia Bissau"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('contactPhone')} *
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+245 955 000 000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('contactEmail')}
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="artista@gospel.gw"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('musicGenre')}
                </label>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                >
                  <option value="Afro-Gospel">Afro-Gospel (Gumbé / Tina)</option>
                  <option value="Worship & Adoração">Worship & Adoração Congregacional</option>
                  <option value="Kizomba Gospel">Kizomba Gospel</option>
                  <option value="Gospel Tradicional">Gospel Tradicional</option>
                  <option value="Gospel Rap">Gospel Rap & Urbano</option>
                  <option value="Coral">Coral Polifónico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('churchAffiliation')}
                </label>
                <input
                  type="text"
                  value={church}
                  onChange={e => setChurch(e.target.value)}
                  placeholder="Ex: IEGB Bissau, Assembleia de Deus Gabú"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('audioLink')}
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={e => setAudioUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... ou link do Google Drive"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="artist-audio-upload" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ficheiro de áudio
                </label>
                <label
                  htmlFor="artist-audio-upload"
                  className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition-colors hover:border-[#C9A44C] hover:bg-amber-50/40"
                >
                  <UploadCloud className="h-5 w-5 text-[#C9A44C]" />
                  <span className="text-xs font-semibold text-slate-700">
                    {audioFile ? audioFile.name : 'Selecionar música'}
                  </span>
                  <span className="text-[11px] text-slate-500">MP3, WAV, M4A ou AAC · máximo 20 MB</span>
                </label>
                <input
                  id="artist-audio-upload"
                  type="file"
                  accept=".mp3,.wav,.m4a,.aac,audio/mpeg,audio/wav,audio/mp4,audio/aac"
                  onChange={event => {
                    setAudioFile(event.currentTarget.files?.[0] || null);
                    setSubmitError('');
                  }}
                  className="sr-only"
                />
                {audioPreviewUrl && (
                  <audio controls preload="metadata" src={audioPreviewUrl} className="mt-3 w-full" aria-label="Pré-visualização do áudio" />
                )}
              </div>

              <div>
                <label htmlFor="artist-cover-upload" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Imagem de capa
                </label>
                <label
                  htmlFor="artist-cover-upload"
                  className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center transition-colors hover:border-[#C9A44C] hover:bg-amber-50/40"
                >
                  <ImagePlus className="h-5 w-5 text-[#C9A44C]" />
                  <span className="text-xs font-semibold text-slate-700">
                    {coverImageFile ? coverImageFile.name : 'Selecionar capa'}
                  </span>
                  <span className="text-[11px] text-slate-500">JPG, PNG ou WebP · máximo 5 MB</span>
                </label>
                <input
                  id="artist-cover-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={event => {
                    setCoverImageFile(event.currentTarget.files?.[0] || null);
                    setSubmitError('');
                  }}
                  className="sr-only"
                />
                {coverPreviewUrl && (
                  <img
                    src={coverPreviewUrl}
                    alt="Pré-visualização da capa"
                    className="mt-3 h-28 w-28 rounded-xl border border-slate-200 object-cover"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('biography')}
              </label>
              <textarea
                rows={3}
                value={biography}
                onChange={e => setBiography(e.target.value)}
                placeholder="Conte-nos brevemente o propósito deste louvor, testemunho ou percurso musical..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
              />
            </div>

            {submitError && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14243B] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-[#1E3554] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Send className="w-4 h-4 text-[#C9A44C]" />
                <span>{isSubmitting ? 'A enviar...' : t('submitApplication')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
