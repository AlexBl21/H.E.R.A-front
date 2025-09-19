import { useState, useEffect, useCallback } from 'react';
import { fetchEstadisticas, type EstadisticasResponse, type TipoEstadistica } from '../utils/authService';

interface UseEstadisticasDashboardReturn {
  estadisticas: {
    promedio: EstadisticasResponse | null;
    nivelRiesgo: EstadisticasResponse | null;
    colegio: EstadisticasResponse | null;
    semestre: EstadisticasResponse | null;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEstadisticasDashboard(token: string | null): UseEstadisticasDashboardReturn {
  const [estadisticas, setEstadisticas] = useState({
    promedio: null as EstadisticasResponse | null,
    nivelRiesgo: null as EstadisticasResponse | null,
    colegio: null as EstadisticasResponse | null,
    semestre: null as EstadisticasResponse | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEstadisticas = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [promedio, nivelRiesgo, colegio, semestre] = await Promise.all([
        fetchEstadisticas('promedio', token),
        fetchEstadisticas('nivel_riesgo', token),
        fetchEstadisticas('colegio', token),
        fetchEstadisticas('semestre', token),
      ]);

      setEstadisticas({
        promedio,
        nivelRiesgo,
        colegio,
        semestre,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEstadisticas();
  }, [token, loadEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    refetch: loadEstadisticas,
  };
}
