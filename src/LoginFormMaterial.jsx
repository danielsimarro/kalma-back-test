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
  character: yup.string().required('Seleccione un personaje'), // Validación del campo select
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const [characters, setCharacters] = useState([]);

  // Llamada a la API para obtener personajes
  useEffect(() => {
    const fetchCharacters = async () => {
      const response = await fetch('https://rickandmortyapi.com/api/character');
      const data = await response.json();
      setCharacters(data.results); // Guardar los personajes obtenidos
    };

    fetchCharacters();
  }, []);

  // Al enviar el formulario
  const onSubmit = (data) => {
    console.log(data);
    // Llamada a la API para login
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <TextField
          label="Email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email ? errors.email.message : ''}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password ? errors.password.message : ''}
        />
        
        {/* Campo Select que obtiene los personajes de la API */}
        <FormControl fullWidth error={!!errors.character}>
          <InputLabel>Personaje</InputLabel>
          <Select
            label="Personaje"
            {...register('character')}
            onChange={(e) => setValue('character', e.target.value)} // Actualizar el valor en el formulario
          >
            {characters.map((character) => (
              <MenuItem key={character.id} value={character.name}>
                {character.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.character ? errors.character.message : ''}</FormHelperText>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Enviar
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
