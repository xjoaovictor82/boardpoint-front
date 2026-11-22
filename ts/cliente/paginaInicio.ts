import { obterElemento } from "../utilitarios/dom.js";
import { BarraConta } from "./BarraConta.js";

// Ponto de entrada extra da vitrine: só liga a barra "Entrar | Cadastrar".
new BarraConta(obterElemento("barraConta"));