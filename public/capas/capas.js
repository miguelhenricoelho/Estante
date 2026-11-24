import { esc, hash } from '../util/util.js';

// [fundo, texto, ornamento]
const PALETAS = [
  ['#1F3B2D', '#ECE4CC', '#D9A441'], // floresta
  ['#6B1F24', '#F2E5D0', '#E8B04B'], // vinho
  ['#1C2742', '#E9E2CF', '#E2603A'], // tinta azul
  ['#C4552B', '#F7ECDD', '#2A1B14'], // terracota
  ['#DCCBA8', '#2B2118', '#A23B24'], // pergaminho
  ['#2E3436', '#E7E0CC', '#A3B86C'], // ardósia
  ['#4A2742', '#F1E3D7', '#E7A27C'], // ameixa
  ['#B98A2E', '#1E1A12', '#F4EAD4'], // ocre
  ['#151613', '#ECE5D3', '#F2552C'], // nanquim
  ['#7A8B5A', '#1A1C12', '#F1E7CF']  // musgo
];

const ORNAMENTOS = [
  // sol nascente
  () => `<circle cx="140" cy="250" r="72" fill="currentColor"/>
         <path d="M0 252h200M0 266h200M0 280h200" stroke="var(--capa-fundo)" stroke-width="5"/>`,
  // anéis
  () => `<g fill="none" stroke="currentColor" stroke-width="2.4">
           ${[18, 34, 50, 66, 82, 98].map((r) => `<circle cx="168" cy="262" r="${r}"/>`).join('')}
         </g>`,
  // faixas diagonais
  () => `<g stroke="currentColor" stroke-width="7">
           ${Array.from({ length: 9 }, (_, i) => `<path d="M${-60 + i * 26} 300 L${40 + i * 26} 180"/>`).join('')}
         </g>`,
  // grade de pontos
  () => `<g fill="currentColor">
           ${Array.from({ length: 6 * 5 }, (_, i) => `<circle cx="${30 + (i % 6) * 28}" cy="${176 + Math.floor(i / 6) * 26}" r="3.4"/>`).join('')}
         </g>`,
  // arco
  () => `<path d="M38 300V218a62 62 0 0 1 124 0V300z" fill="currentColor"/>
         <path d="M64 300V222a36 36 0 0 1 72 0V300" fill="none" stroke="var(--capa-fundo)" stroke-width="4"/>`,
  // losangos
  () => `<g fill="none" stroke="currentColor" stroke-width="3">
           <path d="M100 168 172 240 100 312 28 240z"/>
           <path d="M100 196 144 240 100 284 56 240z"/>
           <path d="M100 222 118 240 100 258 82 240z" fill="currentColor"/>
         </g>`
];

const URL_VALIDA = /^(https?:\/\/|data:image\/)/i;

/**
 * Cria a capa de um livro. Se houver URL de imagem válida ela é usada;
 * caso contrário (ou se falhar), a capa tipográfica gerada fica visível.
 */
export function criarCapa(livro, { tamanho = 'm' } = {}) {
  const semente = hash(`${livro.nome ?? ''}|${livro.autor ?? ''}`);
  const [fundo, texto, ornamento] = PALETAS[semente % PALETAS.length];
  const desenho = ORNAMENTOS[(semente >>> 5) % ORNAMENTOS.length];

  const capa = document.createElement('div');
  capa.className = `capa capa--${tamanho}`;
  capa.style.setProperty('--capa-fundo', fundo);
  capa.style.setProperty('--capa-texto', texto);
  capa.style.setProperty('--capa-orn', ornamento);

  capa.innerHTML = `
    <svg class="capa-ornamento" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${desenho()}</svg>
    <div class="capa-miolo">
      <span class="capa-categoria">${esc(livro.categoria || 'Livro')}</span>
      <strong class="capa-titulo">${esc(livro.nome || 'Sem título')}</strong>
      <span class="capa-autor">${esc(livro.autor || 'Autor desconhecido')}</span>
    </div>
  `;

  const url = String(livro.imagem ?? '').trim();
  if (URL_VALIDA.test(url)) {
    const img = new Image();
    img.className = 'capa-img';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('load', () => capa.classList.add('capa--com-imagem'));
    img.addEventListener('error', () => img.remove());
    img.src = url;
    capa.append(img);
  }

  return capa;
}
