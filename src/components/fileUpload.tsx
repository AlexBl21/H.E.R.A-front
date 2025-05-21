import React, { ChangeEvent } from 'react';
import { Button, Card, CardContent, Typography, Grid, Box } from '@mui/material';
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

            <Box 
              component="form" 
              role="presentation" 
              sx={{ textAlign: 'center' }}
            >
              <Button
                component="label"
                variant="contained"
                color="primary"
                htmlFor="file-upload"
              >
                Cargar Archivo
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  aria-label="Cargar archivo"
                />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
