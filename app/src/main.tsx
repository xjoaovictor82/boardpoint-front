import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './estilos/global.css';
import './estilos/loja.css';
import './estilos/conta.css';
import './estilos/loja-extras.css';
import './estilos/admin.css';
import './estilos/admin-extras.css';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Elemento #raiz não encontrado em index.html');

createRoot(raiz).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
