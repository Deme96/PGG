import React, { useRef, useState } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUrlUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export const ImageUrlUploadField: React.FC<ImageUrlUploadFieldProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'https://...',
  compact = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      onChange(await api.uploadImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </label>
      <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'sm:grid-cols-[1fr_auto]'}`}>
        <input
          type="url"
          required={required}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#C9A44C]/60 bg-[#C9A44C]/10 px-3 text-xs font-bold text-[#14243B] hover:bg-[#C9A44C]/20 disabled:cursor-wait disabled:opacity-60"
        >
          {isUploading ? <UploadCloud className="h-4 w-4 animate-pulse" /> : <ImagePlus className="h-4 w-4" />}
          {isUploading ? 'A enviar...' : 'Anexar do computador'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
      {value && (
        <img src={value} alt="" className="mt-2 h-20 w-32 rounded-lg border border-slate-200 bg-slate-50 object-cover" />
      )}
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
};
