import { motion } from 'framer-motion'
import { Award, BookOpen, Brain, Castle, Code2, Footprints, Sparkles, Swords, TerminalSquare, Trophy } from 'lucide-react'

const icons = {
  footprints: Footprints,
  'book-open': BookOpen,
  brain: Brain,
  'code-2': Code2,
  'terminal-square': TerminalSquare,
  swords: Swords,
  trophy: Trophy,
  castle: Castle,
  sparkles: Sparkles,
  crown: Trophy,
}

export default function BadgeCard({ badge, compact = false }) {
  const Icon = icons[badge.icon] || Award
  const rarity = (badge.rarity || 'common').toLowerCase()

  return (
    <motion.article
      className={`crystal-panel badge-card relic-artifact ${badge.earned ? 'earned' : 'unearned'} rarity-${rarity} ${compact ? 'compact' : ''}`}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relic-crystal-gem">
        <span className="relic-inner-facet" />
        <Icon size={compact ? 20 : 26} className="relic-icon" />
        {badge.earned && <span className="relic-sparkle-dot" />}
      </div>

      <div className="badge-card-copy">
        <div className="badge-card-heading">
          <strong>{badge.title}</strong>
          {badge.earned && <span className="crystal-chip small emerald">UNLOCKED</span>}
        </div>

        <p>{badge.description}</p>

        {!compact && (
          <div className="relic-meta-row">
            <div className="crystal-progress-track">
              <div
                className="crystal-progress-fill"
                style={{ width: `${badge.progress?.percentage || (badge.earned ? 100 : 0)}%` }}
              />
            </div>
            <small>
              {badge.earned
                ? `Forged on ${new Date(badge.earnedAt).toLocaleDateString()}`
                : `${badge.progress?.current || 0} / ${badge.progress?.target || 1} required`}
            </small>
          </div>
        )}
      </div>

      {!compact && (
        <span className={`crystal-chip small relic-rarity-chip ${rarity}`}>
          {badge.rarity || 'Common'} Relic
        </span>
      )}
    </motion.article>
  )
}
