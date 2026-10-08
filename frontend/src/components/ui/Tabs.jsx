import { motion } from 'framer-motion'

export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, badge }]
  activeTab,
  onChange,
  className = '',
  orientation = 'horizontal', // 'horizontal' | 'vertical'
}) {
  return (
    <div
      className={`crystal-tabs-container orientation-${orientation} ${className}`.trim()}
      role="tablist"
    >
      {tabs.map(({ id, label, icon: Icon, badge }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            type="button"
            className={`crystal-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onChange(id)}
          >
            {Icon && <Icon size={16} className="tab-icon" />}
            <span className="tab-label">{label}</span>
            {badge && <span className="tab-badge">{badge}</span>}
            {isActive && (
              <motion.span
                className="tab-active-indicator"
                layoutId="activeTabIndicator"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
