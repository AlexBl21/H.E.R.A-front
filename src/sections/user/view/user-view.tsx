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
import { fetchEstudiantes } from 'src/utils/authService';
import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { StudentModal } from '../student-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';
import type { UserProps } from '../user-table-row';

export function UserView() {
  const [openModal, setOpenModal] = useState(false);
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [filterSemestre, setFilterSemestre] = useState<number | ''>(''); 
  const [filterRiesgo, setFilterRiesgo] = useState<string>('');
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleRegisterStudent = (studentData: { name: string; semester: number; riskLevel: string }) => {
    // Aquí se implementará la lógica para registrar el estudiante
    console.log('Nuevo estudiante:', studentData);
  };

  useEffect(() => {
    const getEstudiantes = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');
        const res = await fetchEstudiantes(token);
        setEstudiantes(res.estudiantes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getEstudiantes();
  }, []);

  // Reemplazar _users por estudiantes en la tabla
  const dataFiltered = applyFilter({
    inputData: estudiantes,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterSemestre,
    filterRiesgo,
  });

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
                  { id: 'semestre', label: 'Semestre', align: 'center' },
                  { id: 'email', label: 'Correo', align: 'center' },
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
                        id: (row as any).codigo,
                        name: (row as any).nombre,
                        codigo: (row as any).codigo,
                        semestre: Number((row as any).semestre),
                        email: (row as any).email_institucional,
                        riesgo: ((row as any).nivel_riesgo || '').toLowerCase(),
                        avatarUrl: '',
                      }}
                      selected={table.selected.includes((row as any).codigo)}
                      onSelectRow={() => table.onSelectRow((row as any).codigo)}
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
        onSubmit={handleRegisterStudent}
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
