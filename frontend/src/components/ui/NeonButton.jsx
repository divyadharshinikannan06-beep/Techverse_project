import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NeonButton({
  children,
  variant = 'primary', // 'primary' | 'cyan' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconRight: IconRight,
  to,
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeClass = size === 'sm' ? 'small' : size === 'lg' ? 'large' : ''
  const variantClass = `crystal-btn-${variant}`
  const combinedClass = `crystal-btn ${variantClass} ${sizeClass} ${className}`.trim()

  const content = (
    <>
      {loading ? (
        <span className="btn-spinner" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon-left" />
      )}
      <span>{children}</span>
      {!loading && IconRight && (
        <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon-right" />
      )}
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClass} {...props}>
        {content}
      </Link>
    )
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClass} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    )
  }

  return (
    <motion.button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      {...props}
    >
      {content}
    </motion.button>
  )
}
