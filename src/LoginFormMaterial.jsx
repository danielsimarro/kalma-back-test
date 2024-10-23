// src/LoginForm.js
import { useForm } from 'react-hook-form';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';

// Esquema de validación con Yup
const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
  character: yup.string().required('Seleccione un personaje'),
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('https://rickandmortyapi.com/api/character');
        const data = await response.json();
        setCharacters(data.results);
      } catch (error) {
        setApiError('Error al cargar personajes');
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const onSubmit = (data) => {
    console.log(data);
    // Aquí puedes hacer la llamada a la API para autenticar
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <TextField
          label="Email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <FormControl fullWidth error={!!errors.character}>
          <InputLabel>Personaje</InputLabel>
          <Select
            label="Personaje"
            defaultValue="" // Valor predeterminado vacío
            {...register('character')} // Registrar campo en el formulario
            onChange={(e) => setValue('character', e.target.value)} // Actualiza el valor en el formulario
            disabled={loading || apiError} // Deshabilitar si hay error o se está cargando
          >
            <MenuItem value="">
              <em>Seleccione un personaje</em>
            </MenuItem>
            {characters.map((character) => (
              <MenuItem key={character.id} value={character.name}>
                {character.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.character?.message || apiError}</FormHelperText>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
