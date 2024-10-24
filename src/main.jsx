import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LoginForm from './LoginFormMaterial'
import PokemonTable from './Table'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PokemonTable />
  </StrictMode>,
)
