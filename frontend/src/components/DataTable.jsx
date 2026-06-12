import Pagination from './Pagination'
import './DataTable.css'

function DataTable({
  data,
  loading,
  search,
  onSearchChange,
  country,
  onCountryChange,
  countries,
  sortColumn,
  sortDirection,
  onSort,
  page,
  totalPages,
  onPageChange,
  exportFormat,
  onExportFormatChange,
  onExport,
  onNewRecord,
  onEdit,
  onDelete,
}) {
  function headerClasses(col) {
    let cls = 'sort-header'
    if (sortColumn === col) {
      cls += ` sorted ${sortDirection === 1 ? 'asc' : 'desc'}`
    }
    return cls
  }

  return (
    <div className="panel-section">
      <span className="section-title">Listado de personas</span>

      {/* Controls */}
      <div className="controls-row">
        <div className="controls-left">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, correo o país..."
          />
          <select value={country} onChange={(e) => onCountryChange(e.target.value)}>
            <option value="all">Todos los países</option>
            {countries.map((pais) => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>
        <div className="table-actions">
          <select
            className="btn-small secondary"
            value={exportFormat}
            onChange={(e) => onExportFormatChange(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="xls">XLS</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
          </select>
          <button type="button" className="btn-small secondary" onClick={onExport}>
            Exportar
          </button>
          <button type="button" className="btn-small primary" onClick={onNewRecord}>
            Nuevo registro
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className={`loading-overlay ${loading ? 'show' : ''}`}>
          <div className="loading-spinner"></div>
        </div>
        <table>
          <thead>
            <tr>
              <th><span className={headerClasses('id')} onClick={() => onSort('id')}>ID</span></th>
              <th><span className={headerClasses('nombres')} onClick={() => onSort('nombres')}>Nombre</span></th>
              <th><span className={headerClasses('apellidos')} onClick={() => onSort('apellidos')}>Apellidos</span></th>
              <th><span className={headerClasses('correo')} onClick={() => onSort('correo')}>Correo</span></th>
              <th><span className={headerClasses('ciudad')} onClick={() => onSort('ciudad')}>Ciudad</span></th>
              <th><span className={headerClasses('pais')} onClick={() => onSort('pais')}>País</span></th>
              <th><span className={headerClasses('telefono')} onClick={() => onSort('telefono')}>Tel</span></th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr className="no-data-row">
                <td colSpan="8">No hay registros que coincidan con los filtros.</td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.id}>
                  <td data-label="ID"><strong>{d.id}</strong></td>
                  <td data-label="Nombre">{d.nombres}</td>
                  <td data-label="Apellidos">{d.apellidos}</td>
                  <td data-label="Correo">{d.correo}</td>
                  <td data-label="Ciudad">{d.ciudad}</td>
                  <td data-label="País">{d.pais}</td>
                  <td data-label="Tel">{d.telefono || 'N/A'}</td>
                  <td data-label="Acciones">
                    <button type="button" className="btn-action edit" onClick={() => onEdit(d)} title="Editar">✎</button>
                    <button type="button" className="btn-action delete" onClick={() => onDelete(d.id)} title="Eliminar">✖</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}

export default DataTable