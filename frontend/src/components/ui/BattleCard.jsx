import { motion } from 'framer-motion'
import { BrainCircuit, CheckCircle2, ChevronRight, LockKeyhole, Swords, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import CrystalBadge from './CrystalBadge'

export default function BattleCard({
  battle,
  onChallenge,
  index = 0,
}) {
  const locked = battle.status === 'locked'
  const completed = battle.status === 'completed'

  return (
    <motion.article
      className={`crystal-panel battle-card-box ${battle.status || 'unlocked'}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={!locked && !completed ? { y: -4 } : undefined}
    >
      <div className="battle-card-top-row">
        <div className="battle-enemy-sigil-icon">
          <Swords size={20} />
        </div>
        <CrystalBadge tone="cyan" size="sm">
          {battle.difficulty?.toUpperCase() || 'NORMAL'}
        </CrystalBadge>
      </div>

      <div className="battle-card-order-tag">
        CHALLENGE {String(battle.order || 1).padStart(2, '0')}
      </div>

      <h3 className="battle-card-name">{battle.title || `${battle.domain} Guardian`}</h3>
      <p className="battle-card-description">
        {battle.description || `Face ${battle.questionCount || 5} rapid technical questions to defeat the guardian and earn server XP.`}
      </p>

      <div className="battle-card-meta-row">
        <span>
          <BrainCircuit size={14} /> {battle.questionCount || 5} Questions
        </span>
        <span className="reward-tag">
          <Zap size={14} /> +{battle.xpReward || 100} XP
        </span>
      </div>

      {locked && battle.lockedReason && (
        <p className="battle-lock-reason-text">
          <LockKeyhole size={13} /> {battle.lockedReason}
        </p>
      )}

      <div className="battle-card-action-bar">
        {completed ? (
          <span className="crystal-chip emerald">
            <CheckCircle2 size={14} /> Conquered · +{battle.xpEarned || battle.xpReward || 100} XP
          </span>
        ) : locked ? (
          <button type="button" disabled className="crystal-btn crystal-btn-secondary small disabled">
            <LockKeyhole size={14} /> Sealed
          </button>
        ) : onChallenge ? (
          <button
            type="button"
            onClick={() => onChallenge(battle)}
            className="crystal-btn crystal-btn-primary small"
          >
            <Swords size={14} /> Challenge <ChevronRight size={14} />
          </button>
        ) : (
          <Link className="crystal-btn crystal-btn-primary small" to={`/battle/${battle.id}`}>
            <Swords size={14} /> Challenge <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </motion.article>
  )
}
