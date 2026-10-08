import { motion } from 'framer-motion'
import { Award, Crown, Medal, Trophy, Sparkles, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const rankIcons = { 1: Trophy, 2: Medal, 3: Award }

export default function LeaderboardCard({ entries = [], currentUser, preview = false }) {
  const topThree = !preview ? entries.slice(0, 3) : []
  const remainingEntries = !preview ? entries.slice(3) : entries.slice(0, 5)

  return (
    <section className={`crystal-panel leaderboard-card ${preview ? 'preview' : ''}`}>
      <div className="social-panel-heading">
        <div>
          <p className="crystal-eyebrow">
            <span className="spark">✦</span> HALL OF CHAMPIONS <span className="spark">✦</span>
          </p>
          <h2 className="crystal-title" style={{ fontSize: '1.8rem', margin: 0 }}>
            Champions of TechVerse
          </h2>
        </div>
        <Trophy size={22} className="trophy-gold-gem" />
      </div>

      {currentUser && (
        <motion.div
          className="crystal-panel current-rank-strip"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-rank-badge">
            <span>Your Standing</span>
            <strong>#{currentUser.rank || '—'}</strong>
          </div>
          <div className="user-rank-stats">
            <span>
              <strong>{currentUser.xp.toLocaleString()}</strong> Crystal XP
            </span>
            <span>
              <strong>{currentUser.badgeCount}</strong> Royal Relics
            </span>
          </div>
        </motion.div>
      )}

      {/* TOP 3 CRYSTAL PEDESTALS (Full View Only) */}
      {!preview && topThree.length > 0 && (
        <div className="pedestal-stage" aria-label="Top 3 Champions">
          {/* Rank 2 (Left) */}
          {topThree[1] && (
            <motion.div
              className="pedestal-column rank-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="pedestal-avatar-wrap">
                <div className="pedestal-avatar">
                  {topThree[1].name.slice(0, 1).toUpperCase()}
                </div>
              </div>
              <strong className="pedestal-name">{topThree[1].name}</strong>
              <small className="pedestal-level">LVL {topThree[1].level}</small>
              <div className="pedestal-base">
                <span className="pedestal-rank-num">2</span>
                <span className="pedestal-xp">{topThree[1].xp.toLocaleString()} XP</span>
              </div>
            </motion.div>
          )}

          {/* Rank 1 (Center - Highest) */}
          {topThree[0] && (
            <motion.div
              className="pedestal-column rank-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="pedestal-avatar-wrap">
                <Crown size={22} className="pedestal-crown" />
                <div className="pedestal-avatar">
                  {topThree[0].name.slice(0, 1).toUpperCase()}
                </div>
              </div>
              <strong className="pedestal-name">{topThree[0].name}</strong>
              <small className="pedestal-level">LVL {topThree[0].level}</small>
              <div className="pedestal-base">
                <span className="pedestal-rank-num">1</span>
                <span className="pedestal-xp">{topThree[0].xp.toLocaleString()} XP</span>
              </div>
            </motion.div>
          )}

          {/* Rank 3 (Right) */}
          {topThree[2] && (
            <motion.div
              className="pedestal-column rank-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="pedestal-avatar-wrap">
                <div className="pedestal-avatar">
                  {topThree[2].name.slice(0, 1).toUpperCase()}
                </div>
              </div>
              <strong className="pedestal-name">{topThree[2].name}</strong>
              <small className="pedestal-level">LVL {topThree[2].level}</small>
              <div className="pedestal-base">
                <span className="pedestal-rank-num">3</span>
                <span className="pedestal-xp">{topThree[2].xp.toLocaleString()} XP</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* OTHER CHAMPIONS / PREVIEW LIST */}
      <div className="leaderboard-list">
        {remainingEntries.map((entry, index) => {
          const Icon = rankIcons[entry.rank]
          const isCurrentUser = currentUser?.rank === entry.rank

          return (
            <motion.div
              className={`crystal-panel leaderboard-row ${isCurrentUser ? 'current-player' : ''}`}
              key={`${entry.rank}-${entry.name}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.01, x: 4 }}
            >
              <span className={`leaderboard-rank rank-${entry.rank}`}>
                {Icon ? <Icon size={entry.rank === 1 ? 18 : 15} /> : `#${entry.rank}`}
              </span>

              <div className="leaderboard-name">
                <strong>{entry.name}</strong>
                <small>Level {entry.level} · {entry.badgeCount} Relics</small>
              </div>

              <b className="rank-xp-val">
                {entry.xp.toLocaleString()} <small>XP</small>
              </b>
            </motion.div>
          )
        })}
      </div>

      {preview && (
        <Link to="/leaderboard" className="crystal-btn crystal-btn-secondary small social-see-all">
          View Full Hall of Champions
        </Link>
      )}
    </section>
  )
}
