import { motion } from 'framer-motion'

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  tone = 'cyan', // 'cyan' | 'violet' | 'gold' | 'emerald' | 'flame'
  className = '',
}) {
  return (
    <motion.div
      className={`crystal-panel stat-card-box tone-${tone} ${className}`.trim()}
      whileHover={{ y: -2 }}
    >
      <div className="stat-card-header">
        <span className={`stat-card-icon tone-${tone}`}>
          {Icon && <Icon size={16} />}
        </span>
        <span className="stat-card-label">{label}</span>
      </div>
      <div className="stat-card-value-wrap">
        <strong className={`stat-card-value ${tone}-glow`}>{value}</strong>
        {subtext && <small className="stat-card-subtext">{subtext}</small>}
      </div>
    </motion.div>
  )
}
