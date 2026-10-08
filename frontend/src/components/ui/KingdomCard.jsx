import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tilt from 'react-parallax-tilt'

export default function KingdomCard({
  to,
  icon: Icon,
  title,
  description,
  tone = 'violet', // 'violet' | 'cyan' | 'indigo' | 'blue' | 'gold'
  tag = '',
}) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.03}
      transitionSpeed={350}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#ffffff"
      glarePosition="all"
      className="tv-feature-tilt-wrap"
    >
      <Link className={`tv-feature-card ${tone}`} to={to}>
        <span className="tv-feature-icon">
          {Icon && <Icon size={22} strokeWidth={2} />}
        </span>
        <span className="tv-feature-copy">
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
        {tag && <span className="tv-feature-tag">{tag}</span>}
        <ArrowRight className="tv-feature-arrow" size={16} />
      </Link>
    </Tilt>
  )
}
