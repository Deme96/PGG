import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ManagementLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ManagementLogin: React.FC<ManagementLoginProps> = ({ onBack, onSuccess }) => {
  const { loginWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await loginWithPassword(email.trim(), password);
      onSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível iniciar sessão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 sm:px-8">
      <section className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_90px_-28px_rgba(20,36,59,0.35)] md:grid md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#14243B] p-8 text-white sm:p-12 md:min-h-[600px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,164,76,0.28),transparent_35%),linear-gradient(145deg,#1e3554,#0a131f)]" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full border border-[#C9A44C]/20" />
          <div className="absolute -bottom-12 -right-4 h-48 w-48 rounded-full border border-[#C9A44C]/20" />

          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C9A44C]/70 bg-[#0D1929]/70 text-lg font-black text-[#E2C477] shadow-gold">
                PGG
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em]">Portal Gospel</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#E2C477]">evangelho kana para</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A44C]/35 bg-white/5 px-3 py-1.5 text-xs text-[#E2C477]">
              <ShieldCheck className="h-4 w-4" />
              Acesso protegido
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight sm:text-5xl">
              Área de gestão
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-300">
              Entre para gerir conteúdos, equipas e operações do Portal Gospel Guineense.
            </p>
          </div>

          <p className="relative mt-10 text-xs text-slate-400">
            A Voz e a Luz da Comunidade Gospel na Guiné-Bissau
          </p>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-12">
          <button
            type="button"
            onClick={onBack}
            className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#14243B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao portal
          </button>

          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A4802E]">Bem-vindo</p>
            <h2 className="mt-2 text-3xl font-bold text-[#14243B]">Iniciar sessão</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Utilize as credenciais de administrador para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="management-email" className="mb-2 block text-sm font-bold text-slate-700">
                Endereço de e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="management-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="admin@portalgospel.gw"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#C9A44C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#C9A44C]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="management-password" className="mb-2 block text-sm font-bold text-slate-700">
                Palavra-passe
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="management-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Introduza a sua palavra-passe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#C9A44C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#C9A44C]/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14243B] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#14243B]/15 transition-all hover:bg-[#1E3554] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4 text-[#E2C477]" />
              )}
              {isSubmitting ? 'A validar...' : 'Entrar na área de gestão'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            O acesso é validado de forma segura pelo servidor.
          </p>
        </div>
      </section>
    </main>
  );
};
