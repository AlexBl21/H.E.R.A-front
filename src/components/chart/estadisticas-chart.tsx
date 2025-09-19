import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardHeader, CardContent, Box, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Button, Stack } from '@mui/material';
import { Chart } from './chart';
import { useChart } from './use-chart';
import { fetchEstadisticas, fetchDiagrama, type TipoEstadistica, type TipoDiagrama, type EstadisticasResponse } from '../../utils/authService';

// ----------------------------------------------------------------------

interface EstadisticasChartProps {
  token: string;
  title?: string;
  height?: number;
}

export function EstadisticasChart({ token, title = 'Estadísticas de Estudiantes', height = 400 }: EstadisticasChartProps) {
  const theme = useTheme();
  const [tipoEstadistica, setTipoEstadistica] = useState<TipoEstadistica>('promedio');
  const [tipoDiagrama, setTipoDiagrama] = useState<TipoDiagrama>('barras');
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas cuando cambie el tipo
  const loadEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEstadisticas(tipoEstadistica, token);
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tipoEstadistica, token]);

  useEffect(() => {
    if (token) {
      loadEstadisticas();
    }
  }, [token, loadEstadisticas]);

  const handleGenerarDiagrama = async () => {
    setLoading(true);
    setError(null);
    try {
      const diagrama = await fetchDiagrama(tipoEstadistica, tipoDiagrama, token);
      // Aquí podrías mostrar la imagen base64 si prefieres esa opción
      console.log('Diagrama generado:', diagrama);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico
  const chartData = (() => {
    if (!estadisticas) return { series: [], categories: [], colors: [] };

    let series: any[] = [];
    let categories: string[] = [];
    let colors: string[] = [];

    if (tipoEstadistica === 'promedio' && 'rango_promedios' in estadisticas.datos) {
      // Datos de promedio
      const rangos = estadisticas.datos.rango_promedios;
      categories = Object.keys(rangos);
      
      if (tipoDiagrama === 'torta') {
        // Para gráfico de torta, formatear datos como array de objetos
        series = Object.entries(rangos).map(([rango, cantidad]) => ({
          name: rango,
          value: cantidad
        }));
      } else {
        // Para barras y líneas, usar formato normal
        series = [{
          name: 'Cantidad de Estudiantes',
          data: Object.values(rangos)
        }];
      }
      
      colors = [
        theme.palette.error.main,    // 0-1 (Alto riesgo)
        theme.palette.warning.main,  // 1-2 (Medio riesgo)
        theme.palette.info.main,     // 2-3 (Medio riesgo)
        theme.palette.success.main,  // 3-4 (Bajo riesgo)
        theme.palette.primary.main   // 4-5 (Bajo riesgo)
      ];
    } else if ('items' in estadisticas.datos) {
      // Datos generales (colegio, municipio, semestre, nivel_riesgo)
      const items = estadisticas.datos.items;
      categories = items.map(item => item.etiqueta);
      
      if (tipoDiagrama === 'torta') {
        // Para gráfico de torta, formatear datos como array de objetos
        series = items.map(item => ({
          name: item.etiqueta,
          value: item.cantidad
        }));
      } else {
        // Para barras y líneas, usar formato normal
        series = [{
          name: 'Cantidad de Estudiantes',
          data: items.map(item => item.cantidad)
        }];
      }
      
      colors = [
        theme.palette.success.main,    // Verde
        theme.palette.warning.main,    // Naranja
        theme.palette.error.main,      // Rojo
        theme.palette.info.main,       // Azul claro
        '#9C27B0',                     // Púrpura
        '#FF5722',                     // Rojo-naranja
        '#795548',                     // Marrón
        '#607D8B',                     // Azul gris
      ];
    }

    return { series, categories, colors };
  })();

  const chartOptions = useChart({
    chart: {
      type: tipoDiagrama === 'barras' ? 'bar' : tipoDiagrama === 'torta' ? 'pie' : 'line',
      toolbar: { show: true },
      zoom: { enabled: tipoDiagrama !== 'torta' }
    },
    colors: chartData.colors,
    xaxis: {
      categories: tipoDiagrama === 'torta' ? undefined : chartData.categories
    },
    yaxis: tipoDiagrama === 'torta' ? undefined : {
      title: { text: 'Cantidad de Estudiantes' }
    },
    title: {
      text: `${title} - ${tipoEstadistica.toUpperCase()}`,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 600
      }
    },
    legend: {
      show: tipoDiagrama === 'torta',
      position: 'bottom'
    },
    dataLabels: {
      enabled: tipoDiagrama === 'torta',
      formatter: (val: number) => val > 0 ? `${val}` : ''
    }
  });

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Stack spacing={3}>
          {/* Controles */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Estadística</InputLabel>
              <Select
                value={tipoEstadistica}
                label="Tipo de Estadística"
                onChange={(e) => setTipoEstadistica(e.target.value as TipoEstadistica)}
              >
                <MenuItem value="promedio">Promedio</MenuItem>
                <MenuItem value="colegio">Colegio</MenuItem>
                <MenuItem value="municipio">Municipio</MenuItem>
                <MenuItem value="semestre">Semestre</MenuItem>
                <MenuItem value="nivel_riesgo">Nivel de Riesgo</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Diagrama</InputLabel>
              <Select
                value={tipoDiagrama}
                label="Tipo de Diagrama"
                onChange={(e) => setTipoDiagrama(e.target.value as TipoDiagrama)}
              >
                <MenuItem value="barras">Barras</MenuItem>
                <MenuItem value="torta">Torta</MenuItem>
                <MenuItem value="lineas">Líneas</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleGenerarDiagrama}
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? <CircularProgress size={20} /> : 'Generar Diagrama'}
            </Button>
          </Stack>

          {/* Error */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Gráfico */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={height}>
              <CircularProgress />
            </Box>
          ) : estadisticas ? (
            <Box sx={{ height }}>
              <Chart
                type={tipoDiagrama === 'barras' ? 'bar' : tipoDiagrama === 'torta' ? 'pie' : 'line'}
                series={chartData.series}
                options={chartOptions}
                height={height}
              />
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={height}>
              <Alert severity="info">
                Selecciona el tipo de estadística y gráfico, luego haz clic en &quot;Generar Diagrama&quot;
              </Alert>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}