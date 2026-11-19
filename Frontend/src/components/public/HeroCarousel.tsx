import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  onNavigate: (view: string, detailId?: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const { carouselSlides } = useData();
  const { getLocalized } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlides = carouselSlides.filter(s => s.active).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  const handleButtonClick = () => {
    if (currentSlide.buttonLink.startsWith('news-')) {
      onNavigate('news', currentSlide.buttonLink);
    } else {
      onNavigate(currentSlide.buttonLink);
    }
  };

  return (
    <div
      className="relative w-full h-[460px] sm:h-[520px] md:h-[580px] overflow-hidden rounded-3xl shadow-card my-6 border border-[#C9A44C]/30 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A131F] via-[#14243B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1929]/90 via-[#14243B]/40 to-transparent" />
      </div>

      {/* Floating Card Over Slider */}
      <div className="absolute inset-0 flex items-end sm:items-center p-6 sm:p-12 md:p-16">
        <div className="max-w-2xl bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-card border-l-4 border-l-[#C9A44C] border border-white/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14243B] text-[#C9A44C] text-[11px] font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9A44C] animate-pulse"></span>
            Destaque Portal Gospel
          </div>

          <h1 className="font-heading font-black text-xl sm:text-2xl md:text-3xl text-[#14243B] leading-tight mb-3">
            {getLocalized(currentSlide, 'title')}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-5">
            {getLocalized(currentSlide, 'subtitle')}
          </p>

          <button
            onClick={handleButtonClick}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-gold transition-all"
          >
            <span>{getLocalized(currentSlide, 'buttonText')}</span>
            <ArrowRight className="w-4 h-4 text-[#C9A44C]" />
          </button>
        </div>
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#14243B]/80 hover:bg-[#14243B] text-white border border-[#C9A44C]/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5 text-[#C9A44C]" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#14243B]/80 hover:bg-[#14243B] text-white border border-[#C9A44C]/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-5 h-5 text-[#C9A44C]" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-4 right-8 flex items-center gap-2 z-20">
        {activeSlides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-[#C9A44C]'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
