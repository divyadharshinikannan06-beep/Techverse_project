import { motion } from 'framer-motion'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="crystal-state-page">
      <div className="tv-cosmic-bg" aria-hidden="true">
        <div className="tv-cosmic-stars" />
      </div>

      <motion.div
        className="crystal-panel crystal-404-card"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="crystal-state-gem">
          <Compass size={36} className="compass-spin" />
        </div>

        <p className="crystal-eyebrow">
          <span className="spark">✦</span> WAYFINDER ANOMALY 404 <span className="spark">✦</span>
        </p>

        <h1 className="crystal-title">
          LOST BEYOND THE <span className="highlight">CRYSTAL REALMS</span>
        </h1>

        <p className="crystal-state-desc">
          The celestial coordinates you sought do not exist in the charted kingdoms of TechVerse.
          Return to the Citadel to reconnect your ley-lines.
        </p>

        <div className="state-actions-row">
          <Link to="/dashboard" className="crystal-btn crystal-btn-primary">
            <Sparkles size={16} /> Return to Crystal Citadel
          </Link>
          <Link to="/worlds" className="crystal-btn crystal-btn-secondary">
            <Compass size={16} /> Explore Known Realms
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
