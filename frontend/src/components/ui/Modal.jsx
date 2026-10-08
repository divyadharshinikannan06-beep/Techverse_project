import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '640px',
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="crystal-modal-overlay">
          <motion.div
            className="crystal-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="crystal-modal-dialog crystal-panel"
            style={{ maxWidth }}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="crystal-modal-header">
              <div>
                {title && <h2 className="crystal-modal-title">{title}</h2>}
                {subtitle && <p className="crystal-modal-subtitle">{subtitle}</p>}
              </div>
              <button
                type="button"
                className="crystal-modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="crystal-modal-body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
