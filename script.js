/*
  ============================================================
  MOSTRUÁRIO DE VEÍCULOS — AutoPrime
  Versão corrigida com imagens estáveis
  ============================================================
*/

const veiculos = [
  {
    id: 1,
    marca: "Volkswagen",
    modelo: "Passat",
    ano: 2021,
    quilometragem: 38000,
    preco: 148900,
    imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"
  },
  {
    id: 2,
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2022,
    quilometragem: 22000,
    preco: 139900,
    imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80"
  },
  {
    id: 3,
    marca: "Honda",
    modelo: "Civic",
    ano: 2023,
    quilometragem: 11500,
    preco: 165000,
    imagem: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"
  },
  {
    id: 4,
    marca: "Chevrolet",
    modelo: "Onix",
    ano: 2022,
    quilometragem: 31000,
    preco: 94900,
    imagem: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80"
  }
];

/* FORMATAR */
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0
  });
}

function formatarKm(km) {
  return km.toLocaleString("pt-BR") + " km";
}

/* CARD */
function gerarCardHTML(v) {
  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="vehicle-card">

        <div class="card-img-wrapper">
          <img
            src="${v.imagem}"
            alt="${v.modelo}"
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'"
          />

          <span class="img-teste-tag">imagem teste</span>
          <span class="card-badge">${v.marca}</span>
        </div>

        <div class="card-body-custom">
          <h3 class="card-modelo">${v.modelo}</h3>

          <div class="card-specs">
            <span class="spec-item">${v.ano}</span>
            <span class="spec-item">${formatarKm(v.quilometragem)}</span>
          </div>

          <div class="card-divider"></div>

          <div class="card-footer-custom">
            <span class="card-price">${formatarMoeda(v.preco)}</span>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* RENDER */
function renderizarVeiculos(lista) {
  const galeria = document.getElementById("galeriaVeiculos");
  if (!galeria) return;
  galeria.innerHTML = lista.map(gerarCardHTML).join("");
}

/* BUSCA */
function filtrarVeiculos() {
  const termo = document.getElementById("campoBusca").value.toLowerCase();

  const filtrados = veiculos.filter(v =>
    v.marca.toLowerCase().includes(termo) ||
    v.modelo.toLowerCase().includes(termo) ||
    String(v.ano).includes(termo)
  );

  renderizarVeiculos(filtrados);
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  renderizarVeiculos(veiculos);

  const campo = document.getElementById("campoBusca");
  if (campo) {
    campo.addEventListener("input", filtrarVeiculos);
  }

  console.log("✅ Projeto funcionando com imagens corrigidas");
});