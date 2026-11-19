import React, { useState } from 'react';
import { Artist } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { GenericModal } from '../common/GenericModal';
import { Music, MapPin, Church, ExternalLink, Disc, Phone, Mail } from 'lucide-react';

interface ArtistsSectionProps {
  artists: Artist[];
  limit?: number;
  onOpenArtistZone?: () => void;
}

export const ArtistsSection: React.FC<ArtistsSectionProps> = ({
  artists,
  limit,
  onOpenArtistZone
}) => {
  const { getLocalized, t } = useLanguage();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const displayList = limit ? artists.slice(0, limit) : artists;

  return (
    <div className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A44C] mb-1">
            <Music className="w-3.5 h-3.5" />
            <span>Ministérios Musicais</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
            {t('gospelArtists')}
          </h2>
        </div>

        {onOpenArtistZone && (
          <button
            onClick={onOpenArtistZone}
            className="px-4 py-2 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-[#C9A44C] text-xs font-bold border border-[#C9A44C]/40 transition-colors shadow-sm self-start sm:self-auto"
          >
            {t('submitMusicBtn')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayList.map(artist => (
          <div
            key={artist.id}
            onClick={() => setSelectedArtist(artist)}
            className="bg-white rounded-2xl shadow-soft border border-navy-100 overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Photo */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-[#C9A44C] text-[#14243B] text-[10px] font-extrabold uppercase tracking-wider">
                  {artist.genre}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-heading font-bold text-base text-[#14243B] group-hover:text-[#C9A44C] transition-colors leading-snug mb-2">
                  {artist.name}
                </h3>

                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
                  {getLocalized(artist, 'biography')}
                </p>

                <div className="space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Church className="w-3.5 h-3.5 text-[#C9A44C] shrink-0" />
                    <span className="truncate">{artist.church}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A44C] shrink-0" />
                    <span className="truncate">{artist.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Songs Count Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Disc className="w-3.5 h-3.5 text-[#C9A44C]" />
                {artist.popularSongs.length} louvores em destaque
              </span>
              <span className="text-[11px] font-bold text-[#14243B] group-hover:text-[#C9A44C]">
                Ver Perfil &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Artist Profile Modal */}
      {selectedArtist && (
        <GenericModal
          isOpen={!!selectedArtist}
          onClose={() => setSelectedArtist(null)}
          title={selectedArtist.name}
          subtitle={`${selectedArtist.genre} • ${selectedArtist.location}`}
          maxWidth="3xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Photo & Badges */}
            <div className="md:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-square">
                <img
                  src={selectedArtist.imageUrl}
                  alt={selectedArtist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Church className="w-4 h-4 text-[#C9A44C]" />
                  <span>{selectedArtist.church}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#C9A44C]" />
                  <span>{selectedArtist.location}</span>
                </div>
                {selectedArtist.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-[#C9A44C]" />
                    <span>{selectedArtist.phone}</span>
                  </div>
                )}
                {selectedArtist.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-[#C9A44C]" />
                    <span>{selectedArtist.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Details & Discography */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-[#14243B] uppercase tracking-wider mb-2">
                  Biografia do Ministério
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {getLocalized(selectedArtist, 'biography')}
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-[#14243B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-[#C9A44C]" />
                  Canções e Lançamentos em Destaque
                </h4>
                <ul className="space-y-2">
                  {selectedArtist.popularSongs.map((song, i) => (
                    <li
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#14243B] text-[#C9A44C] flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        {song}
                      </span>
                      <span className="text-[11px] text-[#C9A44C] font-bold flex items-center gap-1">
                        Disponível no Portal <ExternalLink className="w-3 h-3" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};
