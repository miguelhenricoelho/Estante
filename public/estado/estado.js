import { normalizar } from '../util/util.js';

const ouvintes = new Set();

export const estado = {
  livros: [],
  busca: '',
  categoria: 'todas',
  ordem: 'recentes',
  carregando: true,
  erro: null,
  destaque: null
};

export function atualizar(parcial) {
  Object.assign(estado, parcial);
  ouvintes.forEach((fn) => fn(estado));
}

export function observar(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

const porTexto = (campo) => (a, b) =>
  String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''), 'pt-BR', { sensitivity: 'base' });

const porData = (dir) => (a, b) => {
  const da = a.data_publicacao ? Date.parse(a.data_publicacao) : null;
  const db = b.data_publicacao ? Date.parse(b.data_publicacao) : null;
  if (da === null && db === null) return 0;
  if (da === null) return 1;
  if (db === null) return -1;
  return (da - db) * dir;
};

const ORDENS = {
  recentes: (a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || (b.id ?? 0) - (a.id ?? 0),
  titulo: porTexto('nome'),
  autor: (a, b) => porTexto('autor')(a, b) || porTexto('nome')(a, b),
  antigos: porData(1),
  novos: porData(-1)
};

export function livrosVisiveis() {
  const termo = normalizar(estado.busca);
  const categoria = normalizar(estado.categoria);

  return estado.livros
    .filter((l) => estado.categoria === 'todas' || normalizar(l.categoria) === categoria)
    .filter((l) => !termo || normalizar(`${l.nome} ${l.autor}`).includes(termo))
    .sort(ORDENS[estado.ordem] ?? ORDENS.recentes);
}

/** Categorias únicas (sem diferenciar acentos/maiúsculas) com contagem. */
export function categorias() {
  const mapa = new Map();
  for (const livro of estado.livros) {
    if (!livro.categoria) continue;
    const chave = normalizar(livro.categoria);
    const item = mapa.get(chave) ?? { nome: livro.categoria.trim(), total: 0 };
    item.total++;
    mapa.set(chave, item);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function autores() {
  const mapa = new Map();
  for (const l of estado.livros) if (l.autor) mapa.set(normalizar(l.autor), l.autor.trim());
  return [...mapa.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
