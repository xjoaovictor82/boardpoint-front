import { Route, Routes } from 'react-router-dom';
import { PaginaEmConstrucao } from './componentes/PaginaEmConstrucao';
import { rotas } from './rotas';

export function App() {
  return (
    <Routes>
      {rotas.map((rota) => (
        <Route
          key={rota.caminho}
          path={rota.caminho}
          element={<PaginaEmConstrucao titulo={rota.titulo} />}
        />
      ))}
      <Route path="*" element={<PaginaEmConstrucao titulo="Página não encontrada" />} />
    </Routes>
  );
}
