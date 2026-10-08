import { motion } from 'framer-motion'
import { Award, X } from 'lucide-react'

export default function BadgeUnlockToast({ badge, onClose }) {
  if (!badge) return null
  return <motion.div className="badge-unlock-toast" initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }} role="status"><span className="badge-toast-icon"><Award size={19} /></span><div><p>Badge unlocked</p><strong>{badge.title}</strong><small>{badge.description}</small></div><button type="button" onClick={onClose} aria-label="Close badge notification"><X size={15} /></button></motion.div>
}
