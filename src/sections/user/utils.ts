import type { UserProps } from './user-table-row';

// ----------------------------------------------------------------------

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// ----------------------------------------------------------------------

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (
  a: {
    [key in Key]: number | string;
  },
  b: {
    [key in Key]: number | string;
  }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

type ApplyFilterParams = {
  inputData: UserProps[];
  comparator: (a: UserProps, b: UserProps) => number;
  filterName?: string;
  filterSemestre?: number | '';
  filterRiesgo?: string;
};

export function applyFilter({
  inputData,
  comparator,
  filterName = '',
  filterSemestre = '',
  filterRiesgo = '',
}: ApplyFilterParams): UserProps[] {
  let filteredData = [...inputData];

  // Ordenamos los datos con el comparador
  filteredData.sort(comparator);

  // Filtrar por nombre
  if (filterName) {
    filteredData = filteredData.filter((user) =>
      user.name.toLowerCase().includes(filterName.toLowerCase())
    );
  }

  // Filtrar por semestre
  if (filterSemestre !== '') {
    filteredData = filteredData.filter((user) => user.semestre === filterSemestre);
  }

  // Filtrar por nivel de riesgo
  if (filterRiesgo) {
    filteredData = filteredData.filter(
      (user) => user.riesgo.toLowerCase().trim() === filterRiesgo.toLowerCase().trim()
    );
  }


  return filteredData;
}
