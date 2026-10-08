import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  glow = 'none', // 'cyan' | 'violet' | 'gold' | 'emerald' | 'none'
  hover = true,
  onClick,
  as: Component = 'div',
  ...props
}) {
  const glowClass = glow !== 'none' ? `glow-${glow}` : ''
  const hoverClass = hover ? 'interactive hover-lift' : ''

  const MotionComponent = motion[Component] || motion.div

  return (
    <MotionComponent
      className={`crystal-panel ${glowClass} ${hoverClass} ${className}`.trim()}
      onClick={onClick}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}
