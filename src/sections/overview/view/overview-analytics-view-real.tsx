import { useState, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { DashboardContent } from 'src/layouts/dashboard';
import { useEstadisticasDashboard } from 'src/hooks/use-estadisticas-dashboard';
import { fetchEstudiantes } from 'src/utils/authService';
import { Iconify } from 'src/components/iconify';
import { AnalyticsWidgetSummaryReal } from '../analytics-widget-summary-real';
import { AnalyticsCurrentVisitsReal } from '../analytics-current-visits-real';
import { AnalyticsWebsiteVisitsReal } from '../analytics-website-visits-real';

// ----------------------------------------------------------------------

export function OverviewAnalyticsViewReal() {
  const [token, setToken] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const { estadisticas, loading, error, refetch } = useEstadisticasDashboard(token);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Cargar estudiantes para cálculo consistente de niveles de riesgo
  useEffect(() => {
    const loadEstudiantes = async () => {
      if (!token) return;
      try {
        const res = await fetchEstudiantes(token, {});
        setEstudiantes(res.estudiantes);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
      }
    };
    loadEstudiantes();
  }, [token]);

  // Función para calcular nivel de riesgo de manera consistente con la tabla
  const calcularNivelRiesgo = (promedio: number) => {
    if (promedio >= 0.0 && promedio <= 1.5) return 'ALTO';
    if (promedio >= 1.6 && promedio <= 2.9) return 'MEDIO';
    return 'BAJO';
  };

  // Calcular totales y porcentajes
  // Total de estudiantes: usar la lista de estudiantes para consistencia
  const totalEstudiantes = estudiantes.length;

  const promedioGeneral = estadisticas.promedio && 'promedio_general' in estadisticas.promedio.datos
    ? estadisticas.promedio.datos.promedio_general
    : 0;

  // Calcular niveles de riesgo de manera consistente con la tabla
  const estudiantesAltoRiesgo = estudiantes.filter(est => calcularNivelRiesgo(est.promedio) === 'ALTO').length;
  const estudiantesMedioRiesgo = estudiantes.filter(est => calcularNivelRiesgo(est.promedio) === 'MEDIO').length;
  const estudiantesBajoRiesgo = estudiantes.filter(est => calcularNivelRiesgo(est.promedio) === 'BAJO').length;


  // Preparar datos para gráficos
  const distribucionPromedios = estadisticas.promedio && 'rango_promedios' in estadisticas.promedio.datos
    ? Object.entries(estadisticas.promedio.datos.rango_promedios).map(([rango, cantidad]) => ({
        label: rango,
        value: cantidad
      }))
    : [];

  // Preparar datos para gráficos de barras - Colegios
  const itemsColegios = (estadisticas.colegio?.datos && 'items' in estadisticas.colegio.datos ? estadisticas.colegio.datos.items : []).slice(0, 5);
  const distribucionColegios = [{
    name: 'Estudiantes',
    data: itemsColegios.map((item: any) => item.cantidad)
  }];
  const categoriasColegios = itemsColegios.map((item: any) => item.etiqueta);

  // Preparar datos para gráficos de barras - Semestres (ordenados numéricamente)
  const itemsSemestres = (estadisticas.semestre?.datos && 'items' in estadisticas.semestre.datos ? estadisticas.semestre.datos.items : []).sort((a: any, b: any) => {
    const numA = parseInt(a.etiqueta, 10);
    const numB = parseInt(b.etiqueta, 10);
    return numA - numB;
  });
  const distribucionSemestres = [{
    name: 'Estudiantes',
    data: itemsSemestres.map((item: any) => item.cantidad)
  }];
  const categoriasSemestres = itemsSemestres.map((item: any) => item.etiqueta);

  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Dashboard de Estudiantes
        </Typography>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          Error al cargar los datos: {error}
        </Alert>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard de Estudiantes
      </Typography>

      <Grid container spacing={3}>
        {/* Total de Estudiantes */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummaryReal
            title="Total Estudiantes"
            percent={0}
            total={totalEstudiantes}
            icon={<Iconify icon="solar:users-group-two-rounded-bold-duotone" width={48} height={48} />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr'],
              series: [totalEstudiantes * 0.8, totalEstudiantes * 0.9, totalEstudiantes * 0.95, totalEstudiantes],
            }}
            loading={loading}
          />
        </Grid>

        {/* Promedio General */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummaryReal
            title="Promedio General"
            percent={0}
            total={promedioGeneral}
            color="warning"
            icon={<Iconify icon="solar:chart-2-bold-duotone" width={48} height={48} />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr'],
              series: [promedioGeneral * 0.9, promedioGeneral * 0.95, promedioGeneral * 0.98, promedioGeneral],
            }}
            loading={loading}
          />
        </Grid>

        {/* Estudiantes en Alto Riesgo */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummaryReal
            title="Alto Riesgo"
            percent={0}
            total={estudiantesAltoRiesgo}
            color="error"
            icon={<Iconify icon="solar:danger-triangle-bold-duotone" width={48} height={48} />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr'],
              series: [estudiantesAltoRiesgo * 1.1, estudiantesAltoRiesgo * 1.05, estudiantesAltoRiesgo * 0.98, estudiantesAltoRiesgo],
            }}
            loading={loading}
          />
        </Grid>

        {/* Estudiantes en Bajo Riesgo */}
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummaryReal
            title="Bajo Riesgo"
            percent={0}
            total={estudiantesBajoRiesgo}
            color="success"
            icon={<Iconify icon="solar:shield-check-bold-duotone" width={48} height={48} />}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr'],
              series: [estudiantesBajoRiesgo * 0.9, estudiantesBajoRiesgo * 0.95, estudiantesBajoRiesgo * 1.02, estudiantesBajoRiesgo],
            }}
            loading={loading}
          />
        </Grid>

        {/* Distribución de Promedios */}
        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisitsReal
            title="Distribución de Promedios"
            chart={{
              series: distribucionPromedios,
            }}
            loading={loading}
          />
        </Grid>

        {/* Distribución por Colegios */}
        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisitsReal
            title="Estudiantes por Colegio"
            subheader="Top 5 colegios"
            chart={{
              categories: categoriasColegios,
              series: distribucionColegios,
            }}
            loading={loading}
          />
        </Grid>

        {/* Distribución por Semestres */}
        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisitsReal
            title="Estudiantes por Semestre"
            subheader="Distribución semestral"
            chart={{
              categories: categoriasSemestres,
              series: distribucionSemestres,
            }}
            loading={loading}
          />
        </Grid>

        {/* Resumen de Niveles de Riesgo */}
        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisitsReal
            title="Niveles de Riesgo"
            chart={{
              series: [
                { label: 'Alto Riesgo', value: estudiantesAltoRiesgo },
                { label: 'Medio Riesgo', value: estudiantesMedioRiesgo },
                { label: 'Bajo Riesgo', value: estudiantesBajoRiesgo },
              ],
            }}
            loading={loading}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
