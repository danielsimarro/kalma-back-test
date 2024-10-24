import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { visuallyHidden } from '@mui/utils';

// Función debounce para retrasar la ejecución de la búsqueda hasta que el usuario deje de escribir
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// Definimos los encabezados de la tabla
const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Pokémon Name',
  },
  {
    id: 'height',
    numeric: true,
    disablePadding: false,
    label: 'Height',
  },
  {
    id: 'weight',
    numeric: true,
    disablePadding: false,
    label: 'Weight',
  },
  {
    id: 'types',
    numeric: false,
    disablePadding: false,
    label: 'Types',
  },
];

// Componente para renderizar los encabezados de la tabla
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, onSelectAllClick, rowCount, numSelected } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Componente principal que contiene la tabla con datos de la PokeAPI
export default function PokemonTable() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState(''); // Estado para el input de búsqueda
  const [error, setError] = React.useState(null);

  // Función para realizar la búsqueda o paginación
  const fetchPokemonDetails = async (search) => {
    setLoading(true);
    try {
      let data;
      // Si hay una búsqueda activa, buscamos el Pokémon por nombre
      if (search) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokémon no encontrado');
        const pokemonData = await response.json();
        data = [
          {
            name: pokemonData.name,
            height: pokemonData.height,
            weight: pokemonData.weight,
            types: pokemonData.types.map((typeInfo) => typeInfo.type.name).join(', '),
          },
        ];
      } else {
        // Si no hay búsqueda, hacemos la paginación por defecto
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${page * rowsPerPage}&limit=${rowsPerPage}`
        );
        const jsonData = await response.json();
        data = await Promise.all(
          jsonData.results.map(async (pokemon) => {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();
            return {
              name: pokemonData.name,
              height: pokemonData.height,
              weight: pokemonData.weight,
              types: pokemonData.types.map((typeInfo) => typeInfo.type.name).join(', '),
            };
          })
        );
      }
      setRows(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setRows([]);
    }
    setLoading(false);
  };

  // Llamada a la API cuando se monta el componente y cuando cambian page o rowsPerPage
  React.useEffect(() => {
    if (!searchQuery) {
      fetchPokemonDetails(''); // Si no hay búsqueda, hacemos paginación normal
    }
  }, [page, rowsPerPage]); // Excluimos searchQuery para no hacer la búsqueda cuando no es necesario

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name); // Solo selecciona los Pokémon visibles en la página actual
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleShowSelected = () => {
    console.log('Pokémon seleccionados:', selected);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Función debounce para la búsqueda
  const handleSearchChange = debounce((event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Resetea la página a 0 cuando se realiza una búsqueda
    fetchPokemonDetails(event.target.value); // Llamada a la función de búsqueda con el término ingresado
  }, 1000); // 500ms de retraso

  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <Paper sx={{ width: '100%', mb: 2, padding: '10px' }}>
        <TextField
          label="Buscar Pokémon"
          variant="outlined"
          fullWidth
          sx={{ marginBottom: '20px' }}
          onChange={handleSearchChange} // Manejador del input de búsqueda con debounce
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleShowSelected}
          sx={{ marginBottom: '10px' }}
        >
          Mostrar Seleccionados
        </Button>
        {error ? (
          <p>{error}</p>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
                rowCount={rows.length}
                numSelected={selected.length}
              />
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => {
                    const isItemSelected = isSelected(row.name);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.name)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.name}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.height}</TableCell>
                        <TableCell align="right">{row.weight}</TableCell>
                        <TableCell align="left">{row.types}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!searchQuery && ( // Solo mostramos la paginación si no hay búsqueda activa
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={100} // Se establece en 100, pero puede ajustarse según lo que necesites
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
}
