import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, TextField, FormControlLabel, Checkbox, Avatar, IconButton } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { Edit } from '@mui/icons-material'; // Icono de lápiz

export function SettingsView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [earlyAlerts, setEarlyAlerts] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleSave = () => {
    // Lógica para guardar los cambios
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file); // Convertir la imagen a base64
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Configuración
        </Typography>
      </Box>

      <Card sx={{ boxShadow: 3, padding: 2 }}>
        <Scrollbar>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Editar Perfil
            </Typography>

            {/* Imagen de perfil y botón de edición */}
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                src={profileImage || "/assets/avatars/avatar_default.jpg"}
                alt="Foto de perfil"
                sx={{ width: 120, height: 120, borderRadius: '50%', marginRight: 2 }}
              />
              <Box component="form" role="presentation">
                <Button
                  component="label"
                  color="primary"
                  htmlFor="profile-image-upload"
                >
                  <IconButton color="primary" component="span">
                    <Edit />
                  </IconButton>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    style={{ display: 'none' }}
                    aria-label="Cambiar foto de perfil"
                  />
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Campo para editar correo electrónico */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              {/* Campo para editar contraseña */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              {/* Preferencia sobre alertas tempranas */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={earlyAlerts}
                      onChange={(e) => setEarlyAlerts(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Recibir alertas tempranas"
                />
              </Grid>
            </Grid>

            {/* Botón para guardar cambios */}
            <Box mt={3}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Guardar Cambios
              </Button>
            </Box>
          </CardContent>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}
