import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Divider,
  IconButton,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fetchEstudianteByCodigo, fetchCatalogos } from 'src/utils/authService';

// ----------------------------------------------------------------------

interface StudentDetailCardProps {
  codigo: string;
  onClose: () => void;
}

interface EstudianteData {
  codigo: string;
  nombre: string;
  tipo_documento_id: number;
  documento: string;
  semestre: string;
  pensum: string;
  ingreso: string;
  estado_matricula_id: number;
  celular?: string | null;
  email_personal?: string | null;
  email_institucional: string;
  colegio_egresado_id: number;
  municipio_nacimiento_id: number;
  promedio?: number | null;
}

export function StudentDetailCard({ codigo, onClose }: StudentDetailCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estudiante, setEstudiante] = useState<EstudianteData | null>(null);
  const [catalogos, setCatalogos] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        const [estudianteData, catalogosData] = await Promise.all([
          fetchEstudianteByCodigo(codigo, token),
          fetchCatalogos(token),
        ]);

        setEstudiante(estudianteData);
        setCatalogos(catalogosData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del estudiante');
      } finally {
        setLoading(false);
      }
    };

    if (codigo) {
      loadData();
    }
  }, [codigo]);

  const calcularNivelRiesgo = (promedio: number | null | undefined): string => {
    if (promedio === null || promedio === undefined) return 'N/A';
    if (promedio >= 0.0 && promedio <= 1.5) return 'ALTO';
    if (promedio >= 1.6 && promedio <= 2.9) return 'MEDIO';
    return 'BAJO';
  };

  const getNivelRiesgoColor = (nivel: string): 'error' | 'warning' | 'success' | 'default' => {
    if (nivel === 'ALTO') return 'error';
    if (nivel === 'MEDIO') return 'warning';
    if (nivel === 'BAJO') return 'success';
    return 'default';
  };

  const getEstadoMatriculaNombre = (id: number): string => {
    if (!catalogos?.estadosMatricula) return 'N/A';
    const estado = catalogos.estadosMatricula.find((e: any) => e.id === id);
    return estado?.nombre || 'N/A';
  };

  const getTipoDocumentoNombre = (id: number): string => {
    if (!catalogos?.tiposDocumento) return 'N/A';
    const tipo = catalogos.tiposDocumento.find((t: any) => t.id === id);
    return tipo?.nombre || 'N/A';
  };

  const getColegioNombre = (id: number): string => {
    if (!catalogos?.colegios) return 'N/A';
    const colegio = catalogos.colegios.find((c: any) => c.id === id);
    return colegio?.nombre || 'N/A';
  };

  const getMunicipioNombre = (id: number): string => {
    if (!catalogos?.municipios) return 'N/A';
    const municipio = catalogos.municipios.find((m: any) => m.id === id);
    return municipio?.nombre || 'N/A';
  };

  if (loading) {
    return (
      <Card sx={{ position: 'relative', mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !estudiante) {
    return (
      <Card sx={{ position: 'relative', mb: 3 }}>
        <CardContent>
          <Alert severity="error">{error || 'No se pudo cargar la información del estudiante'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const nivelRiesgo = calcularNivelRiesgo(estudiante.promedio);
  const estadoMatricula = getEstadoMatriculaNombre(estudiante.estado_matricula_id);
  const isActivo = estadoMatricula.toLowerCase().includes('activo') || estadoMatricula.toLowerCase().includes('activa');

  return (
    <Card
      sx={{
        position: 'relative',
        mb: 3,
        boxShadow: 3,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'common.white',
          p: 3,
          position: 'relative',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {estudiante.nombre.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {estudiante.nombre}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Código: {estudiante.codigo}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:user-bold-duotone" width={24} />
              Información Personal
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Tipo de Documento
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getTipoDocumentoNombre(estudiante.tipo_documento_id)}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Número de Documento
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.documento}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Municipio de Nacimiento
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getMunicipioNombre(estudiante.municipio_nacimiento_id)}
              </Typography>
            </Stack>
          </Grid>

          {/* Información Académica */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Iconify icon="solar:graduation-bold-duotone" width={24} />
              Información Académica
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Semestre
              </Typography>
              <Chip label={estudiante.semestre} color="primary" variant="outlined" />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Pensum
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.pensum}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Año de Ingreso
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.ingreso}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Promedio
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                {estudiante.promedio !== null && estudiante.promedio !== undefined
                  ? estudiante.promedio.toFixed(2)
                  : 'N/A'}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Estado de Matrícula
              </Typography>
              <Label color={isActivo ? 'success' : 'error'} variant="filled">
                {estadoMatricula}
              </Label>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Nivel de Riesgo
              </Typography>
              <Label color={getNivelRiesgoColor(nivelRiesgo)} variant="filled">
                {nivelRiesgo}
              </Label>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Colegio de Egreso
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getColegioNombre(estudiante.colegio_egresado_id)}
              </Typography>
            </Stack>
          </Grid>

          {/* Información de Contacto */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <Iconify icon="solar:phone-bold-duotone" width={24} />
              Información de Contacto
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="solar:phone-bold-duotone" width={16} />
                Celular
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.celular || 'No registrado'}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="solar:letter-bold-duotone" width={16} />
                Email Institucional
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.email_institucional}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify icon="solar:letter-bold-duotone" width={16} />
                Email Personal
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {estudiante.email_personal || 'No registrado'}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
