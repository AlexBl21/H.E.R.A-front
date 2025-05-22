export async function login(username: string, password: string) {
  const response = await fetch('http://localhost:8000/auth/login', {
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

  const response = await fetch('http://localhost:8000/estudiantes/cargar-excel/', {
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

export async function fetchEstudiantes(token: string) {
  const response = await fetch('http://localhost:8000/estudiantes/mis-estudiantes/?skip=0&limit=100', {
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