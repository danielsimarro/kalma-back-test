import { useForm } from "react-hook-form";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControl,
  InputLabel,
  Paper,
  MenuItem,
  FormHelperText,
  Select,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";

// Esquema de validación con Yup
const schema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
  characterSelect: yup.string().required("Seleccione un personaje del select"),
  characterTable: yup.array().min(1, "Seleccione al menos un personaje de la tabla"),
});

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedCharacterFromTable, setSelectedCharacterFromTable] = useState([]);
  const [selectedCharacterFromSelect, setSelectedCharacterFromSelect] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(
          "https://rickandmortyapi.com/api/character"
        );
        const data = await response.json();
        setCharacters(data.results);
      } catch (error) {
        setApiError("Error al cargar personajes");
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const handleSelectFromTable = (id) => {
    const newSelected = selectedCharacterFromTable.includes(id)
      ? selectedCharacterFromTable.filter((characterId) => characterId !== id)
      : [...selectedCharacterFromTable, id];

    setSelectedCharacterFromTable(newSelected);
    setValue("characterTable", newSelected); // Almacena los personajes seleccionados de la tabla en el formulario
  };

  const handleSelectFromDropdown = (e) => {
    setSelectedCharacterFromSelect(e.target.value);
    setValue("characterSelect", e.target.value); // Almacena el personaje seleccionado del Select en el formulario
  };

  const onSubmit = (data) => {
    console.log("Datos del formulario:", data);
    // Aquí puedes hacer la llamada a la API para enviar los datos
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen my-5">
      <h1 className="text-2xl font-bold mb-6">Formulario de Prueba</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        <TextField
          label="Email"
          fullWidth
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        {/* Select de personajes */}
        <FormControl fullWidth error={!!errors.characterSelect}>
          <InputLabel>Personaje (Select)</InputLabel>
          <Select
            label="Personaje (Select)"
            value={selectedCharacterFromSelect}
            {...register("characterSelect")}
            onChange={handleSelectFromDropdown}
            defaultValue=""
          >
            {loading ? (
              <MenuItem disabled>Cargando personajes...</MenuItem>
            ) : apiError ? (
              <MenuItem disabled>{apiError}</MenuItem>
            ) : (
              characters.map((character) => (
                <MenuItem key={character.id} value={character.name}>
                  {character.name}
                </MenuItem>
              ))
            )}
          </Select>
          <FormHelperText>{errors.characterSelect?.message}</FormHelperText>
        </FormControl>

        {/* Tabla de personajes */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Especie</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando personajes...
                  </TableCell>
                </TableRow>
              ) : apiError ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {apiError}
                  </TableCell>
                </TableRow>
              ) : (
                characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCharacterFromTable.includes(character.id)}
                        onChange={() => handleSelectFromTable(character.id)}
                      />
                    </TableCell>
                    <TableCell>{character.name}</TableCell>
                    <TableCell>{character.species}</TableCell>
                    <TableCell>{character.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {errors.characterTable && (
          <FormHelperText error>{errors.characterTable.message}</FormHelperText>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Iniciar Sesión y Enviar Selección
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
