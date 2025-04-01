import React, { ChangeEvent, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { SelectChangeEvent } from '@mui/material/Select';

export function ReportsView() {
  const [selectedChartType, setSelectedChartType] = useState<string>('');
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Archivo seleccionado:", file);
      // Aquí puedes manejar el archivo subido, por ejemplo, enviarlo al backend o mostrar un preview.
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

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Reportes de rendimiento
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 3, padding: 2, width: "50%", margin: "0 auto" }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Cargar Reporte de Rendimiento
          </Typography>
          <Typography variant="body1" color="text.secondary" fontSize="0.8" gutterBottom>
            Selecciona el archivo Excel que contiene los datos de rendimiento.
          </Typography>

          {/* Input de tipo file, oculto */}
          <input
            type="file"
            accept=".xlsx,.xls" // Permite solo archivos de Excel
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }} // Oculta el input de carga de archivos
          />

          {/* Botón para activar la carga de archivos */}
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              component="span"
              sx={{ padding: "12px 0", marginTop: 2, width: "200px" }} // Ajusta el padding del botón y la separación
            >
              Cargar archivo
            </Button>
          </label>

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
    </DashboardContent>
  );
}
