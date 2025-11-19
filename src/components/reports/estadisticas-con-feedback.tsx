import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import {
  fetchEstadisticasConFeedback,
  fetchDiagrama,
  generarFeedback,
  type TipoEstadistica,
  type TipoDiagrama,
  type EstadisticasConFeedbackResponse,
} from '../../utils/authService';

// ----------------------------------------------------------------------

interface EstadisticasConFeedbackProps {
  token: string;
  title?: string;
  height?: number;
}

export function EstadisticasConFeedback({
  token,
  title = 'Estadísticas con Retroalimentación IA',
  height = 400,
}: EstadisticasConFeedbackProps) {
  const theme = useTheme();
  const [tipoEstadistica, setTipoEstadistica] = useState<TipoEstadistica>('promedio');
  const [tipoDiagrama, setTipoDiagrama] = useState<TipoDiagrama>('barras');
  const [data, setData] = useState<EstadisticasConFeedbackResponse | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDiagrama, setLoadingDiagrama] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas con feedback
  const loadEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const estadisticasData = await fetchEstadisticasConFeedback(
        tipoEstadistica,
        token,
        tipoDiagrama
      );
      
      setData(estadisticasData);
    } catch (err: any) {
      console.error('[EstadisticasConFeedback] Error al cargar estadísticas:', err);
      setError(err.message || 'Error desconocido al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, [tipoEstadistica, tipoDiagrama, token]);

  // Cargar diagrama
  const loadDiagrama = useCallback(async () => {
    setLoadingDiagrama(true);
    setError(null);
    try {
      const diagrama = await fetchDiagrama(tipoEstadistica, tipoDiagrama, token);
      setImagenBase64(diagrama.imagen_base64);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDiagrama(false);
    }
  }, [tipoEstadistica, tipoDiagrama, token]);

  // Cargar ambos cuando cambien los parámetros
  useEffect(() => {
    if (token) {
      loadEstadisticas();
      loadDiagrama();
    }
  }, [token, loadEstadisticas, loadDiagrama]);

  // Generar nuevo feedback personalizado
  const handleGenerarFeedback = async () => {
    if (!data) return;

    setLoading(true);
    setError(null);
    try {
      // Extraer labels y values de los datos
      let labels: string[] = [];
      let values: number[] = [];

      if (tipoEstadistica === 'promedio' && 'rango_promedios' in data.estadisticas.datos) {
        const rangos = data.estadisticas.datos.rango_promedios;
        labels = Object.keys(rangos);
        values = Object.values(rangos);
      } else if ('items' in data.estadisticas.datos) {
        labels = data.estadisticas.datos.items.map((item) => item.etiqueta);
        values = data.estadisticas.datos.items.map((item) => item.cantidad);
      }

      const feedbackResponse = await generarFeedback(
        labels,
        values,
        tipoEstadistica,
        tipoDiagrama,
        token
      );

      // Actualizar el feedback en los datos
      setData({
        ...data,
        feedback: feedbackResponse.feedback,
        used_ai: feedbackResponse.used_ai,
      });
    } catch (err: any) {
      console.error('[EstadisticasConFeedback] Error al generar feedback:', err);
      setError(err.message || 'Error desconocido al generar el feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Estadística</InputLabel>
              <Select
                value={tipoEstadistica}
                label="Estadística"
                onChange={(e) => setTipoEstadistica(e.target.value as TipoEstadistica)}
              >
                <MenuItem value="promedio">Promedio</MenuItem>
                <MenuItem value="colegio">Colegio</MenuItem>
                <MenuItem value="municipio">Municipio</MenuItem>
                <MenuItem value="semestre">Semestre</MenuItem>
                <MenuItem value="nivel_riesgo">Nivel de Riesgo</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Gráfico</InputLabel>
              <Select
                value={tipoDiagrama}
                label="Gráfico"
                onChange={(e) => setTipoDiagrama(e.target.value as TipoDiagrama)}
              >
                <MenuItem value="barras">Barras</MenuItem>
                <MenuItem value="torta">Torta</MenuItem>
                <MenuItem value="lineas">Líneas</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        }
      />

      <CardContent>
        <Stack spacing={3}>
          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <>
              {/* Gráfico */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Gráfico: {tipoEstadistica.toUpperCase()} - {tipoDiagrama.toUpperCase()}
                </Typography>
                {loadingDiagrama ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height={height}
                    sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : imagenBase64 ? (
                  <Box
                    component="img"
                    src={`data:image/png;base64,${imagenBase64}`}
                    alt={`Diagrama de ${tipoEstadistica}`}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: height,
                      objectFit: 'contain',
                      borderRadius: 1,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : (
                  <Alert severity="info">No se pudo cargar el gráfico</Alert>
                )}
              </Box>

              <Divider />

              {/* Retroalimentación IA */}
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Typography variant="h6">Retroalimentación de IA</Typography>
                  <Chip
                    label={data.used_ai ? 'Generado por IA' : 'Mensaje genérico'}
                    color={data.used_ai ? 'success' : 'warning'}
                    size="small"
                    icon={
                      <Iconify
                        icon={data.used_ai ? 'solar:brain-bold' : 'solar:info-circle-bold'}
                        width={16}
                      />
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="solar:refresh-bold" width={20} />}
                    onClick={handleGenerarFeedback}
                    disabled={loading}
                  >
                    Regenerar Feedback
                  </Button>
                </Stack>

                {!data.used_ai && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" component="div">
                      <strong>⚠️ IA no disponible:</strong> La retroalimentación fue generada de forma genérica.
                      <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                        <li>Verifica que la variable de entorno <code>GEMINI_API_KEY</code> esté configurada en el backend</li>
                        <li>Confirma que la API key de Google Gemini sea válida y tenga permisos activos</li>
                        <li>Revisa los logs del backend para ver el error específico de conexión con Gemini</li>
                        <li>Verifica la conectividad del servidor backend con la API de Google</li>
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Revisa la consola del navegador (F12) para más detalles de diagnóstico.
                      </Typography>
                    </Typography>
                  </Alert>
                )}

                <Paper
                  sx={{
                    p: 3,
                    bgcolor: data.used_ai ? 'success.lighter' : 'grey.50',
                    border: '1px solid',
                    borderColor: data.used_ai ? 'success.light' : 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {data.feedback}
                  </Typography>
                </Paper>
              </Box>

              {/* Datos estadísticos */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Datos Estadísticos
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  {tipoEstadistica === 'promedio' &&
                  'promedio_general' in data.estadisticas.datos ? (
                    <Stack spacing={2}>
                      <Typography variant="body1">
                        <strong>Promedio General:</strong>{' '}
                        {data.estadisticas.datos.promedio_general.toFixed(2)}
                      </Typography>
                      {data.estadisticas.datos.distribucion_niveles && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Distribución por Niveles:
                          </Typography>
                          <Stack spacing={1}>
                            {data.estadisticas.datos.distribucion_niveles.map((item, index) => (
                              <Box key={index} display="flex" justifyContent="space-between">
                                <Typography variant="body2">{item.etiqueta}:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {item.cantidad} ({item.porcentaje.toFixed(1)}%)
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  ) : 'items' in data.estadisticas.datos ? (
                    <Stack spacing={1}>
                      <Typography variant="body1" gutterBottom>
                        <strong>Total de Estudiantes:</strong>{' '}
                        {data.estadisticas.datos.total_estudiantes}
                      </Typography>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Distribución:
                        </Typography>
                        <Stack spacing={1}>
                          {data.estadisticas.datos.items.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between">
                              <Typography variant="body2">{item.etiqueta}:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {item.cantidad} ({item.porcentaje.toFixed(1)}%)
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  ) : null}
                </Paper>
              </Box>
            </>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={height}>
              <Alert severity="info">
                Selecciona el tipo de estadística y gráfico para ver los datos
              </Alert>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
