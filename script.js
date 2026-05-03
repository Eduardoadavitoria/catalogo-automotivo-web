/*
  ============================================================
  MOSTRUÁRIO DE VEÍCULOS
  Arquivo: script.js

  Descrição: Lógica inicial do projeto
  ============================================================
*/

/* Dados simples (mock inicial) */
const veiculos = [
  {
    id: 1,
    marca: "Volkswagen",
    modelo: "Gol",
    ano: 2020
  },
  {
    id: 2,
    marca: "Fiat",
    modelo: "Uno",
    ano: 2018
  }
];

/* Função para mostrar veículos na tela */
function renderizarVeiculos(lista) {
  const galeria = document.getElementById("galeriaVeiculos");

  galeria.innerHTML = "";

  lista.forEach(function (v) {
    const item = document.createElement("div");

    item.textContent = v.marca + " " + v.modelo + " - " + v.ano;

    galeria.appendChild(item);
  });
}

/* Função de busca simples */
function filtrarVeiculos() {
  const termo = document.getElementById("campoBusca").value.toLowerCase();

  const resultado = veiculos.filter(function (v) {
    return (
      v.marca.toLowerCase().includes(termo) ||
      v.modelo.toLowerCase().includes(termo) ||
      String(v.ano).includes(termo)
    );
  });

  renderizarVeiculos(resultado);
}

/* Inicialização */
document.addEventListener("DOMContentLoaded", function () {

  // Mostra todos os veículos ao carregar
  renderizarVeiculos(veiculos);

  // Evento de busca
  const campoBusca = document.getElementById("campoBusca");
  campoBusca.addEventListener("input", filtrarVeiculos);

});

/*
  TODO:
  - Melhorar layout dos veículos (cards)
  - Adicionar mais dados (preço, imagem, etc.)
  - Criar modal de detalhes
  - Melhorar filtro de busca
*/