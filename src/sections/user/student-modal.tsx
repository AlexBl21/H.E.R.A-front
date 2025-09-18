import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { fetchCatalogos } from '../../utils/authService';

interface StudentPayload {
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
    promedio: number | string;
}

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentData: StudentPayload) => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<StudentPayload>;
  loading?: boolean;
  error?: string;
}

interface CatalogItem {
  id: number;
  nombre: string;
}

interface Catalogos {
  tiposDocumento: CatalogItem[];
  estadosMatricula: CatalogItem[];
  colegios: CatalogItem[];
  municipios: CatalogItem[];
}

export default function StudentModal({ open, onClose, onSubmit, loading = false, error, mode = 'create', initialData }: StudentModalProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    tipo_documento_id: 0,
    documento: '',
    semestre: '',
    pensum: '',
    ingreso: '',
    estado_matricula_id: 0,
    celular: '',
    email_personal: '',
    email_institucional: '',
    colegio_egresado_id: 0,
    municipio_nacimiento_id: 0,
    promedio: '',
  });

  const [catalogos, setCatalogos] = useState<Catalogos>({
    tiposDocumento: [],
    estadosMatricula: [],
    colegios: [],
    municipios: [],
  });

  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [catalogosError, setCatalogosError] = useState<string | null>(null);

  // Cargar datos iniciales cuando es modo edición
  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        promedio: initialData.promedio !== undefined && initialData.promedio !== null ? String(initialData.promedio) : '',
      } as any));
    }
  }, [open, mode, initialData]);

  // Datos mock como fallback
  const mockCatalogos: Catalogos = useMemo(() => ({
    tiposDocumento: [
      { id: 1, nombre: 'Cédula de Ciudadanía' },
      { id: 2, nombre: 'Tarjeta de Identidad' },
      { id: 3, nombre: 'Cédula de Extranjería' },
      { id: 4, nombre: 'Pasaporte' }
    ],
    estadosMatricula: [
      { id: 1, nombre: 'Activo' },
      { id: 2, nombre: 'Inactivo' },
      { id: 3, nombre: 'Matriculado' },
      { id: 4, nombre: 'No Matriculado' }
    ],
    colegios: [
      { id: 1, nombre: 'Colegio Nacional' },
      { id: 2, nombre: 'Instituto Técnico' },
      { id: 3, nombre: 'Liceo Moderno' },
      { id: 4, nombre: 'Escuela Normal' }
    ],
    municipios: [
      { id: 1, nombre: 'Bogotá' },
      { id: 2, nombre: 'Medellín' },
      { id: 3, nombre: 'Cali' },
      { id: 4, nombre: 'Barranquilla' },
      { id: 5, nombre: 'Cartagena' }
    ]
  }), []);

  const loadCatalogos = useCallback(async () => {
    setLoadingCatalogos(true);
    setCatalogosError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', token ? 'Sí' : 'No');
      if (token) {
        console.log('Intentando cargar catálogos...');
        const data = await fetchCatalogos(token);
        console.log('Catálogos cargados:', data);
        setCatalogos(data);
      } else {
        console.log('No hay token, usando datos mock');
        // Si no hay token, usar datos mock
        setCatalogos(mockCatalogos);
      }
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      setCatalogosError(`Error al cargar catálogos: ${err instanceof Error ? err.message : 'Error desconocido'}. Usando datos de prueba.`);
      // Usar datos mock como fallback
      setCatalogos(mockCatalogos);
    } finally {
      setLoadingCatalogos(false);
    }
  }, [mockCatalogos]);

  useEffect(() => {
    if (open) {
      loadCatalogos();
    }
  }, [open, loadCatalogos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit ejecutado');
    console.log('Datos del formulario:', formData);
    
    // Validaciones
    if (!formData.codigo || !formData.nombre || !formData.documento || 
        !formData.semestre || !formData.pensum || !formData.ingreso ||
        !formData.email_institucional || !formData.promedio) {
      console.log('Validación fallida: campos requeridos vacíos');
      return;
    }

    if (formData.tipo_documento_id === 0 || formData.estado_matricula_id === 0 ||
        formData.colegio_egresado_id === 0 || formData.municipio_nacimiento_id === 0) {
      console.log('Validación fallida: selecciones de catálogo no válidas');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_institucional)) {
      console.log('Validación fallida: email institucional inválido');
      return;
    }

    // Validar promedio (0-5)
    const promedioNum = parseFloat(formData.promedio as string);
    if (Number.isNaN(promedioNum) || promedioNum < 0 || promedioNum > 5) {
      console.log('Validación fallida: promedio fuera de rango');
      return;
    }

    console.log('Todas las validaciones pasaron, llamando onSubmit');
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      codigo: '',
      nombre: '',
      tipo_documento_id: 0,
      documento: '',
      semestre: '',
      pensum: '',
      ingreso: '',
      estado_matricula_id: 0,
      celular: '',
      email_personal: '',
      email_institucional: '',
      colegio_egresado_id: 0,
      municipio_nacimiento_id: 0,
      promedio: '',
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Editar Estudiante' : 'Registrar Nuevo Estudiante'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {catalogosError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {catalogosError}
            </Alert>
          )}
          
          {loadingCatalogos ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {/* Primera fila */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Código del Estudiante"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  required
                  fullWidth
                  disabled={mode === 'edit'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre Completo"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>

              {/* Segunda fila */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Documento</InputLabel>
                  <Select
                    value={formData.tipo_documento_id}
                    onChange={(e) => handleInputChange('tipo_documento_id', e.target.value)}
                    label="Tipo de Documento"
                    disabled={mode === 'edit'}
                  >
                    {catalogos.tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Documento"
                  value={formData.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  required
                  fullWidth
                  disabled={mode === 'edit'}
                />
              </Grid>

              {/* Tercera fila */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Semestre"
                  value={formData.semestre}
                  onChange={(e) => handleInputChange('semestre', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pensum"
                  value={formData.pensum}
                  onChange={(e) => handleInputChange('pensum', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>

              {/* Cuarta fila */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Año de Ingreso"
                  value={formData.ingreso}
                  onChange={(e) => handleInputChange('ingreso', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Estado de Matrícula</InputLabel>
                  <Select
                    value={formData.estado_matricula_id}
                    onChange={(e) => handleInputChange('estado_matricula_id', e.target.value)}
                    label="Estado de Matrícula"
                  >
                    {catalogos.estadosMatricula.map((estado) => (
                      <MenuItem key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Quinta fila */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Personal"
                  type="email"
                  value={formData.email_personal}
                  onChange={(e) => handleInputChange('email_personal', e.target.value)}
                  fullWidth
                />
              </Grid>

              {/* Sexta fila */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Institucional"
                  type="email"
                  value={formData.email_institucional}
                  onChange={(e) => handleInputChange('email_institucional', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Promedio (0-5)"
                  type="number"
                  value={formData.promedio || ''}
                  onChange={(e) => handleInputChange('promedio', e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                  fullWidth
                  inputProps={{ min: 0, max: 5, step: 0.1 }}
                />
              </Grid>

              {/* Séptima fila */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Colegio Egresado</InputLabel>
                  <Select
                    value={formData.colegio_egresado_id}
                    onChange={(e) => handleInputChange('colegio_egresado_id', e.target.value)}
                    label="Colegio Egresado"
                  >
                    {catalogos.colegios.map((colegio) => (
                      <MenuItem key={colegio.id} value={colegio.id}>
                        {colegio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Municipio de Nacimiento</InputLabel>
                  <Select
                    value={formData.municipio_nacimiento_id}
                    onChange={(e) => handleInputChange('municipio_nacimiento_id', e.target.value)}
                    label="Municipio de Nacimiento"
                  >
                    {catalogos.municipios.map((municipio) => (
                      <MenuItem key={municipio.id} value={municipio.id}>
                        {municipio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || loadingCatalogos}
          >
            {loading ? <CircularProgress size={20} /> : (mode === 'edit' ? 'Guardar cambios' : 'Registrar Estudiante')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}