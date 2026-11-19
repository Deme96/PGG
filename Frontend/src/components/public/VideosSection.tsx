import React, { useState } from 'react';
import { Video } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { GenericModal } from '../common/GenericModal';
import { Play, Eye, Calendar, Clock, Video as VideoIcon } from 'lucide-react';

interface VideosSectionProps {
  videos: Video[];
  limit?: number;
}

export const VideosSection: React.FC<VideosSectionProps> = ({ videos, limit }) => {
  const { getLocalized, t } = useLanguage();
  const { incrementVideoViews } = useData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const displayList = limit ? videos.slice(0, limit) : videos;

  const handleOpenVideo = (video: Video) => {
    setSelectedVideo(video);
    incrementVideoViews(video.id);
  };

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A44C] mb-1">
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Multimédia & Transmissões</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
            {t('multimediaVideos')}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayList.map(video => (
          <div
            key={video.id}
            onClick={() => handleOpenVideo(video)}
            className="bg-white rounded-2xl shadow-soft border border-navy-100 overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80`}
                  alt={getLocalized(video, 'title')}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                />

                {/* Play Icon Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#14243B]/80 border border-[#C9A44C] text-[#C9A44C] flex items-center justify-center shadow-gold group-hover:scale-110 group-hover:bg-[#C9A44C] group-hover:text-[#14243B] transition-all duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Category & Duration */}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#14243B]/90 text-[#C9A44C] text-[10px] font-bold">
                  {video.category}
                </span>

                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </span>
              </div>

              {/* Title & Description */}
              <div className="p-4">
                <h3 className="font-heading font-bold text-sm text-[#14243B] group-hover:text-[#C9A44C] transition-colors line-clamp-2 leading-snug mb-2">
                  {getLocalized(video, 'title')}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                  {getLocalized(video, 'description')}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#C9A44C]" />
                {video.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#C9A44C]" />
                {video.views.toLocaleString()} {t('views')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <GenericModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={getLocalized(selectedVideo, 'title')}
          subtitle={`${selectedVideo.category} • ${selectedVideo.duration} • ${selectedVideo.date}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Responsive 16:9 Player Embed */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={getLocalized(selectedVideo, 'title')}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#14243B] text-[#C9A44C] text-xs font-bold">
                  {selectedVideo.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#C9A44C]" />
                  {selectedVideo.views.toLocaleString()} visualizações
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {getLocalized(selectedVideo, 'description')}
              </p>
            </div>
          </div>
        </GenericModal>
      )}
    </div>
  );
};
