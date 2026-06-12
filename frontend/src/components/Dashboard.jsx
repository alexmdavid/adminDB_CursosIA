import './Dashboard.css'

function Dashboard({ docentes, filteredData, page, totalPages, recordsPerPage }) {
  const progressFill = filteredData.length === 0
    ? 0
    : Math.round((Math.min(filteredData.length - (page - 1) * recordsPerPage, recordsPerPage) / recordsPerPage) * 100)

  const countryCounts = filteredData.reduce((acc, d) => {
    const pais = d.pais?.trim() || 'Sin país'
    acc[pais] = (acc[pais] || 0) + 1
    return acc
  }, {})

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const maxCount = topCountries.length > 0 ? topCountries[0][1] : 1

  return (
    <div className="dashboard">
      <div className="cards-row">
        <div className="card-summary">
          <span className="card-label">Total docentes</span>
          <span className="card-value">{docentes.length}</span>
          <span className="card-note">Registros cargados desde la API</span>
        </div>
        <div className="card-summary">
          <span className="card-label">Página actual</span>
          <span className="card-value">{page}</span>
          <span className="card-note">Muestra la página de la tabla activada</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stats-card">
          <span className="stat-title">Distribución por país</span>
          <div className="country-bars">
            {topCountries.length === 0 ? (
              <div className="stat-line">
                <span className="stat-country">Sin datos</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '0%' }}></div></div>
              </div>
            ) : (
              topCountries.map(([pais, cantidad]) => (
                <div className="stat-line" key={pais}>
                  <span className="stat-country">{pais} ({cantidad})</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.round((cantidad / maxCount) * 100)}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="stats-card">
          <span className="stat-title">Actividad de la tabla</span>
          <div className="chart-info">
            <div className="metric-row">
              <span>Registros totales</span>
              <strong>{filteredData.length}</strong>
            </div>
            <div className="metric-row">
              <span>Página actual</span>
              <strong>{page}</strong>
            </div>
            <div className="metric-row">
              <span>Registros por página</span>
              <strong>{recordsPerPage}</strong>
            </div>
            <div className="progress-row">
              <span>Ocupación de la página</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressFill}%` }}></div>
              </div>
              <span className="progress-label">{progressFill}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard