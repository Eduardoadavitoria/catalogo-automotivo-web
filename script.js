/*
  ============================================================
  MOSTRUÁRIO DE VEÍCULOS — ADGVeiculos
  Arquivo: script.js
  
  SISTEMA DE TEMAS:
  - Lê o tema salvo no localStorage ao carregar
  - Aplica via data-theme no <html>
  - Botão #btnTema alterna entre "dark" e "light"
  - Preferência persiste entre visitas
  ============================================================
*/

/* ============================================================
   GERENCIAMENTO DE TEMA DARK / LIGHT
============================================================ */

/**
 * Aplica o tema ao atributo data-theme do <html>.
 * O CSS detecta esse atributo e troca todas as variáveis.
 */
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("ADGVEICULOS_tema", tema);
}

/**
 * Alterna entre "dark" e "light" ao clicar no botão.
 * A animação "themePop" é adicionada e removida via classe
 * para disparar o keyframe a cada clique.
 */
function alternarTema() {
  const atual = document.documentElement.getAttribute("data-theme") || "dark";
  const novo  = atual === "dark" ? "light" : "dark";

  // Dispara animação no ícone
  const btn = document.getElementById("btnTema");
  btn.classList.remove("btn-tema-pop");
  void btn.offsetWidth; // force reflow para reiniciar a animação
  btn.classList.add("btn-tema-pop");

  aplicarTema(novo);
}

// Aplica o tema salvo ANTES de qualquer renderização
// (colocado no topo para evitar flash de tema errado)
(function () {
  const temaSalvo = localStorage.getItem("ADGVEICULOS_tema") || "dark";
  document.documentElement.setAttribute("data-theme", temaSalvo);
})();

/* ============================================================
   CHAVE DO LOCALSTORAGE
   Mesma chave usada pelo admin.js — é assim que os dois
   arquivos compartilham os dados sem um servidor.
============================================================ */
const STORAGE_KEY = "ADGVEICULOS_veiculos";

/* ============================================================
   BANCO DE DADOS PADRÃO (SEED)
   Usado apenas se o localStorage estiver vazio (primeira visita).
   Após o admin salvar qualquer alteração, esses dados são
   substituídos pelo que está no localStorage.
============================================================ */
const veiculosSeed = [
  { id: 1, oculto: false, marca: "Volkswagen", modelo: "Passat 2.0 TSI Highline",  ano: 2021, quilometragem: 38000,  preco: 148900, imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", fotos: [], descricao: "Sedã premium com motorização turbo flex, bancos em couro, painel digital e tecnologia de assistência ao condutor. Revisões em dia na concessionária autorizada." },
  { id: 2, oculto: false, marca: "Toyota",     modelo: "Corolla XEi 2.0",          ano: 2022, quilometragem: 22000,  preco: 139900, imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80", fotos: [], descricao: "Um dos sedãs mais confiáveis do mercado. Câmbio automático CVT, multimídia com Android Auto e Apple CarPlay, sensor de estacionamento traseiro e câmera de ré." },
  { id: 3, oculto: false, marca: "Honda",      modelo: "Civic Touring Turbo",       ano: 2023, quilometragem: 11500,  preco: 165000, imagem: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80", fotos: [], descricao: "Honda Sensing completo com frenagem automática de emergência, controle de cruzeiro adaptativo e alerta de colisão frontal. Teto solar panorâmico." },
  { id: 4, oculto: false, marca: "Chevrolet",  modelo: "Onix Plus Premier",         ano: 2022, quilometragem: 31000,  preco: 94900,  imagem: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", fotos: [], descricao: "Sedã compacto com câmbio automático de 6 velocidades, multimídia Mylink de 8 polegadas, sistema de som premium Bose e ar-condicionado automático bizona." },
  { id: 5, oculto: false, marca: "Jeep",       modelo: "Compass Limited T270",      ano: 2021, quilometragem: 47000,  preco: 159900, imagem: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80", fotos: [], descricao: "SUV 5 lugares com tração 4x4 inteligente, suspensão traseira multilink, bancos em couro com ajuste elétrico e teto solar panorâmico." },
  { id: 6, oculto: false, marca: "Hyundai",    modelo: "HB20S Platinum Plus",       ano: 2023, quilometragem: 9800,   preco: 87500,  imagem: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80", fotos: [], descricao: "Sedã compacto 1.6 automático com novo design externo, câmera de ré e multimídia 10.25 polegadas com espelhamento sem fio." },
  { id: 7, oculto: false, marca: "Ford",       modelo: "Territory Titanium",        ano: 2022, quilometragem: 28500,  preco: 142000, imagem: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80", fotos: [], descricao: "SUV médio com transmissão automática CVT, SYNC 3 com tela sensível ao toque de 8 polegadas e assistente de frenagem de emergência." },
  { id: 8, oculto: false, marca: "Volkswagen", modelo: "T-Cross Highline 1.4",      ano: 2023, quilometragem: 15300,  preco: 128900, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80", fotos: [], descricao: "SUV compacto com motor 1.4 turbo de 150cv, painel digital Active Info Display e câmera de ré 180°." }
];

/* ============================================================
   FUNÇÃO: LER VEÍCULOS
   Lê do localStorage. Se vazio, usa o seed e o salva
   para que o admin possa editá-los futuramente.
============================================================ */
function lerVeiculos() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) return JSON.parse(dados);
  } catch (e) { /* ignora erros de parse */ }
  // Primeira visita: persiste o seed e retorna
  localStorage.setItem(STORAGE_KEY, JSON.stringify(veiculosSeed));
  return veiculosSeed;
}

/* ============================================================
   FUNÇÕES AUXILIARES DE FORMATAÇÃO
============================================================ */
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 0
  });
}

function formatarKm(km) {
  return Number(km).toLocaleString("pt-BR") + " km";
}

/* ============================================================
   GERAÇÃO DO CARD
   Cada card mostra a foto principal. Se o veículo tiver fotos
   adicionais, exibe um badge "N fotos" sobre a imagem.
============================================================ */
function gerarCardHTML(v) {
  // Monta lista completa de fotos: foto principal + extras
  const todasFotos = [v.imagem, ...(v.fotos || [])].filter(Boolean);
  const qtdFotos   = todasFotos.length;
  const badgeFotos = qtdFotos > 1
    ? `<span class="card-badge-fotos"><i class="bi bi-images"></i> ${qtdFotos} fotos</span>`
    : "";

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="vehicle-card" data-id="${v.id}">
        <div class="card-img-wrapper">
          <img src="${v.imagem}" alt="Foto do veículo ${v.marca} ${v.modelo}" loading="lazy"
               onerror="this.src='https://placehold.co/400x210/1e2130/555e78?text=sem+foto'" />
          <span class="card-badge">${v.marca}</span>
          ${badgeFotos}
        </div>
        <div class="card-body-custom">
          <h3 class="card-modelo">${v.modelo}</h3>
          <div class="card-specs">
            <span class="spec-item"><i class="bi bi-calendar3"></i> ${v.ano}</span>
            <span class="spec-item"><i class="bi bi-speedometer2"></i> ${formatarKm(v.quilometragem)}</span>
          </div>
          <div class="card-divider"></div>
          <div class="card-footer-custom">
            <div>
              <span class="card-price-label">Preço</span>
              <span class="card-price">${formatarMoeda(v.preco)}</span>
            </div>
            <button class="btn-card" onclick="abrirModal(${v.id})">
              Ver Detalhes <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   RENDERIZAR VEÍCULOS
   Mostra apenas veículos com oculto !== true
============================================================ */
function renderizarVeiculos(lista) {
  const galeria      = document.getElementById("galeriaVeiculos");
  const semResultados = document.getElementById("semResultados");
  // Filtra veículos ocultos pelo admin
  const visiveis = lista.filter(v => !v.oculto);

  if (visiveis.length === 0) {
    galeria.innerHTML = "";
    semResultados.classList.remove("d-none");
    return;
  }
  semResultados.classList.add("d-none");
  galeria.innerHTML = visiveis.map(gerarCardHTML).join("");
}

/* ============================================================
   FILTRAR VEÍCULOS (Busca em Tempo Real)
   Lê sempre do localStorage para pegar dados atualizados.
============================================================ */
function filtrarVeiculos() {
  const termo = document.getElementById("campoBusca").value
    .toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

  const todos = lerVeiculos();
  const resultado = todos.filter(v => {
    const campos = [v.marca, v.modelo, String(v.ano)].join(" ")
      .toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return campos.includes(termo);
  });

  renderizarVeiculos(resultado);
}

/* ============================================================
   MODAL DE DETALHES COM GALERIA DE FOTOS
   Mostra um carrossel se houver mais de uma foto.
============================================================ */
function abrirModal(id) {
  const lista = lerVeiculos();
  const v = lista.find(veiculo => veiculo.id === id);
  if (!v) return;

  document.getElementById("modalVeiculoLabel").textContent = v.marca + " " + v.modelo;

  // Monta a lista completa de fotos
  const todasFotos = [v.imagem, ...(v.fotos || [])].filter(Boolean);

  // Gera o carrossel Bootstrap se tiver múltiplas fotos, ou img simples
  let galeriaHTML = "";
  if (todasFotos.length > 1) {
    const slides = todasFotos.map((foto, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${foto}" class="modal-detail-img d-block w-100"
             alt="Foto ${i+1} — ${v.modelo}"
             onerror="this.src='https://placehold.co/600x260/1e2130/555e78?text=sem+foto'" />
      </div>`).join("");

    const indicadores = todasFotos.map((_, i) => `
      <button type="button" data-bs-target="#galeriaModal" data-bs-slide-to="${i}"
        class="${i === 0 ? "active" : ""}" aria-label="Foto ${i+1}"></button>`).join("");

    galeriaHTML = `
      <div id="galeriaModal" class="carousel slide mb-3" data-bs-ride="false">
        <div class="carousel-indicators modal-carousel-indicators">${indicadores}</div>
        <div class="carousel-inner" style="border-radius:8px; overflow:hidden;">
          ${slides}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#galeriaModal" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#galeriaModal" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
      <p class="modal-foto-contador"><i class="bi bi-images me-1"></i>${todasFotos.length} fotos disponíveis</p>`;
  } else {
    galeriaHTML = `<img src="${v.imagem}" alt="Foto do ${v.marca} ${v.modelo}"
      class="modal-detail-img"
      onerror="this.src='https://placehold.co/600x260/1e2130/555e78?text=sem+foto'" />`;
  }

  document.getElementById("modalVeiculoBody").innerHTML = `
    ${galeriaHTML}
    <div class="modal-specs-grid">
      <div class="modal-spec-box"><span>Marca</span><strong>${v.marca}</strong></div>
      <div class="modal-spec-box"><span>Modelo</span><strong>${v.modelo}</strong></div>
      <div class="modal-spec-box"><span>Ano de Fabricação</span><strong>${v.ano}</strong></div>
      <div class="modal-spec-box"><span>Quilometragem</span><strong>${formatarKm(v.quilometragem)}</strong></div>
    </div>
    <p style="color:var(--color-text-secondary);font-size:0.92rem;margin-bottom:1.25rem;">${v.descricao}</p>
    <div class="modal-price-box">
      <div>
        <span class="modal-price-label">Preço de Venda</span>
        <span class="modal-price-value">${formatarMoeda(v.preco)}</span>
      </div>
      <a href="https://wa.me/5527999999999?text=${encodeURIComponent('Olá! Tenho interesse no ' + v.marca + ' ' + v.modelo + ' ' + v.ano + '. Ainda está disponível?')}"
         target="_blank" rel="noopener noreferrer" class="btn btn-primary-custom">
        <i class="bi bi-whatsapp me-2"></i> Tenho Interesse
      </a>
    </div>`;

  new bootstrap.Modal(document.getElementById("modalVeiculo")).show();
}

/* ============================================================
   INICIALIZAÇÃO
============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  // Carrega veículos do localStorage (ou seed) e renderiza
  renderizarVeiculos(lerVeiculos());

  // Busca em tempo real
  document.getElementById("campoBusca").addEventListener("input", filtrarVeiculos);

  // Botão de alternância de tema
  const btnTema = document.getElementById("btnTema");
  if (btnTema) {
    btnTema.addEventListener("click", alternarTema);
  }

  console.log("✅ ADGveiculos inicializado. Dados lidos do localStorage.");
});
