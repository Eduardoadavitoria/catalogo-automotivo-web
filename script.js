const veiculos = [
  {
    id: 1,
    marca: "Volkswagen",
    modelo: "Passat 2.0 TSI Highline",
    ano: 2021,
    quilometragem: 38000,
    preco: 148900,
    imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    descricao: "Sedã premium com motorização turbo e acabamento refinado."
  },

  {
    id: 2,
    marca: "Toyota",
    modelo: "Corolla XEi 2.0",
    ano: 2022,
    quilometragem: 22000,
    preco: 139900,
    imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80",
    descricao: "Sedã confortável, econômico e extremamente confiável."
  },

  {
    id: 3,
    marca: "Honda",
    modelo: "Civic Touring Turbo",
    ano: 2023,
    quilometragem: 11500,
    preco: 165000,
    imagem: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
    descricao: "Tecnologia, desempenho e sofisticação em um único veículo."
  },

  {
    id: 4,
    marca: "Jeep",
    modelo: "Compass Limited",
    ano: 2022,
    quilometragem: 28000,
    preco: 154900,
    imagem: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
    descricao: "SUV moderno com excelente desempenho e conforto."
  }
];

function formatarMoeda(valor){
  return valor.toLocaleString("pt-BR",{
    style:"currency",
    currency:"BRL",
    minimumFractionDigits:0
  });
}

function formatarKm(km){
  return km.toLocaleString("pt-BR") + " km";
}

function gerarCardHTML(v){

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">

      <div class="vehicle-card">

        <div class="card-img-wrapper">

          <img src="${v.imagem}" alt="${v.modelo}" />

          <span class="card-badge">
            ${v.marca}
          </span>

        </div>

        <div class="card-body-custom">

          <h3 class="card-modelo">
            ${v.modelo}
          </h3>

          <div class="card-specs">

            <span class="spec-item">
              <i class="bi bi-calendar3"></i>
              ${v.ano}
            </span>

            <span class="spec-item">
              <i class="bi bi-speedometer2"></i>
              ${formatarKm(v.quilometragem)}
            </span>

          </div>

          <div class="card-divider"></div>

          <div class="card-footer-custom">

            <div>
              <span class="card-price">
                ${formatarMoeda(v.preco)}
              </span>
            </div>

            <button class="btn-card" onclick="abrirModal(${v.id})">
              Detalhes
            </button>

          </div>

        </div>

      </div>

    </div>
  `;
}

function renderizarVeiculos(lista){

  const galeria = document.getElementById("galeriaVeiculos");

  galeria.innerHTML = lista.map(gerarCardHTML).join("");
}

function filtrarVeiculos(){

  const termo = document
    .getElementById("campoBusca")
    .value
    .toLowerCase();

  const filtrados = veiculos.filter(v =>

    v.marca.toLowerCase().includes(termo) ||
    v.modelo.toLowerCase().includes(termo) ||
    String(v.ano).includes(termo)

  );

  renderizarVeiculos(filtrados);
}

function abrirModal(id){

  const v = veiculos.find(veiculo => veiculo.id === id);

  if(!v) return;

  document.getElementById("modalVeiculoLabel").textContent =
    `${v.marca} ${v.modelo}`;

  document.getElementById("modalVeiculoBody").innerHTML = `

    <img
      src="${v.imagem}"
      class="w-100 rounded mb-4"
      style="height:300px;object-fit:cover;"
    >

    <h4 class="mb-3">
      ${formatarMoeda(v.preco)}
    </h4>

    <p>${v.descricao}</p>

    <a
      href="https://wa.me/5527999999999"
      target="_blank"
      class="btn btn-primary-custom mt-3"
    >
      Chamar no WhatsApp
    </a>
  `;

  const modal = new bootstrap.Modal(
    document.getElementById("modalVeiculo")
  );

  modal.show();
}

document.addEventListener("DOMContentLoaded", () => {

  renderizarVeiculos(veiculos);

  document
    .getElementById("campoBusca")
    .addEventListener("input", filtrarVeiculos);

  console.log("✅ ADG Veículos carregado com sucesso.");
});