// QRCode.js (carregado por <script> no index.html) não tem tipos oficiais:
// declaração mínima para o compilador aceitar `new QRCode(...)`.
declare class QRCode {
  constructor(
    elemento: HTMLElement,
    opcoes: {
      text: string;
      width: number;
      height: number;
      colorDark: string;
      colorLight: string;
    }
  );
}
