import { Compass } from 'lucide-react'
import NeonButton from './NeonButton'

export default function EmptyState({
  icon: Icon = Compass,
  title = 'THIS REALM IS CURRENTLY QUIET',
  description = 'No activities or records found in this sanctum.',
  actionLabel,
  actionTo,
  onAction,
  actionIcon,
}) {
  return (
    <div className="crystal-state-box">
      <div className="crystal-state-gem">
        <Icon size={32} />
      </div>
      <h3 className="crystal-state-title">{title}</h3>
      <p className="crystal-state-desc">{description}</p>
      {actionLabel && (
        <NeonButton
          variant="primary"
          to={actionTo}
          onClick={onAction}
          icon={actionIcon}
        >
          {actionLabel}
        </NeonButton>
      )}
    </div>
  )
}
