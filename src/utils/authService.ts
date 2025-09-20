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

export function logout() {
  // Eliminar el token del localStorage
  localStorage.removeItem('token');
  
  // Redirigir al usuario a la página de login
  window.location.href = '/sign-in';
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
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
  console.log('Datos del estudiante a enviar:', estudianteData);
  
  // Crear el payload exactamente como lo espera el backend
  const payload = {
    codigo: estudianteData.codigo,
    nombre: estudianteData.nombre,
    tipo_documento_id: estudianteData.tipo_documento_id,
    documento: estudianteData.documento,
    semestre: estudianteData.semestre,
    pensum: estudianteData.pensum,
    ingreso: estudianteData.ingreso,
    estado_matricula_id: estudianteData.estado_matricula_id,
    celular: estudianteData.celular || null,
    email_personal: estudianteData.email_personal || null,
    email_institucional: estudianteData.email_institucional,
    colegio_egresado_id: estudianteData.colegio_egresado_id,
    municipio_nacimiento_id: estudianteData.municipio_nacimiento_id,
    promedio: estudianteData.promedio
  };
  
  console.log('Payload a enviar:', payload);
  
  try {
    const response = await fetch(`${BACKEND_URL}/estudiantes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'Error al crear estudiante';
      try {
        const error = await response.json();
        console.log('Error del servidor:', error);
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        console.log('Error al parsear respuesta:', e);
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.log('Error en la petición:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Error de conexión con el servidor. Verifica que el backend esté ejecutándose.');
    }
    throw error;
  }
}

// Tipos para las estadísticas
export type TipoEstadistica = 'promedio' | 'colegio' | 'municipio' | 'nivel_riesgo' | 'semestre';
export type TipoDiagrama = 'barras' | 'torta' | 'lineas';

export interface EstadisticaItem {
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadisticaPromedio {
  promedio_general: number;
  distribucion_niveles: EstadisticaItem[];
  rango_promedios: Record<string, number>;
}

export interface EstadisticaGeneral {
  total_estudiantes: number;
  items: EstadisticaItem[];
}

export interface EstadisticasResponse {
  tipo: TipoEstadistica;
  datos: EstadisticaPromedio | EstadisticaGeneral;
}

// Función para obtener estadísticas
export async function fetchEstadisticas(
  tipo: TipoEstadistica,
  token: string
): Promise<EstadisticasResponse> {
  const response = await fetch(`${BACKEND_URL}/estudiantes/estadisticas/?tipo=${tipo}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener estadísticas');
  }

  return response.json();
}

// Función para generar diagrama
export async function fetchDiagrama(
  tipoEstadistica: TipoEstadistica,
  tipoDiagrama: TipoDiagrama,
  token: string
) {
  const response = await fetch(
    `${BACKEND_URL}/estudiantes/diagramas/?tipo_estadistica=${tipoEstadistica}&tipo_diagrama=${tipoDiagrama}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al generar diagrama');
  }

  return response.json();
} 