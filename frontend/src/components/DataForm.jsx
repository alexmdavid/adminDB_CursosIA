import './DataForm.css'

function DataForm({ formData, editing, invalidFields, onFieldChange, onSubmit, onClear }) {
  return (
    <div className="form-card">
      <p className="form-note">{editing ? 'Editar registro' : 'Nuevo registro'}</p>
      <form className="grid-form" onSubmit={onSubmit}>
        <input type="hidden" value={formData.id} readOnly />
        <div>
          <input
            type="text"
            value={formData.nombres}
            onChange={(e) => onFieldChange('nombres', e.target.value)}
            placeholder="Nombres"
            className={invalidFields.nombres ? 'invalid' : ''}
          />
        </div>
        <div>
          <input
            type="text"
            value={formData.apellidos}
            onChange={(e) => onFieldChange('apellidos', e.target.value)}
            placeholder="Apellidos"
            className={invalidFields.apellidos ? 'invalid' : ''}
          />
        </div>
        <div>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => onFieldChange('correo', e.target.value)}
            placeholder="Correo electrónico"
            className={invalidFields.correo ? 'invalid' : ''}
          />
        </div>
        <div>
          <input
            type="text"
            value={formData.ciudad}
            onChange={(e) => onFieldChange('ciudad', e.target.value)}
            placeholder="Ciudad"
            className={invalidFields.ciudad ? 'invalid' : ''}
          />
        </div>
        <div>
          <input
            type="text"
            value={formData.pais}
            onChange={(e) => onFieldChange('pais', e.target.value)}
            placeholder="País"
            className={invalidFields.pais ? 'invalid' : ''}
          />
        </div>
        <div>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => onFieldChange('telefono', e.target.value)}
            placeholder="WhatsApp / Teléfono"
            className={invalidFields.telefono ? 'invalid' : ''}
          />
        </div>
        <div className="actions-row">
          <button type="button" className="btn-small secondary" onClick={onClear}>
            Limpiar
          </button>
          <button type="submit" className="btn-submit">
            {editing ? 'Actualizar Registro' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DataForm