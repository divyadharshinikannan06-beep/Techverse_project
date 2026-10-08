export default function LoadingSkeleton({
  count = 3,
  type = 'card', // 'card' | 'line' | 'avatar'
  className = '',
}) {
  return (
    <div className={`skeleton-container skeleton-${type} ${className}`.trim()}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-item shimmer">
          {type === 'card' && (
            <>
              <div className="skeleton-line title" />
              <div className="skeleton-line subtitle" />
              <div className="skeleton-line text" />
              <div className="skeleton-line button" />
            </>
          )}
        </div>
      ))}
    </div>
  )
}
