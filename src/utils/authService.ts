const BACKEND_URL = import.meta.env.VITE_URL_BACKEND || 'http://localhost:8000';

export async function login(username: string, password: string) {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function uploadExcel(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/estudiantes/cargar-excel/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al cargar el archivo');
  }

  return response.json();
}

export async function fetchEstudiantes(token: string, filters?: {
  nombre?: string;
  semestre?: string;
  nivel_riesgo?: string;
}) {
  // Construir la URL con los filtros
  let url = `${BACKEND_URL}/estudiantes/mis-estudiantes/?skip=0&limit=100`;
  
  if (filters) {
    if (filters.nombre) url += `&nombre=${encodeURIComponent(filters.nombre)}`;
    if (filters.semestre) url += `&semestre=${encodeURIComponent(filters.semestre)}`;
    if (filters.nivel_riesgo) url += `&nivel_riesgo=${encodeURIComponent(filters.nivel_riesgo)}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener estudiantes');
  }

  return response.json();
} 