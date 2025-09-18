import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fetchEstudiantes, deleteEstudiante, createEstudiante, fetchEstudianteByCodigo, updateEstudiante } from 'src/utils/authService';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import StudentModal from '../student-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';
import type { UserProps } from '../user-table-row';

export function UserView() {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);
  const [initialStudentData, setInitialStudentData] = useState<any | null>(null);
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [filterSemestre, setFilterSemestre] = useState<number | ''>(''); 
  const [filterRiesgo, setFilterRiesgo] = useState<string>('');
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleOpenModal = () => {
    setModalMode('create');
    setInitialStudentData(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCreateError('');
  };
  const handleOpenEdit = async (codigo: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      setModalMode('edit');
      setSelectedCodigo(codigo);
      const data = await fetchEstudianteByCodigo(codigo, token);
      setInitialStudentData({
        codigo: data.codigo,
        nombre: data.nombre,
        tipo_documento_id: data.tipo_documento_id,
        documento: data.documento,
        semestre: data.semestre,
        pensum: data.pensum,
        ingreso: data.ingreso,
        estado_matricula_id: data.estado_matricula_id,
        celular: data.celular ?? '',
        email_personal: data.email_personal ?? '',
        email_institucional: data.email_institucional,
        colegio_egresado_id: data.colegio_egresado_id,
        municipio_nacimiento_id: data.municipio_nacimiento_id,
        // promedio viene aparte; no lo devuelve el detalle base
      });
      setOpenModal(true);
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  const handleSubmitEdit = async (studentData: any) => {
    setCreating(true);
    setCreateError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      // Preparar payload de actualización (solo campos editables que hayan cambiado)
      type EditableKey = 'nombre' | 'semestre' | 'pensum' | 'ingreso' | 'estado_matricula_id' | 'celular' | 'email_personal' | 'email_institucional' | 'colegio_egresado_id' | 'municipio_nacimiento_id' | 'promedio';
      type UpdatePayload = {
        nombre?: string;
        semestre?: string;
        pensum?: string;
        ingreso?: string;
        estado_matricula_id?: number;
        celular?: string | null;
        email_personal?: string | null;
        email_institucional?: string;
        colegio_egresado_id?: number;
        municipio_nacimiento_id?: number;
        promedio?: number | null;
      };
      const editableKeys: EditableKey[] = [
        'nombre','semestre','pensum','ingreso','estado_matricula_id','celular','email_personal','email_institucional','colegio_egresado_id','municipio_nacimiento_id','promedio'
      ];
      const updates: UpdatePayload = {};
      editableKeys.forEach((key) => {
        const newValue = (studentData as Record<string, unknown>)[key];
        const oldValue = (initialStudentData as Record<string, unknown> | null)?.[key] ?? '';
        if (newValue !== undefined && newValue !== oldValue) {
          switch (key) {
            case 'estado_matricula_id':
            case 'colegio_egresado_id':
            case 'municipio_nacimiento_id':
              (updates as any)[key] = Number(newValue);
              break;
            case 'promedio':
              (updates as any)[key] = newValue === '' ? null : parseFloat(String(newValue));
              break;
            case 'celular':
            case 'email_personal':
              (updates as any)[key] = newValue === '' ? null : String(newValue);
              break;
            case 'nombre':
            case 'semestre':
            case 'pensum':
            case 'ingreso':
            case 'email_institucional':
              (updates as any)[key] = String(newValue);
              break;
            default:
              (updates as any)[key] = newValue as any;
          }
        }
      });

      await updateEstudiante(selectedCodigo as string, updates, token);

      // Refrescar lista
      const filters: any = {};
      if (filterName) filters.nombre = filterName;
      if (filterSemestre !== '') filters.semestre = filterSemestre.toString();
      if (filterRiesgo) filters.nivel_riesgo = filterRiesgo;
      const res = await fetchEstudiantes(token, filters);
      setEstudiantes(res.estudiantes);

      setOpenModal(false);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRegisterStudent = async (studentData: any) => {
    console.log('handleRegisterStudent ejecutado con datos:', studentData);
    setCreating(true);
    setCreateError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      
      // Convertir promedio a número
      const processedData = {
        ...studentData,
        promedio: parseFloat(studentData.promedio as string)
      };
      
      console.log('Creando estudiante...');
      await createEstudiante(processedData, token);
      console.log('Estudiante creado exitosamente');
      
      // Actualizar la lista de estudiantes después de crear
      const filters: any = {};
      if (filterName) filters.nombre = filterName;
      if (filterSemestre !== '') filters.semestre = filterSemestre.toString();
      if (filterRiesgo) filters.nivel_riesgo = filterRiesgo;
      
      console.log('Actualizando lista de estudiantes...');
      const res = await fetchEstudiantes(token, filters);
      setEstudiantes(res.estudiantes);
      
      // Cerrar el modal
      setOpenModal(false);
      console.log('Modal cerrado');
      
    } catch (err: any) {
      console.error('Error al crear estudiante:', err);
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStudent = async (codigoEstudiante: string) => {
    setDeleting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      
      await deleteEstudiante(codigoEstudiante, token);
      
      // Actualizar la lista de estudiantes después de eliminar
      const filters: any = {};
      if (filterName) filters.nombre = filterName;
      if (filterSemestre !== '') filters.semestre = filterSemestre.toString();
      if (filterRiesgo) filters.nivel_riesgo = filterRiesgo;
      
      const res = await fetchEstudiantes(token, filters);
      setEstudiantes(res.estudiantes);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const getEstudiantes = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');
        
        // Construir objeto de filtros
        const filters: any = {};
        if (filterName) filters.nombre = filterName;
        if (filterSemestre !== '') filters.semestre = filterSemestre.toString();
        if (filterRiesgo) filters.nivel_riesgo = filterRiesgo;
        
        const res = await fetchEstudiantes(token, filters);
        setEstudiantes(res.estudiantes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getEstudiantes();
  }, [filterName, filterSemestre, filterRiesgo]); // Agregamos las dependencias para que se actualice cuando cambien los filtros

  // Ya no necesitamos aplicar filtros en el frontend porque vienen filtrados del backend
  const dataFiltered = estudiantes;

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenModal}
        >
          Registrar Estudiante
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          filterSemestre={filterSemestre}
          onFilterSemestre={(event) => {
            const value = event.target.value ? Number(event.target.value) : '';
            setFilterSemestre(value);
            table.onResetPage();
          }}
          filterRiesgo={filterRiesgo}
          onFilterRiesgo={(event) => {
            setFilterRiesgo(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={estudiantes.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    estudiantes.map((user) => user.codigo)
                  )
                }
                headLabel={[
                  { id: 'codigo', label: 'Código', align: 'center' },
                  { id: 'name', label: 'Nombre', align: 'center' },
                  { id: 'email', label: 'Correo', align: 'center' },
                  { id: 'semestre', label: 'Semestre', align: 'center' },
                  { id: 'riesgo', label: 'Nivel de Riesgo', align: 'center' },
                  { id: 'actions', label: 'Acciones', align: 'center' },
                ]}
              />
              <TableBody>
                {loading ? (
                  <tr><td colSpan={4}><Box sx={{ p: 3, textAlign: 'center' }}>Cargando...</Box></td></tr>
                ) : error ? (
                  <tr><td colSpan={4}><Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>{error}</Box></td></tr>
                ) : dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <UserTableRow
                      key={(row as any).codigo}
                      row={{
                        id: (row as any).id || (row as any).codigo, // Usar id real si está disponible, sino el código
                        name: (row as any).nombre,
                        codigo: (row as any).codigo,
                        semestre: Number((row as any).semestre),
                        email: (row as any).email_institucional,
                        riesgo: ((row as any).nivel_riesgo || '').toLowerCase(),
                        avatarUrl: '',
                      }}
                      selected={table.selected.includes((row as any).codigo)}
                      onSelectRow={() => table.onSelectRow((row as any).codigo)}
                      onDelete={handleDeleteStudent}
                      onEdit={handleOpenEdit}
                      deleting={deleting}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, estudiantes.length)}
                />

                {(!loading && !error && !dataFiltered.length && !!filterName) && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={table.page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <StudentModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={modalMode === 'edit' ? handleSubmitEdit : handleRegisterStudent}
        loading={creating}
        error={createError}
        mode={modalMode}
        initialData={initialStudentData || undefined}
      />
    </DashboardContent>
  );
}

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
