/*
  ============================================================
  ADGVEICULOS — Painel Administrativo
  Arquivo: admin.js
  Descrição:
    1. Autenticação (CPF + Senha) com sessionStorage
    2. CRUD completo com localStorage (sincronizado com index.html)
    3. Suporte a múltiplas fotos por veículo
    4. Opção de ocultar/exibir veículo no site público
    5. Dashboard com estatísticas dinâmicas
  ============================================================
*/

/* ============================================================
   CONFIGURAÇÕES
============================================================ */
const CREDENCIAIS  = { cpf: "000.000.000-00", senha: "1234" };
const STORAGE_KEY  = "ADGVEICULOS_veiculos";   // Mesma chave do script.js
const SESSION_KEY  = "ADGVEICULOS_admin_logado";

let idParaExcluir = null;
let modoFormulario = "novo";

/* ============================================================
   SEED INICIAL — mesmo que o script.js do site
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
   PERSISTÊNCIA
============================================================ */
function lerVeiculos() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) return JSON.parse(dados);
  } catch (e) {}
  salvarVeiculos(veiculosSeed);
  return JSON.parse(JSON.stringify(veiculosSeed));
}

function salvarVeiculos(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function gerarNovoId(lista) {
  return lista.length === 0 ? 1 : Math.max(...lista.map(v => v.id)) + 1;
}

/* ============================================================
   FORMATAÇÃO
============================================================ */
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}
function formatarKm(km) {
  return Number(km).toLocaleString("pt-BR") + " km";
}

/* ============================================================
   AUTENTICAÇÃO
============================================================ */
function formatarCPF(valor) {
  const d = valor.replace(/\D/g, "").substring(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, "$1.$2");
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

function tentarLogin() {
  const cpf   = document.getElementById("inputCPF").value.trim();
  const senha = document.getElementById("inputSenha").value;
  if (cpf === CREDENCIAIS.cpf && senha === CREDENCIAIS.senha) {
    sessionStorage.setItem(SESSION_KEY, "true");
    exibirPainel();
  } else {
    const el = document.getElementById("erroLogin");
    el.classList.add("visivel");
    setTimeout(() => el.classList.remove("visivel"), 3000);
  }
}

function exibirPainel() {
  document.getElementById("telaLogin").style.display   = "none";
  document.getElementById("painelAdmin").style.display = "block";
  atualizarDashboard();
  renderizarTabela(lerVeiculos());
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById("painelAdmin").style.display = "none";
  document.getElementById("telaLogin").style.display   = "flex";
  document.getElementById("inputCPF").value   = "";
  document.getElementById("inputSenha").value = "";
}

/* ============================================================
   NAVEGAÇÃO ENTRE ABAS
============================================================ */
function ativarAba(nomeTab) {
  document.querySelectorAll(".tab-pane-admin").forEach(el => el.classList.remove("ativo"));
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(el => el.classList.remove("ativo"));
  document.getElementById("tab-" + nomeTab).classList.add("ativo");
  const link = document.querySelector(`.sidebar-link[data-tab="${nomeTab}"]`);
  if (link) link.classList.add("ativo");
  const titulos = { dashboard: "Dashboard", veiculos: "Gerenciar Veículos" };
  document.getElementById("topbarTitulo").textContent = titulos[nomeTab] || nomeTab;
  document.getElementById("sidebar").classList.remove("aberta");
}

/* ============================================================
   DASHBOARD
============================================================ */
function atualizarDashboard() {
  const lista    = lerVeiculos();
  const visiveis = lista.filter(v => !v.oculto);

  document.getElementById("statTotal").textContent   = lista.length;
  document.getElementById("statVisiveis").textContent = visiveis.length;
  document.getElementById("statOcultos").textContent  = lista.length - visiveis.length;

  if (lista.length > 0) {
    const media = lista.reduce((a, v) => a + Number(v.preco), 0) / lista.length;
    document.getElementById("statMedia").textContent = formatarMoeda(media);
  } else {
    document.getElementById("statMedia").textContent = "—";
  }

  const ultimos = [...lista].slice(-5).reverse();
  const container = document.getElementById("resumoUltimos");
  if (ultimos.length === 0) {
    container.innerHTML = `<p style="color:var(--color-text-muted);font-size:.85rem;padding:1rem 0">Nenhum veículo cadastrado ainda.</p>`;
    return;
  }
  container.innerHTML = ultimos.map(v => `
    <div style="display:flex;align-items:center;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--color-border)">
      <img src="${v.imagem}" style="width:56px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--color-border);flex-shrink:0"
           onerror="this.src='https://placehold.co/56x40/1e2130/555e78?text=foto'" />
      <div style="flex:1;min-width:0">
        <div style="font-family:var(--font-display);font-weight:700;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${v.marca} ${v.modelo}
        </div>
        <div style="font-size:.75rem;color:var(--color-text-muted)">${v.ano} &bull; ${formatarKm(v.quilometragem)}
          ${v.oculto ? '<span style="color:#e07a2a;margin-left:.4rem"><i class="bi bi-eye-slash-fill"></i> Oculto</span>' : ''}
        </div>
      </div>
      <div style="font-family:var(--font-display);font-size:1rem;font-weight:800;color:var(--color-gold);white-space:nowrap">${formatarMoeda(v.preco)}</div>
    </div>`).join("");
}

/* ============================================================
   TABELA DE VEÍCULOS
============================================================ */
function renderizarTabela(lista) {
  const tbody   = document.getElementById("tabelaCorpo");
  const vazia   = document.getElementById("tabelaVazia");
  if (lista.length === 0) {
    tbody.innerHTML = "";
    vazia.classList.remove("d-none");
    return;
  }
  vazia.classList.add("d-none");

  tbody.innerHTML = lista.map(v => {
    const qtdFotos = 1 + (v.fotos ? v.fotos.length : 0);
    const statusOculto = v.oculto
      ? `<span style="color:#e07a2a;font-size:.72rem;font-weight:700"><i class="bi bi-eye-slash-fill me-1"></i>Oculto</span>`
      : `<span style="color:var(--color-success);font-size:.72rem;font-weight:700"><i class="bi bi-eye-fill me-1"></i>Visível</span>`;
    return `
      <tr>
        <td>
          <img src="${v.imagem}" class="table-thumb"
               onerror="this.src='https://placehold.co/56x40/1e2130/555e78?text=foto'" />
        </td>
        <td>
          <span class="table-marca-badge">${v.marca}</span><br/>
          <span class="table-modelo">${v.modelo}</span>
        </td>
        <td>${v.ano}</td>
        <td>${formatarKm(v.quilometragem)}</td>
        <td style="color:var(--color-gold);font-family:var(--font-display);font-weight:700">${formatarMoeda(v.preco)}</td>
        <td>
          <span style="font-size:.75rem;color:var(--color-text-muted)">
            <i class="bi bi-images me-1"></i>${qtdFotos}
          </span>
        </td>
        <td>${statusOculto}</td>
        <td>
          <div style="display:flex;gap:.35rem;flex-wrap:wrap">
            <button class="btn-acao btn-editar" onclick="editarVeiculo(${v.id})">
              <i class="bi bi-pencil-fill"></i> Editar
            </button>
            <button class="btn-acao btn-ocultar" onclick="alternarOculto(${v.id})" title="${v.oculto ? 'Exibir no site' : 'Ocultar do site'}">
              <i class="bi ${v.oculto ? 'bi-eye-fill' : 'bi-eye-slash-fill'}"></i>
              ${v.oculto ? 'Exibir' : 'Ocultar'}
            </button>
            <button class="btn-acao btn-excluir" onclick="confirmarExclusao(${v.id}, '${(v.marca + ' ' + v.modelo).replace(/'/g, "\\'")}')">
              <i class="bi bi-trash3-fill"></i> Excluir
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function filtrarTabela() {
  const termo = document.getElementById("buscaTabela").value
    .toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const lista = lerVeiculos().filter(v => {
    const campos = [v.marca, v.modelo, String(v.ano)].join(" ")
      .toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    return campos.includes(termo);
  });
  renderizarTabela(lista);
}

/* ============================================================
   OCULTAR / EXIBIR VEÍCULO
   Alterna o campo "oculto" sem abrir o formulário.
   O site público (script.js) filtra veículos com oculto=true.
============================================================ */
function alternarOculto(id) {
  const lista = lerVeiculos();
  const v = lista.find(x => x.id === id);
  if (!v) return;
  v.oculto = !v.oculto;
  salvarVeiculos(lista);
  mostrarToast(
    v.oculto
      ? `"${v.marca} ${v.modelo}" ocultado do site.`
      : `"${v.marca} ${v.modelo}" está visível no site.`,
    v.oculto ? "aviso" : "sucesso"
  );
  renderizarTabela(lerVeiculos());
  atualizarDashboard();
}

/* ============================================================
   GERENCIAMENTO DE FOTOS EXTRAS
   Array temporário de URLs de fotos adicionais.
   Sincronizado com o campo visual de fotos no formulário.
============================================================ */
let fotosExtras = []; // URLs das fotos adicionais (além da foto principal)

/**
 * Adiciona uma nova URL vazia à lista de fotos extras
 * e renderiza os campos na interface.
 */
function adicionarCampoFoto() {
  fotosExtras.push("");
  renderizarCamposFotos();
}

/**
 * Remove uma foto extra pelo índice.
 */
function removerFoto(index) {
  fotosExtras.splice(index, 1);
  renderizarCamposFotos();
}

/**
 * Atualiza o valor de uma foto extra ao digitar.
 */
function atualizarFoto(index, valor) {
  fotosExtras[index] = valor;
}

/**
 * Renderiza a lista de campos de fotos extras na tela.
 * Cada campo tem: input URL + preview em miniatura + botão remover.
 */
function renderizarCamposFotos() {
  const container = document.getElementById("containerFotosExtras");
  if (fotosExtras.length === 0) {
    container.innerHTML = `
      <p style="color:var(--color-text-muted);font-size:.8rem;font-style:italic">
        Nenhuma foto extra adicionada. Clique em "+ Adicionar Foto" para inserir.
      </p>`;
    return;
  }

  container.innerHTML = fotosExtras.map((url, i) => `
    <div class="foto-extra-row" id="fotoRow_${i}">
      <div class="foto-extra-preview">
        <img
          id="fotoPreview_${i}"
          src="${url || ''}"
          alt="Foto ${i + 2}"
          style="${url ? 'display:block' : 'display:none'}"
          onerror="this.style.display='none'"
        />
        <span class="foto-preview-placeholder" id="fotoPlaceholder_${i}"
              style="${url ? 'display:none' : 'display:flex'}">
          <i class="bi bi-image"></i>
        </span>
      </div>
      <div style="flex:1">
        <label class="f-label">Foto ${i + 2}</label>
        <input
          type="url"
          class="f-input"
          value="${url}"
          placeholder="https://..."
          oninput="atualizarFotoComPreview(${i}, this.value)"
        />
      </div>
      <button type="button" class="btn-remover-foto" onclick="removerFoto(${i})" title="Remover foto">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>`).join("");
}

/**
 * Atualiza o valor e o preview ao digitar com debounce.
 */
let timerFotoExtra = {};
function atualizarFotoComPreview(index, valor) {
  fotosExtras[index] = valor;
  clearTimeout(timerFotoExtra[index]);
  timerFotoExtra[index] = setTimeout(() => {
    const img = document.getElementById(`fotoPreview_${index}`);
    const ph  = document.getElementById(`fotoPlaceholder_${index}`);
    if (!img) return;
    if (!valor) {
      img.style.display = "none";
      if (ph) ph.style.display = "flex";
      return;
    }
    const t = new Image();
    t.onload = () => { img.src = valor; img.style.display = "block"; if (ph) ph.style.display = "none"; };
    t.onerror = () => { img.style.display = "none"; if (ph) ph.style.display = "flex"; };
    t.src = valor;
  }, 600);
}

/* ============================================================
   CRUD
============================================================ */
function salvarVeiculo() {
  const id        = document.getElementById("campoId").value;
  const marca     = document.getElementById("campoMarca").value.trim();
  const modelo    = document.getElementById("campoModelo").value.trim();
  const ano       = parseInt(document.getElementById("campoAno").value, 10);
  const km        = parseInt(document.getElementById("campoKm").value, 10);
  const preco     = parseFloat(document.getElementById("campoPreco").value);
  const imagem    = document.getElementById("campoImagem").value.trim();
  const descricao = document.getElementById("campoDescricao").value.trim();

  if (!marca || !modelo || !ano || isNaN(km) || isNaN(preco) || !imagem || !descricao) {
    mostrarToast("Preencha todos os campos obrigatórios (*) antes de salvar.", "aviso");
    return;
  }
  if (ano < 1990 || ano > 2030) { mostrarToast("Ano inválido. Informe entre 1990 e 2030.", "aviso"); return; }
  if (preco <= 0 || km < 0)     { mostrarToast("Preço e quilometragem devem ser positivos.", "aviso"); return; }

  // Filtra URLs vazias das fotos extras
  const fotosLimpas = fotosExtras.filter(f => f.trim() !== "");

  const veiculo = { marca, modelo, ano, quilometragem: km, preco, imagem, fotos: fotosLimpas, descricao };

  const lista = lerVeiculos();

  if (modoFormulario === "editar" && id) {
    const index = lista.findIndex(v => v.id === parseInt(id, 10));
    if (index !== -1) {
      // Mantém o campo "oculto" original ao editar
      veiculo.id     = parseInt(id, 10);
      veiculo.oculto = lista[index].oculto || false;
      lista[index]   = veiculo;
      salvarVeiculos(lista);
      mostrarToast(`${marca} ${modelo} atualizado com sucesso!`, "sucesso");
    }
  } else {
    veiculo.id     = gerarNovoId(lista);
    veiculo.oculto = false;
    lista.push(veiculo);
    salvarVeiculos(lista);
    mostrarToast(`${marca} ${modelo} adicionado ao estoque!`, "sucesso");
  }

  limparFormulario();
  renderizarTabela(lerVeiculos());
  atualizarDashboard();
}

function editarVeiculo(id) {
  const v = lerVeiculos().find(x => x.id === id);
  if (!v) return;

  modoFormulario = "editar";
  document.getElementById("campoId").value        = v.id;
  document.getElementById("campoMarca").value     = v.marca;
  document.getElementById("campoModelo").value    = v.modelo;
  document.getElementById("campoAno").value       = v.ano;
  document.getElementById("campoKm").value        = v.quilometragem;
  document.getElementById("campoPreco").value     = v.preco;
  document.getElementById("campoImagem").value    = v.imagem;
  document.getElementById("campoDescricao").value = v.descricao;
  document.getElementById("contadorDescricao").textContent = v.descricao.length;

  // Carrega fotos extras
  fotosExtras = v.fotos ? [...v.fotos] : [];
  renderizarCamposFotos();

  atualizarPreview(v.imagem);

  document.getElementById("formTitulo").textContent    = "Editar Veículo";
  document.getElementById("formModoBadge").textContent  = "EDIÇÃO";
  document.getElementById("formModoBadge").style.cssText = "background:rgba(126,179,245,.1);color:#7eb3f5;border-color:rgba(126,179,245,.3)";
  document.getElementById("btnSalvar").innerHTML = '<i class="bi bi-floppy-fill"></i> Atualizar Veículo';
  document.getElementById("btnCancelarEdicao").classList.add("visivel");

  ativarAba("veiculos");
  document.querySelector(".form-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

function confirmarExclusao(id, nome) {
  idParaExcluir = id;
  document.getElementById("confirmMsg").textContent = `Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`;
  document.getElementById("confirmOverlay").classList.add("visivel");
}

function excluirVeiculo() {
  if (idParaExcluir === null) return;
  const novaLista = lerVeiculos().filter(v => v.id !== idParaExcluir);
  salvarVeiculos(novaLista);
  mostrarToast("Veículo removido do estoque.", "erro");
  fecharConfirmacao();
  renderizarTabela(lerVeiculos());
  atualizarDashboard();
  idParaExcluir = null;
}

function fecharConfirmacao() {
  document.getElementById("confirmOverlay").classList.remove("visivel");
  idParaExcluir = null;
}

function limparFormulario() {
  modoFormulario = "novo";
  ["campoId","campoMarca","campoModelo","campoAno","campoKm","campoPreco","campoImagem","campoDescricao"]
    .forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("contadorDescricao").textContent = "0";
  document.getElementById("formTitulo").textContent    = "Adicionar Novo Veículo";
  document.getElementById("formModoBadge").textContent  = "NOVO";
  document.getElementById("formModoBadge").style.cssText = "";
  document.getElementById("btnSalvar").innerHTML = '<i class="bi bi-floppy-fill"></i> Salvar Veículo';
  document.getElementById("btnCancelarEdicao").classList.remove("visivel");
  fotosExtras = [];
  renderizarCamposFotos();
  atualizarPreview("");
}

/* ============================================================
   PREVIEW DA FOTO PRINCIPAL
============================================================ */
function atualizarPreview(url) {
  const img     = document.getElementById("previewImagem");
  const ph      = document.getElementById("previewPlaceholder");
  const wrapper = document.getElementById("previewWrapper");
  if (!url) {
    img.classList.remove("visivel"); img.src = "";
    ph.style.display = "flex"; wrapper.classList.remove("tem-imagem");
    return;
  }
  const t = new Image();
  t.onload  = () => { img.src = url; img.classList.add("visivel"); ph.style.display = "none"; wrapper.classList.add("tem-imagem"); };
  t.onerror = () => { img.classList.remove("visivel"); ph.style.display = "flex"; wrapper.classList.remove("tem-imagem"); };
  t.src = url;
}

/* ============================================================
   TOASTS
============================================================ */
function mostrarToast(mensagem, tipo = "sucesso") {
  const icones = { sucesso: "bi-check-circle-fill", erro: "bi-x-circle-fill", aviso: "bi-exclamation-triangle-fill" };
  const toast = document.createElement("div");
  toast.className = `toast-custom ${tipo}`;
  toast.innerHTML = `<i class="bi ${icones[tipo]} toast-icon"></i><span>${mensagem}</span>`;
  document.getElementById("toastContainer").appendChild(toast);
  setTimeout(() => { toast.style.transition = "opacity .4s"; toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 3500);
}

/* ============================================================
   INICIALIZAÇÃO
============================================================ */
document.addEventListener("DOMContentLoaded", function () {

  // Verifica sessão ativa
  if (sessionStorage.getItem(SESSION_KEY) === "true") exibirPainel();

  // Máscara CPF
  document.getElementById("inputCPF").addEventListener("input", function () { this.value = formatarCPF(this.value); });

  // Login
  document.getElementById("btnEntrar").addEventListener("click", tentarLogin);
  ["inputCPF","inputSenha"].forEach(id => {
    document.getElementById(id).addEventListener("keydown", e => { if (e.key === "Enter") tentarLogin(); });
  });

  // Toggle senha
  document.getElementById("toggleSenha").addEventListener("click", function () {
    const input = document.getElementById("inputSenha");
    const icone = document.getElementById("iconeSenha");
    const vis   = input.type === "password";
    input.type  = vis ? "text" : "password";
    icone.className = vis ? "bi bi-eye-slash" : "bi bi-eye";
  });

  // Abas
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(btn => {
    btn.addEventListener("click", function () { ativarAba(this.dataset.tab); });
  });

  // Menu mobile
  document.getElementById("btnMenuMobile").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("aberta");
  });

  // Logout
  document.getElementById("btnLogout").addEventListener("click", logout);

  // Salvar / cancelar
  document.getElementById("btnSalvar").addEventListener("click", salvarVeiculo);
  document.getElementById("btnCancelarEdicao").addEventListener("click", limparFormulario);

  // Botão de adicionar foto extra
  document.getElementById("btnAdicionarFoto").addEventListener("click", adicionarCampoFoto);

  // Preview foto principal com debounce
  let timerPrev;
  document.getElementById("campoImagem").addEventListener("input", function () {
    clearTimeout(timerPrev);
    timerPrev = setTimeout(() => atualizarPreview(this.value.trim()), 600);
  });

  // Contador descrição
  document.getElementById("campoDescricao").addEventListener("input", function () {
    document.getElementById("contadorDescricao").textContent = this.value.length;
  });

  // Filtro tabela
  document.getElementById("buscaTabela").addEventListener("input", filtrarTabela);

  // Modal de confirmação
  document.getElementById("btnConfirmExcluir").addEventListener("click", excluirVeiculo);
  document.getElementById("btnConfirmCancelar").addEventListener("click", fecharConfirmacao);
  document.getElementById("confirmOverlay").addEventListener("click", function (e) {
    if (e.target === this) fecharConfirmacao();
  });

  // Fecha sidebar ao clicar fora
  document.addEventListener("click", function (e) {
    const s = document.getElementById("sidebar");
    const b = document.getElementById("btnMenuMobile");
    if (s.classList.contains("aberta") && !s.contains(e.target) && e.target !== b)
      s.classList.remove("aberta");
  });

  // Inicializa área de fotos extras
  renderizarCamposFotos();

  console.log("✅ ADGVEICULOS Admin inicializado.");
});
