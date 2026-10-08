import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export default function BattleEnemy({ battle, enemyHp, hit = false }) {
  return (
    <div className="battle-stage">
      <motion.div className={`battle-opponent-card ${hit ? 'hit' : ''}`} animate={hit ? { scale: [1, 1.025, 1] } : undefined} transition={{ duration: .28 }}>
        <span className="battle-opponent-icon"><BrainCircuit size={28} /></span>
        <span className="battle-opponent-label">LIVE CHALLENGE</span>
        <strong>{battle.domain}</strong>
        <small>{enemyHp}% challenge progress remaining</small>
      </motion.div>
    </div>
  )
}
