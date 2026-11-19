import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { GenericModal } from './GenericModal';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'success' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = 'danger'
}) => {
  const { t } = useLanguage();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const isDanger = type === 'danger';
  const isSuccess = type === 'success';

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
            isDanger
              ? 'bg-rose-100 text-rose-600'
              : isSuccess
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {isSuccess ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            {cancelLabel || t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-white shadow-sm transition-colors ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-[#C9A44C] hover:bg-[#B38F3B]'
            }`}
          >
            {confirmLabel || (isDanger ? t('delete') : t('confirm'))}
          </button>
        </div>
      </div>
    </GenericModal>
  );
};
