import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { ArrowRight, ChevronRight, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import CrystalBadge from './CrystalBadge'

export default function DomainCard({
  title,
  domain,
  realmType = 'Tech Realm',
  description,
  difficulty = 'Beginner',
  progress = 0,
  xpReward = 500,
  icon: Icon,
  tone = 'cyan',
  to,
  moduleCount,
  completedCount,
}) {
  return (
    <Tilt
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      scale={1.02}
      transitionSpeed={400}
      glareEnable={true}
      glareMaxOpacity={0.12}
      glareColor="#ffffff"
      className="domain-tilt-wrap"
    >
      <motion.article
        className={`crystal-panel domain-card-box tone-${tone}`}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow backdrop aura */}
        <div className={`domain-card-aura tone-${tone}`} aria-hidden="true" />

        {/* Card Header */}
        <div className="domain-card-header">
          <div className={`domain-card-icon-wrap tone-${tone}`}>
            {Icon && <Icon size={24} className="domain-card-icon" />}
            <span className="icon-orbit-spark" />
          </div>

          <div className="domain-card-badges">
            <span className="domain-realm-type">{realmType}</span>
            <CrystalBadge tone={tone} size="sm">
              {difficulty}
            </CrystalBadge>
          </div>
        </div>

        {/* Title & Description */}
        <div className="domain-card-body">
          <h3 className="domain-card-title">{title}</h3>
          <p className="domain-card-desc">{description}</p>
        </div>

        {/* Progress & Stats */}
        <div className="domain-card-progress-area">
          <div className="domain-stats-row">
            <span className="domain-spire-count">
              {typeof completedCount === 'number' && typeof moduleCount === 'number' ? (
                <><strong>{completedCount}</strong> / {moduleCount} Spires Conquered</>
              ) : (
                'Campaign Progress'
              )}
            </span>
            <span className="domain-xp-reward">
              <Zap size={14} /> +{xpReward} XP
            </span>
          </div>

          <ProgressBar value={progress} tone={tone} height="6px" showPercentage />
        </div>

        {/* Action Button */}
        <div className="domain-card-action">
          <Link to={to} className={`crystal-btn crystal-btn-${tone === 'cyan' ? 'cyan' : 'primary'} small domain-explore-btn`}>
            <span>Explore Realm</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </motion.article>
    </Tilt>
  )
}
