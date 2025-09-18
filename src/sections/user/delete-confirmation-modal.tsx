import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type DeleteConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
  studentCode: string;
  loading?: boolean;
};

export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  studentName,
  studentCode,
  loading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify 
            icon="solar:danger-triangle-bold" 
            sx={{ color: 'error.main', fontSize: 24 }} 
          />
          <Typography variant="h6">
            Confirmar eliminación
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar al estudiante?
        </Typography>
        
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Código: {studentCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nombre: {studentName}
          </Typography>
        </Box>

        <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
          ⚠️ Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={loading}
          variant="contained" 
          color="error"
          startIcon={loading ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

