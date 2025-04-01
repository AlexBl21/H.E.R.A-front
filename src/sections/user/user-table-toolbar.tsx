import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import { Iconify } from 'src/components/iconify';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

// ----------------------------------------------------------------------

// Definimos las propiedades esperadas en el componente UserTableToolbar
interface UserTableToolbarProps {
  numSelected: number; // Cantidad de elementos seleccionados en la tabla
  filterName: string; // Filtro para búsqueda por nombre
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void; // Manejador de cambio para el filtro de nombre
  filterSemestre: number | ''; // Filtro por semestre, puede ser un número o vacío
  onFilterSemestre: (event: SelectChangeEvent<string>) => void; // Manejador de cambio para el filtro de semestre
  filterRiesgo: string; // Filtro por riesgo (bajo, medio, alto)
  onFilterRiesgo: (event: SelectChangeEvent<string>) => void; // Manejador de cambio para el filtro de riesgo
}

export function UserTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  filterSemestre,
  onFilterSemestre,
  filterRiesgo,
  onFilterRiesgo,
}: UserTableToolbarProps) {
  return (
    <Box display="flex" gap={2} p={2} alignItems="center">
      {/* Filtro por Nombre */}
      <TextField
        label="Buscar por nombre"
        variant="outlined"
        value={filterName}
        onChange={onFilterName}
      />

      {/* Filtro por Semestre */}
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel>Semestre</InputLabel>
        <Select
          value={filterSemestre.toString()} // Convertimos el número a string para evitar conflictos
          onChange={(event) => onFilterSemestre(event)}
          label="Semestre"
        >
          <MenuItem value="">Todos</MenuItem>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
            <MenuItem key={sem} value={sem.toString()}>
              {sem}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Filtro por Riesgo */}
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel>Riesgo</InputLabel>
        <Select
          value={filterRiesgo}
          onChange={onFilterRiesgo}
          label="Riesgo"
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="bajo">Bajo</MenuItem>
          <MenuItem value="medio">Medio</MenuItem>
          <MenuItem value="alto">Alto</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
