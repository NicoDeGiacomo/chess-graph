import { useEffect, useCallback } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: 'blue' | 'red';
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialogInner({
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onClose,
}: Omit<ConfirmDialogProps, 'open'>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const confirmClasses =
    confirmStyle === 'red'
      ? 'bg-red-600 hover:bg-red-500'
      : 'bg-blue-600 hover:bg-blue-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-medium text-zinc-100 mb-2">{title}</h2>
        <p className="text-sm text-zinc-400 mb-5">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`text-sm text-white rounded px-4 py-1.5 ${confirmClasses}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, ...rest }: ConfirmDialogProps) {
  if (!open) return null;
  return <ConfirmDialogInner {...rest} />;
}
