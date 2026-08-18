import React from 'react';
import { CheckCircle2, AlertCircle, X, Download } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="notification-modal"
        className="w-full max-w-md bg-[#12121d] border border-[#2a2a40] rounded-xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-white relative animate-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className="mt-0.5">
            {type === 'success' && (
              <div className="w-9 h-9 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.2)]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {type === 'error' && (
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
            <p className="text-xs text-[#8888aa] leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'success'
                ? 'bg-[#00ff88] hover:bg-[#00fff5] text-[#0a0a0f]'
                : 'bg-[#2a2a40] hover:bg-[#3f3f5a] text-white'
            }`}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
