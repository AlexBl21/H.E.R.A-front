import { useState } from 'react';
import { Card, CardHeader, CardContent, Box, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem, Button, Stack, Typography } from '@mui/material';
import { fetchDiagrama, type TipoEstadistica, type TipoDiagrama } from '../../utils/authService';

// ----------------------------------------------------------------------

interface DiagramaBackendProps {
  token: string;
  title?: string;
  height?: number;
}

export function DiagramaBackend({ token, title = 'Diagramas del Backend', height = 400 }: DiagramaBackendProps) {
  const [tipoEstadistica, setTipoEstadistica] = useState<TipoEstadistica>('promedio');
  const [tipoDiagrama, setTipoDiagrama] = useState<TipoDiagrama>('barras');
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerarDiagrama = async () => {
    setLoading(true);
    setError(null);
    try {
      const diagrama = await fetchDiagrama(tipoEstadistica, tipoDiagrama, token);
      setImagenBase64(diagrama.imagen_base64);
    } catch (err: any) {
      setError(err.message);
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={tipoEstadistica}
                label="Tipo"
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

            <Button 
              variant="contained" 
              onClick={handleGenerarDiagrama}
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Generar Diagrama'}
            </Button>
          </Stack>
        }
      />
      
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <CircularProgress />
          </Box>
        ) : imagenBase64 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              {tipoEstadistica.toUpperCase()} - {tipoDiagrama.toUpperCase()}
            </Typography>
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
                borderColor: 'divider'
              }}
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <Alert severity="info">
              Selecciona el tipo de estadística y gráfico, luego haz clic en &quot;Generar Diagrama&quot;
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
