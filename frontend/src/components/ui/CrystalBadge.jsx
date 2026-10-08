export default function CrystalBadge({
  children,
  tone = 'cyan', // 'cyan' | 'violet' | 'gold' | 'emerald' | 'ruby'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  className = '',
}) {
  const sizeClass = size === 'sm' ? 'small' : ''
  return (
    <span className={`crystal-chip ${tone} ${sizeClass} ${className}`.trim()}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} />}
      <span>{children}</span>
    </span>
  )
}
