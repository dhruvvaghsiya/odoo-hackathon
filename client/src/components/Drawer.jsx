import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, position = 'right' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRight = position === 'right';

  return (
    <>
      <div className="overlay animate-fade-in" onClick={onClose} />
      <div
        className={`drawer ${isRight ? 'drawer--right animate-slide-in-right' : 'drawer--bottom animate-slide-up-bottom'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-sm px-6 py-4 border-b border-warm-gray-lighter flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{title}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}
