import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DeleteConfirmationModal } from './delete-confirmation-modal';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  codigo: string;
  name: string;
  email: string;
  semestre: number;
  riesgo: string;
  avatarUrl: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onDelete?: (codigoEstudiante: string) => void;
  onEdit?: (codigoEstudiante: string) => void;
  deleting?: boolean;
  onRowClick?: (codigo: string) => void;
};

export function UserTableRow({ row, selected, onSelectRow, onDelete, onEdit, deleting = false, onRowClick }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleOpenDeleteModal = useCallback(() => {
    setOpenDeleteModal(true);
    setOpenPopover(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (onDelete) {
      // Usar el código del estudiante directamente
      onDelete(row.codigo);
    }
    setOpenDeleteModal(false);
  }, [onDelete, row.codigo]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(row.codigo);
    }
    setOpenPopover(null);
  }, [onEdit, row.codigo]);

  const handleRowClick = useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    // No activar el click si se hace click en el checkbox, botón de acciones o popover
    const target = event.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    if (onRowClick) {
      onRowClick(row.codigo);
    }
  }, [onRowClick, row.codigo]);

  return (
    <>
      <TableRow 
        hover 
        tabIndex={-1} 
        role="checkbox" 
        selected={selected}
        onClick={handleRowClick}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: onRowClick ? 'action.hover' : undefined,
          },
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        {/* Código (alineado al centro) */}
        <TableCell align="center" sx={{ width: 120, minWidth: 100 }}>
          {row.codigo}
        </TableCell>

        {/* Nombre (alineado a la izquierda y con avatar) */}
        <TableCell align="left" sx={{ width: 250, minWidth: 200 }}>
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.name} src={row.avatarUrl} />
            {row.name}
          </Box>
        </TableCell>

        {/* Correo (alineado al centro) */}
        <TableCell align="center" sx={{ width: 220, minWidth: 180 }}>
          {row.email}
        </TableCell>

        {/* Semestre (alineado al centro) */}
        <TableCell align="center" sx={{ width: 100, minWidth: 80 }}>
          {row.semestre}
        </TableCell>

        {/* Nivel de Riesgo (alineado al centro) */}
        <TableCell align="center" sx={{ width: 180, minWidth: 120 }}>
          <Label
            color={row.riesgo === 'alto' ? 'error' : row.riesgo === 'medio' ? 'warning' : 'success'}
          >
            {row.riesgo}
          </Label>
        </TableCell>

        {/* Acciones (alineado a la derecha) */}
        <TableCell align="right" sx={{ width: 50, minWidth: 50 }}>
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Eliminar
          </MenuItem>
        </MenuList>
      </Popover>

      <DeleteConfirmationModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        studentName={row.name}
        studentCode={row.codigo}
        loading={deleting}
      />
    </>
  );
}
