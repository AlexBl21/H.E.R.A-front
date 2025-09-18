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

export async function deleteEstudiante(codigoEstudiante: string, token: string) {
  const response = await fetch(`${BACKEND_URL}/estudiantes/${codigoEstudiante}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al eliminar estudiante');
  }

  return response.json();
}

// Obtener detalle de estudiante por código
export async function fetchEstudianteByCodigo(codigoEstudiante: string, token: string) {
  const response = await fetch(`${BACKEND_URL}/estudiantes/${codigoEstudiante}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al obtener estudiante');
  }

  return response.json();
}

// Actualizar estudiante (PUT)
export async function updateEstudiante(
  codigoEstudiante: string,
  updates: {
    codigo?: string;
    nombre?: string;
    tipo_documento_id?: number;
    documento?: string;
    semestre?: string;
    pensum?: string;
    ingreso?: string;
    estado_matricula_id?: number;
    celular?: string | null;
    email_personal?: string | null;
    email_institucional?: string;
    colegio_egresado_id?: number;
    municipio_nacimiento_id?: number;
    promedio?: number | null;
  },
  token: string
) {
  const response = await fetch(`${BACKEND_URL}/estudiantes/${codigoEstudiante}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error al actualizar estudiante');
  }

  return response.json();
}

// Función para cargar catálogos
export async function fetchCatalogos(token: string) {
  console.log('fetchCatalogos llamado con token:', token ? 'Presente' : 'Ausente');
  
  const fetchOrThrow = async (url: string) => {
    console.log(`Haciendo petición a: ${url}`);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log(`Respuesta de ${url}:`, res.status, res.statusText);
    
    if (!res.ok) {
      let detail: string | undefined;
      try {
        const data: unknown = await res.json();
        console.log(`Error response de ${url}:`, data);
        if (data && typeof data === 'object') {
          const maybeDetail = (data as Record<string, unknown>).detail;
          const maybeMessage = (data as Record<string, unknown>).message;
          if (typeof maybeDetail === 'string') detail = maybeDetail;
          else if (typeof maybeMessage === 'string') detail = maybeMessage;
        }
      } catch (_) {
        // ignore json parse error
      }
      throw new Error(detail ?? `Error al obtener ${url} (${res.status})`);
    }
    const result = await res.json();
    console.log(`Datos obtenidos de ${url}:`, result);
    return result;
  };

  const [tiposDocumento, estadosMatricula, colegios, municipios] = await Promise.all([
    fetchOrThrow(`${BACKEND_URL}/tipos-documento/`),
    fetchOrThrow(`${BACKEND_URL}/estados-matricula/`),
    fetchOrThrow(`${BACKEND_URL}/colegios/`),
    fetchOrThrow(`${BACKEND_URL}/municipios/`)
  ]);

  return {
    tiposDocumento,
    estadosMatricula,
    colegios,
    municipios
  };
}

// Función para crear estudiante
export async function createEstudiante(estudianteData: {
  codigo: string;
  nombre: string;
  tipo_documento_id: number;
  documento: string;
  semestre: string;
  pensum: string;
  ingreso: string;
  estado_matricula_id: number;
  celular?: string;
  email_personal?: string;
  email_institucional: string;
  colegio_egresado_id: number;
  municipio_nacimiento_id: number;
  promedio: number;
}, token: string) {
  const response = await fetch(`${BACKEND_URL}/estudiantes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(estudianteData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al crear estudiante');
  }

  return response.json();
} 