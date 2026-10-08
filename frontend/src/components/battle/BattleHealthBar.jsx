import { motion } from 'framer-motion'

export default function BattleHealthBar({ label, value, side = 'player' }) {
  return (
    <div className={`battle-health ${side}`}>
      <div className="battle-health-label"><strong>{label}</strong><span>{value} HP</span></div>
      <div className="battle-health-track" role="progressbar" aria-label={`${label} health`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><motion.span animate={{ width: `${value}%` }} transition={{ duration: .45, ease: 'easeOut' }} /></div>
    </div>
  )
}
