import { estado, observar, categorias, autores } from '../estado/estado.js';
import { criarCapa } from '../capas/capas.js';
import { ano } from '../util/util.js';

const numeros = document.getElementById('hero-numeros');
const leque = document.getElementById('hero-leque');

let assinaturaLeque = '';

function intervaloAnos(livros) {
  const anos = livros.map((l) => Number(ano(l.data_publicacao))).filter(Boolean);
  if (!anos.length) return '—';
  const min = Math.min(...anos);
  const max = Math.max(...anos);
  return min === max ? String(min) : `${min}<span>–</span>${max}`;
}

function render() {
  const { livros, carregando } = estado;
  const traco = '<span class="hero-num-traco"></span>';

  const itens = [
    ['Livros', carregando ? traco : livros.length],
    ['Autores', carregando ? traco : autores().length],
    ['Categorias', carregando ? traco : categorias().length],
    ['Publicações', carregando ? traco : intervaloAnos(livros)]
  ];

  numeros.innerHTML = itens.map(([rotulo, valor]) => `
    <div class="hero-num">
      <dt>${rotulo}</dt>
      <dd>${valor}</dd>
    </div>`).join('');

  const tres = [...livros]
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
    .slice(0, 3);
  const assinatura = tres.map((l) => l.id ?? l.nome).join('|');
  if (assinatura === assinaturaLeque) return;
  assinaturaLeque = assinatura;

  leque.replaceChildren(...tres.map((livro, i) => {
    const capa = criarCapa(livro, { tamanho: 'g' });
    capa.style.setProperty('--n', i);
    return capa;
  }));
}

export function iniciarHero() {
  observar(render);
  render();
}
