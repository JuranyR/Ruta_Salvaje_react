import '../styles/AdminGestion.css'

export default function AdminConfirmDialog({ title, message, confirmLabel = 'Confirmar', busy = false, onCancel, onConfirm }) {
  return (
    <div className="admin-confirm-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title">
        <span className="admin-confirm-icon" aria-hidden="true">!</span>
        <h2 id="admin-confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="admin-confirm-actions">
          <button type="button" className="admin-confirm-back" disabled={busy} onClick={onCancel}>Volver</button>
          <button type="button" className="admin-confirm-submit" disabled={busy} onClick={onConfirm}>
            {busy ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
