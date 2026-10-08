import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function PageHeader({
  eyebrow = 'TECHVERSE REALM',
  title,
  highlightText,
  subtitle,
  icon: Icon,
  badge,
  action,
  className = '',
}) {
  return (
    <motion.header
      className={`crystal-section-header page-header-layout ${className}`.trim()}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header-content">
        {Icon && (
          <div className="page-header-icon-crest">
            <Icon size={24} className="header-icon-glyph" />
            <span className="icon-crest-glow" />
          </div>
        )}

        <div className="page-header-text">
          {eyebrow && (
            <p className="crystal-eyebrow">
              <Sparkles size={12} className="spark" /> {eyebrow} <Sparkles size={12} className="spark" />
            </p>
          )}

          <h1 className="crystal-title">
            {title}{' '}
            {highlightText && <span className="highlight">{highlightText}</span>}
          </h1>

          {subtitle && <p className="crystal-subtitle">{subtitle}</p>}
        </div>
      </div>

      {(badge || action) && (
        <div className="page-header-actions">
          {badge}
          {action}
        </div>
      )}
    </motion.header>
  )
}
