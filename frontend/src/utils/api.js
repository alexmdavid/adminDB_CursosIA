export const API_BASE = 'https://curso-ia-back-cursos-ia.nsueba.easypanel.host/api/Docentes';
export const RECORDS_PER_PAGE = 15;

export const emptyForm = {
  id: '',
  nombres: '',
  apellidos: '',
  correo: '',
  ciudad: '',
  pais: '',
  telefono: '',
};

export async function fetchDocentes() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Error cargando datos');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createDocente(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar');
  return res.json();
}

export async function updateDocente(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al actualizar');
  return res.json();
}

export async function deleteDocente(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('No se pudo eliminar');
  return res.json();
}