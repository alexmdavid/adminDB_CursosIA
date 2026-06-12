import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { clearToken } from '../utils/auth'
import { fetchDocentes, createDocente, updateDocente, deleteDocente, emptyForm, RECORDS_PER_PAGE } from '../utils/api'
import StatusMessage from './StatusMessage'
import Dashboard from './Dashboard'
import DataTable from './DataTable'
import DataForm from './DataForm'
import './AdminPanel.css'

function AdminPanel({ onLogout }) {
  const [docentes, setDocentes] = useState([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('all')
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('id')
  const [sortDirection, setSortDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({
    text: 'Bienvenido, los datos se actualizarán automáticamente.',
    type: 'success',
    visible: true,
  })
  const [formData, setFormData] = useState({ ...emptyForm })
  const [editing, setEditing] = useState(false)
  const [invalidFields, setInvalidFields] = useState({})
  const [exportFormat, setExportFormat] = useState('csv')
  const timerRef = useRef(null)
  const formRef = useRef(null)

  // Derived data
  const countries = useMemo(() => {
    return [...new Set(docentes.map((d) => d.pais?.trim() || 'Sin país'))].sort((a, b) =>
      a.localeCompare(b, 'es', { numeric: true })
    )
  }, [docentes])

  const filteredData = useMemo(() => {
    return docentes.filter((d) => {
      const text = `${d.nombres} ${d.apellidos} ${d.correo} ${d.ciudad} ${d.pais}`.toLowerCase()
      const query = search.toLowerCase()
      const matchesSearch = !query || text.includes(query)
      const matchesCountry = country === 'all' || d.pais?.trim() === country
      return matchesSearch && matchesCountry
    })
  }, [docentes, search, country])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const va = a[sortColumn] || ''
      const vb = b[sortColumn] || ''
      if (sortColumn === 'id') {
        return sortDirection * (Number(va) - Number(vb))
      }
      return sortDirection * String(va).localeCompare(String(vb), 'es', { numeric: true })
    })
  }, [filteredData, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / RECORDS_PER_PAGE))
  const currentPageData = sortedData.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE)

  // Show message helper
  const showMessage = useCallback((text, type = 'success') => {
    clearTimeout(timerRef.current)
    setMessage({ text, type, visible: true })
    timerRef.current = setTimeout(() => setMessage((prev) => ({ ...prev, visible: false })), 4000)
  }, [])

  // Load data
  const cargarDocentes = useCallback(() => {
    setLoading(true)
    fetchDocentes()
      .then((data) => {
        setDocentes(data)
        showMessage('Datos cargados correctamente.', 'success')
      })
      .catch(() => showMessage('Error cargando datos de la API.', 'error'))
      .finally(() => setLoading(false))
  }, [showMessage])

  useEffect(() => {
    cargarDocentes()
    return () => clearTimeout(timerRef.current)
  }, [cargarDocentes])

  useEffect(() => {
    setPage(1)
  }, [search, country])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  // Form handlers
  function validateForm() {
    const errors = {}
    if (!formData.nombres.trim()) errors.nombres = true
    if (!formData.apellidos.trim()) errors.apellidos = true
    if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) errors.correo = true
    if (!formData.ciudad.trim()) errors.ciudad = true
    if (!formData.pais.trim()) errors.pais = true
    if (formData.telefono.trim() && !/^[0-9+()\-\.\s]*$/.test(formData.telefono.trim())) errors.telefono = true
    setInvalidFields(errors)
    if (Object.keys(errors).length) {
      showMessage('Revisa los campos en rojo antes de guardar.', 'error')
      return false
    }
    return true
  }

  function resetForm() {
    setFormData({ ...emptyForm })
    setEditing(false)
    setInvalidFields({})
  }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection((prev) => prev * -1)
    } else {
      setSortColumn(column)
      setSortDirection(1)
    }
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      correo: formData.correo.trim(),
      ciudad: formData.ciudad.trim(),
      pais: formData.pais.trim(),
      telefono: formData.telefono.trim() || '000',
      institucion: 'N/A',
      cargo: 'N/A',
      areaEnsenanza: 'N/A',
      nivelEducativo: 'N/A',
      aceptaComunicaciones: true,
    }

    setLoading(true)
    const action = formData.id
      ? updateDocente(formData.id, payload)
      : createDocente(payload)

    action
      .then(() => {
        showMessage(formData.id ? 'Registro actualizado correctamente.' : 'Registro guardado correctamente.', 'success')
        resetForm()
        cargarDocentes()
      })
      .catch(() => showMessage('Error al guardar el registro.', 'error'))
      .finally(() => setLoading(false))
  }

  function handleEdit(docente) {
    setFormData({ ...docente, telefono: docente.telefono || '' })
    setEditing(true)
    showMessage('Cargando datos del registro para editar.', 'success')
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleDelete(id) {
    if (!window.confirm('¿Eliminar este registro?')) return
    setLoading(true)
    deleteDocente(id)
      .then(() => {
        showMessage('Registro eliminado.', 'success')
        cargarDocentes()
      })
      .catch(() => showMessage('No se pudo eliminar el registro.', 'error'))
      .finally(() => setLoading(false))
  }

  function handleExport() {
    const data = sortedData
    const headers = ['ID', 'Nombre', 'Apellidos', 'Correo', 'Ciudad', 'País', 'Teléfono']
    const rows = data.map((d) => [d.id, d.nombres, d.apellidos, d.correo, d.ciudad, d.pais, d.telefono || ''])

    if (exportFormat === 'csv') {
      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'personas.csv'
      link.click()
      URL.revokeObjectURL(link.href)
      showMessage('Exportado CSV correctamente.', 'success')
      return
    }

    if (exportFormat === 'xls') {
      import('xlsx').then((XLSX) => {
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Personas')
        XLSX.writeFile(wb, 'personas.xlsx')
        showMessage('Exportado XLS correctamente.', 'success')
      })
      return
    }

    if (exportFormat === 'pdf') {
      import('jspdf').then(({ jsPDF }) => {
        import('jspdf-autotable').then(() => {
          const doc = new jsPDF()
          doc.text('Listado de Personas', 20, 20)
          doc.autoTable({ head: [headers], body: rows, startY: 30 })
          doc.save('personas.pdf')
          showMessage('Exportado PDF correctamente.', 'success')
        })
      })
      return
    }

    if (exportFormat === 'word') {
      import('docx').then(({ Document, Packer, Paragraph, Table, TableCell, TableRow }) => {
        const tableRows = [
          new TableRow({ children: headers.map((h) => new TableCell({ children: [new Paragraph(h)] })) }),
          ...rows.map(
            (row) => new TableRow({ children: row.map((cell) => new TableCell({ children: [new Paragraph(String(cell))] })) })
          ),
        ]
        const table = new Table({ rows: tableRows })
        const doc = new Document({ sections: [{ children: [new Paragraph('Listado de Personas'), table] }] })
        Packer.toBlob(doc)
          .then((blob) => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = 'personas.docx'
            link.click()
            URL.revokeObjectURL(link.href)
            showMessage('Exportado Word correctamente.', 'success')
          })
          .catch(() => showMessage('Error al exportar Word.', 'error'))
      })
    }
  }

  function handleNewRecord() {
    resetForm()
    showMessage('Formulario listo para nuevo registro.', 'success')
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleClearForm() {
    resetForm()
    showMessage('Campos limpiados.', 'success')
  }

  function handleLogout() {
    clearToken()
    onLogout()
  }

  const ultimaActualizacion = new Date().toLocaleString('es-ES', { hour12: false })

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p className="subtext">Accede y gestiona los registros de docentes con tu paleta de colores.</p>
        </div>
        <div className="header-actions">
          <div className="update-widget">
            <span className="update-label">Última actualización</span>
            <span className="update-value">{ultimaActualizacion}</span>
            <span className="update-note">Fecha y hora de la carga</span>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            🚪 Cerrar sesión
          </button>
        </div>
      </div>

      {/* Status Message */}
      <StatusMessage
        text={message.text}
        type={message.type}
        visible={message.visible}
        onClose={() => setMessage((prev) => ({ ...prev, visible: false }))}
      />

      {/* Dashboard Stats */}
      <Dashboard
        docentes={docentes}
        filteredData={filteredData}
        page={page}
        totalPages={totalPages}
        recordsPerPage={RECORDS_PER_PAGE}
      />

      {/* Data Table */}
      <DataTable
        data={currentPageData}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        country={country}
        onCountryChange={setCountry}
        countries={countries}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        onExport={handleExport}
        onNewRecord={handleNewRecord}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form */}
      <div ref={formRef}>
        <DataForm
          formData={formData}
          editing={editing}
          invalidFields={invalidFields}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onClear={handleClearForm}
        />
      </div>
    </div>
  )
}

export default AdminPanel