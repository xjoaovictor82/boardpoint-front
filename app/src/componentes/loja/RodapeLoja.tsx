import { Link } from 'react-router-dom';

const HORARIOS: readonly (readonly [string, string])[] = [
  ['Domingo', 'Fechado'],
  ['Segunda-feira', '09:00–18:00'],
  ['Terça-feira', '09:00–18:00'],
  ['Quarta-feira', '09:00–18:00'],
  ['Quinta-feira', '09:00–18:00'],
  ['Sexta-feira', '09:00–18:00'],
  ['Sábado', '09:00–13:00'],
];

interface Props {
  aoAbrirContato?: () => void;
}

export function RodapeLoja({ aoAbrirContato }: Props) {
  return (
    <footer className="rodape">
      <div className="rodape__wrap">
        <div>
          <div className="rodape__marca">
            <img src="/assets/img/logo.jpg" alt="Logo Board Point" />
            <span>Board Point</span>
          </div>
          <div className="rodape__endereco">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Av. Manoel Mendes de Camargo, 1352 — Campo Mourão/PR</span>
          </div>

          <div className="rodape__redes">
            <a
              className="rodape__insta"
              href="https://www.instagram.com/board_point/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <span>@board_point</span>
            </a>

            <button type="button" className="rodape__contato" id="botaoContato" onClick={aoAbrirContato}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <span>Fale conosco</span>
            </button>
          </div>

          <div className="rodape__horarios">
            <p className="rodape__horarios-titulo">Horário de funcionamento</p>
            <ul>
              {HORARIOS.map(([dia, horario]) => (
                <li key={dia}>
                  <span>{dia}</span>
                  <span>{horario}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <iframe
          className="rodape__mapa"
          src="https://www.google.com/maps?q=Av.+Manoel+Mendes+de+Camargo,+1352,+Campo+Mour%C3%A3o+-+PR&output=embed"
          title="Localização Board Point no mapa"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="rodape__base">
        © {new Date().getFullYear()} Board Point — todos os direitos reservados.{' '}
        <Link to="/admin/login" className="rodape__admin">
          Admin
        </Link>
      </p>
    </footer>
  );
}
