import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Users, TrendingUp, Navigation } from 'lucide-react';

export const AccessMap: React.FC = () => {
  const { visitorPings } = useData();
  const { t } = useLanguage();
  const [selectedPingId, setSelectedPingId] = useState<string | null>(null);

  // Group views by country for Top Countries Leaderboard
  const countryLeaderboard = React.useMemo(() => {
    const map: Record<string, { country: string; code: string; totalViews: number; cities: string[] }> = {};
    visitorPings.forEach(p => {
      if (!map[p.countryCode]) {
        map[p.countryCode] = {
          country: p.countryName,
          code: p.countryCode,
          totalViews: 0,
          cities: []
        };
      }
      map[p.countryCode].totalViews += p.viewsCount;
      if (!map[p.countryCode].cities.includes(p.city)) {
        map[p.countryCode].cities.push(p.city);
      }
    });

    return Object.values(map).sort((a, b) => b.totalViews - a.totalViews);
  }, [visitorPings]);

  // Total global access views
  const totalViews = visitorPings.reduce((acc, p) => acc + p.viewsCount, 0);
  const selectedPing = visitorPings.find(ping => ping.id === selectedPingId) || visitorPings[0];
  const selectedLocation = selectedPing || {
    city: 'Bissau',
    countryName: 'Guiné-Bissau',
    lat: 11.8632,
    lng: -15.5984
  };
  const mapQuery = `${selectedLocation.lat},${selectedLocation.lng}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=8&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="my-10 bg-white rounded-3xl shadow-soft border border-navy-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A44C] mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{t('worldwideAccess')}</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#14243B]">
            {t('accessMap')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Localidades associadas aos acessos registados no Portal Gospel na Guiné-Bissau e na diáspora.
          </p>
        </div>

        {/* Global Counter Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#14243B] text-white flex items-center gap-3 shadow-sm">
            <Users className="w-5 h-5 text-[#C9A44C]" />
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Total de Leituras</p>
              <p className="font-heading font-black text-base text-[#C9A44C]">{totalViews.toLocaleString()}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Google Maps (Left) + Top Countries Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 relative h-[420px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
          <iframe
            title="Mapa do Portal Gospel Guineense no Google Maps"
            src={googleMapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-xl border border-[#C9A44C]/40 bg-[#14243B]/90 px-3 py-1.5 text-[11px] text-white backdrop-blur-md">
            <Navigation className="h-3.5 w-3.5 text-[#C9A44C]" />
            <span>{selectedLocation.city}, {selectedLocation.countryName}</span>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-bold text-[#E2C477] hover:underline"
            >
              Abrir no Google Maps
            </a>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#14243B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C9A44C]" />
              Top Países & Diáspora
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {countryLeaderboard.map((item, index) => {
                const percent = Math.round((item.totalViews / (totalViews || 1)) * 100);
                return (
                  <div key={item.code} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#14243B] text-[#C9A44C] text-[10px] font-black flex items-center justify-center">
                          {index + 1}
                        </span>
                        {item.country}
                      </span>
                      <span className="text-[#14243B]">{item.totalViews.toLocaleString()}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#14243B] to-[#C9A44C] rounded-full"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex flex-wrap items-center gap-1">
                        <span>Cidades:</span>
                        {item.cities.slice(0, 3).map(city => {
                          const ping = visitorPings.find(
                            candidate => candidate.countryCode === item.code && candidate.city === city
                          );
                          return (
                            <button
                              key={city}
                              type="button"
                              aria-label={`Centrar mapa em ${city}, ${item.country}`}
                              aria-pressed={ping?.id === selectedPing?.id}
                              onClick={() => ping && setSelectedPingId(ping.id)}
                              className={`rounded px-1 py-0.5 text-[10px] transition-colors ${
                                ping?.id === selectedPing?.id
                                  ? 'bg-[#14243B] font-bold text-[#E2C477]'
                                  : 'text-[#14243B] underline decoration-dotted hover:text-[#9A762B]'
                              }`}
                            >
                              {city}
                            </button>
                          );
                        })}
                      </span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#C9A44C]" />
            <span>Selecione uma cidade para centrar o mapa. Localizações aproximadas dos registos.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
