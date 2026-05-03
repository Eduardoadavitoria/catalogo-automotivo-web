/*
  Lógica inicial do projeto
*/

const veiculos = [
  {
    id: 1,
    marca: "Volkswagen",
    modelo: "Gol",
    ano: 2020,
    preco: 45000
  },
  {
    id: 2,
    marca: "Fiat",
    modelo: "Uno",
    ano: 2010,
    preco: 30000
  }
];

function renderizarVeiculos(lista) {
  const galeria = document.getElementById("galeriaVeiculos");
  const semResultados = document.getElementById("semResultados");

  galeria.innerHTML = "";

  if (lista.length === 0) {
    semResultados.style.display = "block";
    return;
  }

  semResultados.style.display = "none";

  lista.forEach(function (v) {
    const card = document.createElement("div");
    card.classList.add("card-veiculo");

    card.innerHTML = `
      <h3>${v.marca} ${v.modelo}</h3>
      <p>Ano: ${v.ano}</p>
      <p>Preço: R$ ${v.preco}</p>
    `;

    galeria.appendChild(card);
  });
}

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

document.addEventListener("DOMContentLoaded", function () {
  renderizarVeiculos(veiculos);

  document
    .getElementById("campoBusca")
    .addEventListener("input", filtrarVeiculos);
});