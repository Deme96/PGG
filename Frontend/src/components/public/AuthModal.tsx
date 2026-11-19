import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'journalist' | 'artist' | 'follower'>('follower');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onClose();
    } catch (error) {
      setFeedbackMsg(error instanceof Error ? error.message : 'Não foi possível iniciar sessão.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setFeedbackMsg('Preencha os campos obrigatórios.');
      return;
    }
    try {
      await register(name, email, password, selectedRole);
      onClose();
    } catch (error) {
      setFeedbackMsg(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A131F]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Split-screen Modal Dialog */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-card border border-navy-100 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-12 min-h-[540px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Brand & Visual Identity (Navy + Gold) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#14243B] via-[#0D1929] to-[#0A131F] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Pattern */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#C9A44C]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#1E3554]/40 blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0D1929] border border-[#C9A44C] flex items-center justify-center shadow-gold">
                <span className="font-heading font-black text-2xl text-[#C9A44C]">PGG</span>
              </div>
              <div>
                <h2 className="font-heading font-black text-lg text-white leading-tight">
                  PORTAL GOSPEL
                </h2>
                <p className="text-[10px] text-[#C9A44C] uppercase tracking-widest font-semibold">
                  evangelho kana para
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-xl font-bold text-slate-100 leading-snug">
                Plataforma Informativa e de Gestão Multimédia
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aceda à sua área personalizada. Administradores têm acesso ao controlo integral de
                notícias, escalas, correspondências e finanças.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#C9A44C]" />
            <span>Palavras-passe protegidas com hash seguro</span>
          </div>
        </div>

        {/* Right Side: Form (Cream Surface & White Cards) */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between bg-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Form Header Tabs */}
          <div>
            <div className="flex items-center gap-4 border-b border-slate-100 pb-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFeedbackMsg('');
                }}
                className={`font-heading text-base font-bold pb-1 transition-all ${
                  mode === 'login'
                    ? 'text-[#14243B] border-b-2 border-[#C9A44C]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFeedbackMsg('');
                }}
                className={`font-heading text-base font-bold pb-1 transition-all ${
                  mode === 'register'
                    ? 'text-[#14243B] border-b-2 border-[#C9A44C]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('register')}
              </button>
            </div>

            {feedbackMsg && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A44C] shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Mode 1: Login */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correio Eletrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@portalgospel.gw"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Iniciar sessão</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A44C]" />
                  </button>
                </div>
              </form>
            )}

            {/* Mode 3: Register */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nome e Apelido"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Correio Eletrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Perfil de Utilizador
                  </label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                  >
                    <option value="follower">Seguidor / Membro Comunitário</option>
                    <option value="artist">Músico / Líder de Louvor</option>
                    <option value="journalist">Colaborador / Jornalista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Criar Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo de 12 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A44C]/30 focus:border-[#C9A44C]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#14243B] hover:bg-[#1E3554] text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Criar Conta</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A44C]" />
                  </button>
                </div>
              </form>
            )}

          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Portal Gospel Guineense &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
