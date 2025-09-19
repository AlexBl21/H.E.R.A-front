import React, { ChangeEvent, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, Select, MenuItem, InputLabel, FormControl, TextField, Tabs, Tab } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { SelectChangeEvent } from '@mui/material/Select';
import { uploadExcel } from 'src/utils/authService';
import { EstadisticasChart, DiagramaBackend } from 'src/components/chart';

export function ReportsView() {
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  // Obtener token al cargar el componente
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadMessage(null);
      setUploadError(null);
      try {
        const authToken = localStorage.getItem('token');
        if (!authToken) throw new Error('No autenticado');
        const res = await uploadExcel(file, authToken);
        setUploadMessage(res.message);
      } catch (err: any) {
        setUploadError(err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedChartType(event.target.value as string);
  };

  const handleReportTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedReportType(event.target.value as string);
  };

  const handleDateRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDateRange(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Reportes de rendimiento
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Cargar Datos" />
          <Tab label="Gráficas Interactivas" />
          <Tab label="Diagramas Backend" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Card sx={{ boxShadow: 3, padding: 2, width: "50%", margin: "0 auto" }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Cargar Reporte de Rendimiento
            </Typography>
            <Typography variant="body1" color="text.secondary" fontSize="0.8" gutterBottom>
              Selecciona el archivo Excel que contiene los datos de rendimiento.
            </Typography>

            <Box component="form" role="presentation" sx={{ textAlign: 'center' }}>
              <Button
                component="label"
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                htmlFor="file-upload"
                disabled={uploading}
              >
                {uploading ? 'Cargando...' : 'Cargar Reporte'}
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  aria-label="Cargar reporte"
                />
              </Button>
              {uploadMessage && (
                <Box sx={{ mt: 2, bgcolor: 'success.lighter', color: 'success.dark', borderRadius: 1, px: 2, py: 1, fontWeight: 'bold', fontSize: 15 }}>
                  {uploadMessage}
                </Box>
              )}
              {uploadError && (
                <Box sx={{ mt: 2, bgcolor: 'error.lighter', color: 'error.dark', borderRadius: 1, px: 2, py: 1, fontWeight: 'bold', fontSize: 15 }}>
                  {uploadError}
                </Box>
              )}
            </Box>

            {/* Filtros */}
            <Box sx={{ width: '100%', marginTop: 3 }}>
              <Grid container spacing={2}>
                {/* Filtro de tipo de gráfico */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de gráfico</InputLabel>
                    <Select
                      value={selectedChartType}
                      label="Tipo de gráfico"
                      onChange={handleChartTypeChange}
                    >
                      <MenuItem value="bar">Barras</MenuItem>
                      <MenuItem value="pie">Circular</MenuItem>
                      <MenuItem value="line">Línea</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro de tipo de reporte */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de reporte</InputLabel>
                    <Select
                      value={selectedReportType}
                      label="Tipo de reporte"
                      onChange={handleReportTypeChange}
                    >
                      <MenuItem value="performance">Rendimiento</MenuItem>
                      <MenuItem value="attendance">Asistencia</MenuItem>
                      <MenuItem value="grades">Notas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro de rango de fecha */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rango de fechas"
                    type="date"
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Box>
          {token ? (
            <EstadisticasChart 
              token={token} 
              title="Análisis de Estudiantes"
              height={500}
            />
          ) : (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Debes estar autenticado para ver las gráficas
              </Typography>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {token ? (
            <DiagramaBackend 
              token={token} 
              title="Diagramas Generados por el Backend"
              height={500}
            />
          ) : (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Debes estar autenticado para ver los diagramas
              </Typography>
            </Card>
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
