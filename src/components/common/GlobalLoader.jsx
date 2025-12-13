import { useSelector } from 'react-redux'

const GlobalLoader = () => {
  const loading = useSelector((state) => state.ui.loading)

  if (!loading) return null

  return (
    <div className="global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="global-loader__backdrop" />
      <div className="global-loader__content">
        <div className="global-loader__spinner" />
        <p>Processing request...</p>
      </div>
    </div>
  )
}

export default GlobalLoader
