import { AlertTriangle, RefreshCw } from 'lucide-react'
import NeonButton from './NeonButton'

export default function ErrorState({
  title = 'COMMUNICATION ANOMALY',
  message = 'A disturbance was detected across the realm ley lines.',
  onRetry,
}) {
  return (
    <div className="crystal-state-box error" role="alert">
      <div className="crystal-state-gem error">
        <AlertTriangle size={30} />
      </div>
      <h3 className="crystal-state-title">{title}</h3>
      <p className="crystal-state-desc">{message}</p>
      {onRetry && (
        <NeonButton
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Reconnect Conduit
        </NeonButton>
      )}
    </div>
  )
}
