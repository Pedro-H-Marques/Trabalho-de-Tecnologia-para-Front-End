/* ============================================================
   FITMIND AI v2 — Script Principal (Vanilla JS)
   ============================================================ */

/* -------------------------------------------------------
   1. SIDEBAR MOBILE
   ------------------------------------------------------- */
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  if (overlay) overlay.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* -------------------------------------------------------
   2. TABS DE NAVEGAÇÃO INTERNA
   ------------------------------------------------------- */

/**
 * initTabs(containerSelector):
 * Inicializa as abas dentro de um container.
 * Cada botão com data-tab="id" mostra o painel com id correspondente.
 */
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '.tabs-container');

  containers.forEach(container => {
    const btns  = container.querySelectorAll('.tab-btn');
    const panes = container.querySelectorAll('.tab-pane');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const alvo = container.querySelector('#' + btn.dataset.tab);
        if (alvo) alvo.classList.add('active');
      });
    });
  });
}

/* -------------------------------------------------------
   3. CÁLCULO DE TMB (Mifflin-St Jeor) + IMC + ÁGUA
   ------------------------------------------------------- */

function calcularTMB() {
  const peso   = parseFloat(document.getElementById('peso')?.value)   || 0;
  const altura = parseFloat(document.getElementById('altura')?.value) || 0;
  const idade  = parseFloat(document.getElementById('idade')?.value)  || 0;
  const sexo   = document.getElementById('sexo')?.value               || 'masculino';

  if (!peso || !altura || !idade) {
    atualizarResultado('resultadoTMB',  '—');
    atualizarResultado('resultadoTDEE', '—');
    atualizarResultado('resultadoIMC',  '—');
    atualizarResultado('resultadoAgua', '—');
    return;
  }

  // Fórmula Mifflin-St Jeor
  let tmb = sexo === 'masculino'
    ? (10 * peso) + (6.25 * altura) - (5 * idade) + 5
    : (10 * peso) + (6.25 * altura) - (5 * idade) - 161;

  // TDEE com fator de atividade
  const fator = parseFloat(document.getElementById('nivelAtividade')?.value) || 1.375;
  const tdee  = (tmb * fator).toFixed(0);

  // IMC
  const alturaM = altura / 100;
  const imc     = (peso / (alturaM * alturaM)).toFixed(1);
  let classImc  = '';
  if      (imc < 18.5) classImc = ' · Abaixo do peso';
  else if (imc < 25)   classImc = ' · Normal ✓';
  else if (imc < 30)   classImc = ' · Sobrepeso';
  else                 classImc = ' · Obesidade';

  // Água: 35ml por kg de peso corporal
  const agua = (peso * 35 / 1000).toFixed(1);

  atualizarResultado('resultadoTMB',  `${tmb.toFixed(0)} kcal/dia`);
  atualizarResultado('resultadoTDEE', `${tdee} kcal/dia`);
  atualizarResultado('resultadoIMC',  `${imc}${classImc}`);
  atualizarResultado('resultadoAgua', `${agua} litros/dia`);
}

function atualizarResultado(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function initCalculosAnamnese() {
  ['peso','altura','idade','sexo','nivelAtividade'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input',  calcularTMB);
      el.addEventListener('change', calcularTMB);
    }
  });
}

/* -------------------------------------------------------
   4. SIMULAÇÃO — GERAR PROTOCOLO COM IA
   ------------------------------------------------------- */

function gerarProtocolo(btn, alunoNome, objetivo, nivel) {
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = '⚡ Processando...';
  btn.classList.add('loading');
  btn.disabled = true;

  const modal = document.getElementById('modalProtocolo');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-overlay" onclick="fecharModal()">
      <div class="modal-box" onclick="event.stopPropagation()" style="position:relative;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h3 class="modal-title">🤖 Gerando Protocolo — ${alunoNome}</h3>
          <button onclick="fecharModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.4rem;cursor:pointer;line-height:1;">×</button>
        </div>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:8px;">FITMIND AI está analisando os dados da anamnese...</p>
        <div class="processing-bar"><div class="processing-bar-fill" id="progressBar"></div></div>
        <div id="protocoloConteudo" style="opacity:0;transition:opacity 0.5s ease;margin-top:16px;"></div>
      </div>
    </div>`;
  modal.style.display = 'flex';

  setTimeout(() => { const b = document.getElementById('progressBar'); if (b) b.style.width = '100%'; }, 50);

  setTimeout(() => {
    const c = document.getElementById('protocoloConteudo');
    if (c) { c.innerHTML = renderizarProtocolo(alunoNome, objetivo, nivel); c.style.opacity = '1'; }
    btn.innerHTML = textoOriginal;
    btn.classList.remove('loading');
    btn.disabled = false;
  }, 2000);
}

function renderizarProtocolo(nome, objetivo, nivel) {
  const objTexto = { hipertrofia:'Hipertrofia Muscular', emagrecimento:'Emagrecimento', condicionamento:'Condicionamento Físico', forca:'Ganho de Força' }[objetivo] || 'Condicionamento Geral';
  return `
    <div class="protocol-block"><h4>📋 Diagnóstico IA</h4>
      <p>Protocolo para <strong style="color:var(--text-primary)">${nome}</strong> — foco em <strong style="color:var(--accent-neon)">${objTexto}</strong> | Nível: <strong>${nivel || 'Intermediário'}</strong></p>
    </div>
    <div class="protocol-block"><h4>🏋️ Protocolo A — Peito e Tríceps (2ª/5ª)</h4>
      <ul><li>Supino Reto — 4×10 (70% 1RM) | 90s</li><li>Supino Inclinado Halteres — 3×12 | 60s</li><li>Crossover Cabo — 3×15 | 60s</li><li>Tríceps Corda — 3×15 | 60s</li><li>Tríceps Francês — 3×12 | 60s</li></ul>
    </div>
    <div class="protocol-block"><h4>🏋️ Protocolo B — Costas e Bíceps (3ª/6ª)</h4>
      <ul><li>Puxada Frontal — 4×10 | 90s</li><li>Remada Curvada — 4×10 | 90s</li><li>Remada Unilateral — 3×12 | 60s</li><li>Rosca Direta — 3×12 | 60s</li><li>Rosca Alternada — 3×10 | 60s</li></ul>
    </div>
    <div class="protocol-block"><h4>🦵 Protocolo C — Membros Inferiores (4ª)</h4>
      <ul><li>Agachamento Livre — 4×10 | 120s</li><li>Leg Press 45° — 4×12 | 90s</li><li>Cadeira Extensora — 3×15 | 60s</li><li>Mesa Flexora — 3×15 | 60s</li><li>Panturrilha — 4×20 | 45s</li></ul>
    </div>
    <div class="protocol-block"><h4>🥗 Estimativa Nutricional</h4>
      <p>Calorias estimadas: <strong style="color:var(--accent-neon)">2.400–2.600 kcal/dia</strong> | Proteína mínima: <strong style="color:var(--accent-neon)">1.8g/kg</strong></p>
    </div>
    <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="fecharModal()">✅ Protocolo Aprovado</button>
      <button class="btn btn-outline" onclick="fecharModal()">✏️ Ajustar</button>
    </div>`;
}

function fecharModal() {
  const modal = document.getElementById('modalProtocolo');
  if (modal) modal.style.display = 'none';
}

/* -------------------------------------------------------
   5. VISUALIZAR ANAMNESE (modal de leitura)
   ------------------------------------------------------- */

function visualizarAnamnese(nome, dados) {
  const modal = document.getElementById('modalProtocolo');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-overlay" onclick="fecharModal()">
      <div class="modal-box" onclick="event.stopPropagation()" style="position:relative;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h3 class="modal-title">📋 Anamnese — ${nome}</h3>
          <button onclick="fecharModal()" style="background:none;border:none;color:var(--text-muted);font-size:1.4rem;cursor:pointer;">×</button>
        </div>
        ${dados.map(sec => `
          <div class="protocol-block">
            <h4>${sec.titulo}</h4>
            ${sec.itens.map(item => `
              <div class="info-row">
                <span class="info-label">${item.label}</span>
                <span class="info-value">${item.valor}</span>
              </div>`).join('')}
          </div>`).join('')}
        <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="fecharModal();gerarProtocolo(this,'${nome}','hipertrofia','Intermediário')">⚡ Gerar Protocolo com IA</button>
          <button class="btn btn-outline" onclick="fecharModal()">Fechar</button>
        </div>
      </div>
    </div>`;
  modal.style.display = 'flex';
}

/* -------------------------------------------------------
   6. CHATBOT SIMULADO
   ------------------------------------------------------- */

const respostasBot = {
  'treino':     '💪 Seu treino (Protocolo A/B/C) foi elaborado pelo seu Personal. Para dúvidas de execução, consulte "Meus Treinos".',
  'dieta':      '🥗 Sua dieta está na aba "Dieta Atual". Lembre-se: alimentação representa ~70% dos resultados!',
  'tmb':        '🔥 Sua TMB é calculada pelo formulário de Anamnese (fórmula Mifflin-St Jeor): homens = (10×peso) + (6.25×altura) − (5×idade) + 5.',
  'imc':        '📊 IMC = peso ÷ (altura em metros)². Faixa normal: 18,5 a 24,9.',
  'agua':       '💧 Recomendação: 35ml por kg de peso. Para 80kg → 2,8 litros/dia.',
  'descanso':   '😴 Músculos crescem no repouso! Durma 7 a 9 horas por noite.',
  'suplemento': '💊 Suplementação deve ser orientada por profissional. Os mais usados: Whey, Creatina, Vit. D, Ômega-3.',
  'proteina':   '🥩 Consumo recomendado para hipertrofia: 1.6 a 2.2g de proteína por kg de peso corporal ao dia.',
  'default':    '🤖 Posso ajudar com treino, dieta, TMB, IMC, hidratação, descanso, suplementação ou proteína. O que deseja saber?',
};

function enviarMensagem() {
  const input    = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  if (!input || !messages) return;

  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';

  messages.innerHTML += criarBolha(texto, 'user', 'Você');
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    const resposta = gerarRespostaBot(texto);
    messages.innerHTML += criarBolha(resposta, 'bot', 'FITMIND AI');
    messages.scrollTop = messages.scrollHeight;
  }, 650);
}

function criarBolha(texto, tipo, remetente) {
  return `<div class="message ${tipo}"><p class="msg-sender">${remetente}</p><div class="msg-bubble">${texto}</div></div>`;
}

function gerarRespostaBot(texto) {
  const lower = texto.toLowerCase();
  if (lower.match(/\b(oi|olá|ola|bom dia|boa tarde|boa noite)\b/))
    return '👋 Olá! Como posso ajudar? Pergunte sobre treino, dieta, TMB, IMC, hidratação ou descanso.';
  for (const [chave, resposta] of Object.entries(respostasBot)) {
    if (chave !== 'default' && lower.includes(chave)) return resposta;
  }
  return respostasBot['default'];
}

function initChatEnter() {
  const input = document.getElementById('chatInput');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') enviarMensagem(); });
}

/* -------------------------------------------------------
   7. FORM ANAMNESE
   ------------------------------------------------------- */

function initFormAnamnese() {
  const form = document.getElementById('formAnamnese');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '⚡ Enviando...';
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '✅ Anamnese Enviada!';
      btn.classList.remove('loading');
      mostrarToast('✅ Anamnese enviada! Seu personal foi notificado.');
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 4000);
    }, 1500);
  });
}

/* -------------------------------------------------------
   8. FORM DE CONTATO LANDING
   ------------------------------------------------------- */

function initFormContato() {
  const form = document.getElementById('formContato');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '⚡ Enviando...';
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:3rem;margin-bottom:16px;">✅</div>
          <h3 style="font-family:var(--font-display);color:var(--accent-neon);margin-bottom:10px;">Solicitação Enviada!</h3>
          <p style="color:var(--text-secondary);line-height:1.7;">
            Recebemos seus dados. Em breve nossa equipe entrará em contato para confirmar
            sua assinatura presencialmente. Fique atento ao seu e-mail e WhatsApp!
          </p>
        </div>`;
    }, 1500);
  });
}

/* -------------------------------------------------------
   9. GRÁFICO DE BARRAS — Faturamento
   ------------------------------------------------------- */

function initBarChart() {
  const bars = document.querySelectorAll('.bar-fill[data-pct]');
  // Pequeno delay para acionar a transição CSS após o DOM estar pronto
  setTimeout(() => {
    bars.forEach(bar => {
      bar.style.height = bar.dataset.pct + '%';
    });
  }, 200);
}

/* -------------------------------------------------------
   10. TOAST
   ------------------------------------------------------- */

function mostrarToast(mensagem) {
  const ex = document.getElementById('toastGlobal');
  if (ex) ex.remove();

  const toast = document.createElement('div');
  toast.id = 'toastGlobal';
  toast.style.cssText = `position:fixed;bottom:28px;right:28px;background:var(--bg-card);border:1px solid var(--border-neon);border-radius:10px;padding:14px 20px;font-family:var(--font-ui);font-size:0.88rem;color:var(--text-primary);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1) both;max-width:340px;`;
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* -------------------------------------------------------
   11. NAV ATIVA
   ------------------------------------------------------- */

function marcarNavAtiva() {
  const pagina = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href.includes(pagina)) item.classList.add('active');
  });
}

/* -------------------------------------------------------
   12. SCROLL SUAVE PARA ÂNCORAS (landing)
   ------------------------------------------------------- */

function initScrollAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) { e.preventDefault(); alvo.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* -------------------------------------------------------
   INICIALIZAÇÃO
   ------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initTabs();
  initCalculosAnamnese();
  initChatEnter();
  initFormAnamnese();
  initFormContato();
  initBarChart();
  marcarNavAtiva();
  initScrollAnchors();

  const main = document.querySelector('main');
  if (main) main.classList.add('page-enter');

  console.log('%c FITMIND AI v2 ', 'background:#39ff14;color:#060913;font-weight:bold;padding:4px 8px;border-radius:4px;', '— Sistema inicializado.');
});
