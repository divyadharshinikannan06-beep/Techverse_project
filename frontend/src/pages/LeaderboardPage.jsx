import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LeaderboardCard from '../components/LeaderboardCard'
import StreakCard from '../components/StreakCard'

export default function LeaderboardPage() {
  const { token } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [streak, setStreak] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/leaderboard?limit=50', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load leaderboard')
        return data
      }),
      fetch('/api/streak', { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load streak')
        return data
      }),
    ])
      .then(([leaderboardData, streakData]) => {
        setLeaderboard(leaderboardData.leaderboard || [])
        setCurrentUser(leaderboardData.currentUser)
        setStreak(streakData.streak)
      })
      .catch((loadError) => setError(loadError.message || 'Unable to load standings'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <main className="social-page">
      <div className="tv-cosmic-bg" aria-hidden="true"><div className="tv-cosmic-stars" /></div>

      <div className="social-page-shell">
        <header className="social-page-header">
          <span className="social-page-crest">
            <Trophy size={26} className="trophy-gem" />
          </span>
          <div>
            <p className="crystal-eyebrow">
              <span className="spark">✦</span> HALL OF CHAMPIONS <span className="spark">✦</span>
            </p>
            <h1 className="crystal-title">CHAMPIONS OF TECHVERSE</h1>
            <p className="crystal-subtitle">
              Honor rolls of the most dedicated adventurers across all crystal realms. Ranked by earned Crystal XP and Royal Relics.
            </p>
          </div>
        </header>

        {error && (
          <div className="crystal-state-box error" role="alert">
            <h3 className="crystal-state-title">CITADEL ARCHIVE ERROR</h3>
            <p className="crystal-state-desc">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="crystal-state-box" role="status">
            <div className="crystal-loading-spinner" />
            <h3 className="crystal-state-title">ENTERING THE CRYSTAL REALM...</h3>
            <p className="crystal-state-desc">Retrieving records from the Hall of Champions.</p>
          </div>
        ) : (
          <div className="leaderboard-page-grid">
            <LeaderboardCard entries={leaderboard} currentUser={currentUser} />
            <StreakCard streak={streak} />
          </div>
        )}
      </div>
    </main>
  )
}
