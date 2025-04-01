import React, { ChangeEvent } from 'react';
import { Button, Card, CardContent, Typography, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export function FileUpload() {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Archivo seleccionado:", file);
      // Aquí puedes manejar el archivo subido, por ejemplo, enviarlo al backend o mostrar un preview.
    }
  };

  return (
    <Grid container justifyContent="center" spacing={2}>
      <Grid item xs={12} sm={8} md={6}>
        <Card sx={{ boxShadow: 3, padding: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Cargar Reporte de Rendimiento
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
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
                fullWidth
                sx={{ padding: "12px 0" }} // Ajusta el padding del botón
              >
                Cargar archivo
              </Button>
            </label>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
