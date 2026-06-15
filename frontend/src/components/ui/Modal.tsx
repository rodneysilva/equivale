import { createSignal, type Component } from 'solid-js';
import { X } from 'lucide-solid';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: Component<ModalProps> = (props) => {
  const [show, setShow] = createSignal(false);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => props.onClose(), 200);
  };

  const sizeClass = () => {
    if (props.size === 'sm') return 'max-w-sm';
    if (props.size === 'lg') return 'max-w-2xl';
    return 'max-w-lg';
  };

  return (
    <>
      {props.open && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${show() ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
          />
          <div
            class={`relative eq-card w-full ${sizeClass()} p-6 transition-all duration-200 ${show() ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {props.title && (
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{props.title}</h2>
                <button
                  onClick={handleClose}
                  class="p-1 rounded eq-btn-ghost"
                >
                  <X size={20} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
            )}
            {!props.title && (
              <button
                onClick={handleClose}
                class="absolute top-4 right-4 p-1 rounded eq-btn-ghost"
              >
                <X size={20} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            )}
            {props.children}
          </div>
        </div>
      )}
      {props.open && setTimeout(() => setShow(true), 10) && null}
    </>
  );
};

export default Modal;
