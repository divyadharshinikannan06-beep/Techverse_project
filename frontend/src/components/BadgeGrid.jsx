import { Link } from 'react-router-dom'
import BadgeCard from './BadgeCard'

export default function BadgeGrid({ badges = [], limit, preview = false }) {
  const visibleBadges = limit ? badges.slice(0, limit) : badges
  return <div className={`badge-grid ${preview ? 'preview' : ''}`}>{visibleBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} compact={preview} />)}{preview && badges.length > visibleBadges.length && <Link to="/badges" className="social-see-all">View all badges</Link>}</div>
}
