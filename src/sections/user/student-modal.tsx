import { useState } from 'react';
import {
  Box,
  Modal,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

type StudentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentData: { name: string; semester: number; riskLevel: string }) => void;
};

export function StudentModal({ open, onClose, onSubmit }: StudentModalProps) {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      semester: Number(semester),
      riskLevel,
    });
    // Limpiar el formulario
    setName('');
    setSemester('');
    setRiskLevel('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
          Registrar Estudiante
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            label="Nombre del Estudiante"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <FormControl fullWidth required>
            <InputLabel>Semestre</InputLabel>
            <Select
              value={semester}
              label="Semestre"
              onChange={(e) => setSemester(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Nivel de Riesgo</InputLabel>
            <Select
              value={riskLevel}
              label="Nivel de Riesgo"
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              Registrar
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
} 