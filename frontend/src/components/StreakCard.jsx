import { Flame, Sparkles } from 'lucide-react'

export default function StreakCard({ streak, compact = false }) {
  const activeDays = new Set(streak?.recentActiveDays || [])
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - (6 - index))
    return date.toISOString().slice(0, 10)
  })
  return <section className={`streak-card tech-panel ${compact ? 'compact' : ''}`}><div className="streak-icon"><Flame size={compact ? 21 : 28} /></div><div className="streak-copy"><p className="panel-kicker">DAILY CONSISTENCY</p><h2>{streak?.currentStreak ?? '—'}{streak ? ' day streak' : ' streak not available'}</h2><p>{streak?.currentStreak ? 'Keep learning to maintain your streak.' : 'Complete a learning activity to start a streak.'}</p></div><div className="streak-longest"><span>BEST</span><strong>{streak?.longestStreak ?? '—'}</strong></div><div className="streak-calendar" aria-label="Recent active days">{dates.map((date) => <span className={activeDays.has(date) ? 'active' : ''} key={date} title={date}><i /></span>)}</div>{!compact && <Sparkles className="streak-spark" size={17} />}</section>
}
