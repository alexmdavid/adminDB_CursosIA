import './StatusMessage.css'

function StatusMessage({ text, type, visible, onClose }) {
  if (!visible) return null

  return (
    <div className={`status-message show ${type}`}>
      <span>{text}</span>
      <button type="button" onClick={onClose}>Cerrar</button>
    </div>
  )
}

export default StatusMessage