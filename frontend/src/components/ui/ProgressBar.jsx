export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = false,
  tone = 'cyan', // 'cyan' | 'violet' | 'gold' | 'emerald'
  height = '8px',
  className = '',
}) {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)))

  return (
    <div className={`crystal-progress-wrapper ${className}`.trim()}>
      {(label || showPercentage) && (
        <div className="crystal-progress-label-row">
          {label && <span className="progress-label">{label}</span>}
          {showPercentage && <strong className="progress-percentage">{percentage}%</strong>}
        </div>
      )}
      <div
        className="crystal-progress-track"
        style={{ height }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`crystal-progress-fill tone-${tone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
