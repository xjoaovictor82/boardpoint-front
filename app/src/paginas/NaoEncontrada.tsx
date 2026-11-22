import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  return (
    <main className="container-fluid" style={{ padding: "80px 16px", textAlign: "center" }}>
      <div className="vazio">
        <strong>Página não encontrada</strong>
        <Link to="/">Voltar para a loja</Link>
      </div>
    </main>
  );
}