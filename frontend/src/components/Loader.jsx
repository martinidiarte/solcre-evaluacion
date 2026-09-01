function Loader({ label = 'Cargando' }) {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default Loader
