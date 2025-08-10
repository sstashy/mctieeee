import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  hideClose?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  hideClose,
  children,
}: PropsWithChildren<ModalProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg 
                           bg-[var(--color-bg-alt)] p-6 shadow-xl border border-[var(--color-border)]"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              >
                {title && (
                  <Dialog.Title className="mb-4 text-lg font-semibold">{title}</Dialog.Title>
                )}
                {children}
                {!hideClose && (
                  <Dialog.Close
                    className="absolute right-3 top-3 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                    aria-label="Kapat"
                  >
                    ×
                  </Dialog.Close>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
