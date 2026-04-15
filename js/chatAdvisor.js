/**
 * P.Acoustic — Asesor de producto (chat flotante)
 * Usa window.PAcousticCatalog (rellenado en main.js al cargar el JSON).
 */
(function () {
  const WA = 'https://wa.me/573053402732?text=';

  const SCENARIOS = {
    eventos: {
      label: 'Eventos y conciertos',
      keywords: ['concierto', 'evento', 'spl', 'rigging', 'line array', 'array', 'gran formato', 'vivo', 'escenario', 'refuerzo', 'potencia', 'dsp', '137', '133'],
      catBoost: { Cabinas: 14 },
      subBoost: { 'Line Array': 12 }
    },
    iglesia: {
      label: 'Iglesia, teatro o auditorio',
      keywords: ['iglesia', 'teatro', 'auditorio', 'corporativ', 'conferencia', 'cultura', 'vocal', 'inteligible', 'colegio', 'convención'],
      catBoost: { Cabinas: 12, Woofer: 5 },
      subBoost: { 'Line Array': 8 }
    },
    dj: {
      label: 'DJ, club o sistema móvil',
      keywords: ['dj', 'club', 'móvil', 'portátil', 'refuerzo', 'evento', 'spl', 'potencia', 'bafle'],
      catBoost: { Cabinas: 10, Woofer: 8 },
      subBoost: { 'Line Array': 6, Neodimio: 4, Ferrita: 3 }
    },
    instalacion: {
      label: 'Instalación fija',
      keywords: ['instalación', 'fija', 'hotel', 'centro', 'convención', 'auditorio', 'network', 'dsp', 'rack'],
      catBoost: { Cabinas: 12, Woofer: 6 },
      subBoost: { 'Line Array': 8 }
    },
    graves: {
      label: 'Graves y subwoofers',
      keywords: ['woofer', 'sub', 'grave', 'bajo', '18', '15', '12', 'neodimio', 'ferrita', 'spl', 'w'],
      catBoost: { Woofer: 18 },
      subBoost: { Neodimio: 5, Ferrita: 5 }
    },
    drivers: {
      label: 'Drivers y agudos',
      keywords: ['driver', 'agudo', 'compresión', 'diafragma', 'titanio', 'bobina', 'horn', '1.4', '2'],
      catBoost: { Drivers: 18 },
      subBoost: {}
    }
  };

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  function esc(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
  }

  function getCatalog() {
    return Array.isArray(window.PAcousticCatalog) ? window.PAcousticCatalog : [];
  }

  function scoreProduct(p, key) {
    if (key === 'ver_cats') return 0;
    const sc = SCENARIOS[key];
    if (!sc) return 0;
    const hay = norm([p.name, p.cat, p.subcat, p.desc, (p.apps || []).join(' ')].join(' '));
    let score = 0;
    sc.keywords.forEach(kw => {
      const n = norm(kw);
      if (n && hay.includes(n)) score += 4;
    });
    const cb = sc.catBoost && sc.catBoost[p.cat];
    if (cb) score += cb;
    const sb = sc.subBoost && sc.subBoost[p.subcat];
    if (sb) score += sb;
    return score;
  }

  function suggestForScenario(key) {
    const list = getCatalog().slice();
    if (!list.length) return [];
    if (key === 'ver_cats') return list.slice(0, 6);
    list.sort((a, b) => scoreProduct(b, key) - scoreProduct(a, key));
    const top = list.filter(p => scoreProduct(p, key) > 0);
    if (top.length >= 3) return top.slice(0, 5);
    const catGuess =
      key === 'graves'
        ? 'Woofer'
        : key === 'drivers'
          ? 'Drivers'
          : 'Cabinas';
    const fallback = list.filter(p => norm(p.cat) === norm(catGuess));
    if (fallback.length) return fallback.slice(0, 5);
    return list.slice(0, 4);
  }

  function suggestForCategory(cat) {
    const list = getCatalog().filter(p => norm(p.cat) === norm(cat));
    list.sort((a, b) => String(a.name).localeCompare(String(b.name), 'es', { numeric: true }));
    return list.slice(0, 6);
  }

  let root, msgs;

  function appendMsg(html, user) {
    const el = document.createElement('div');
    el.className = 'pa-advisor-msg ' + (user ? 'pa-advisor-msg--user' : 'pa-advisor-msg--bot');
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderChips(chipDefs) {
    const wrap = document.createElement('div');
    wrap.className = 'pa-advisor-chips';
    chipDefs.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pa-advisor-chip';
      b.textContent = c.label;
      b.dataset.chipId = c.id;
      wrap.appendChild(b);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function renderProductCards(products) {
    const wrap = document.createElement('div');
    wrap.className = 'pa-advisor-products';
    products.forEach(p => {
      const img = p.imgs && p.imgs[0] ? esc(p.imgs[0]) : '';
      const sub = p.subcat ? ` · ${esc(p.subcat)}` : '';
      const card = document.createElement('div');
      card.className = 'pa-advisor-pcard';
      card.innerHTML = `
        ${img ? `<img src="${esc(p.imgs[0])}" alt="" loading="lazy"/>` : '<div></div>'}
        <div class="pa-advisor-pcard-meta">
          <strong>${esc(p.name)}</strong>
          <small>${esc(p.cat)}${sub}</small>
        </div>
        <button type="button" class="pa-advisor-pcard-btn" data-open="${esc(p.id)}">Ver</button>`;
      wrap.appendChild(card);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function welcomeChips() {
    return [
      { id: 'eventos', label: 'Conciertos / eventos grandes' },
      { id: 'iglesia', label: 'Iglesia, teatro o auditorio' },
      { id: 'dj', label: 'DJ, club o móvil' },
      { id: 'instalacion', label: 'Instalación fija' },
      { id: 'graves', label: 'Sub graves y woofers' },
      { id: 'drivers', label: 'Drivers / agudos' },
      { id: 'ver_cats', label: 'Elegir por categoría' }
    ];
  }

  function categoryChips() {
    const set = new Set();
    getCatalog().forEach(p => {
      if (p.cat) set.add(p.cat);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'es')).map(c => ({ id: 'cat:' + c, label: c }));
  }

  function onMessagesClick(e) {
    const t = e.target;
    if (t.classList.contains('pa-advisor-pcard-btn')) {
      const pid = t.getAttribute('data-open');
      if (pid && typeof window.openModal === 'function') window.openModal(pid);
      return;
    }
    const btn = e.target.closest('.pa-advisor-chip');
    if (!btn || !root.contains(btn)) return;
    const id = btn.dataset.chipId;
    if (!id) return;
    if (id === 'wa') {
      window.open(
        WA +
          encodeURIComponent(
            'Hola P.Acoustic, quiero asesoría para elegir el mejor equipo según mi proyecto (usé el asesor en la web).'
          ),
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    appendMsg(esc(btn.textContent), true);
    btn.parentElement.remove();

    if (id.startsWith('cat:')) {
      const cat = id.slice(4);
      if (typeof window.selectCatalogFilter === 'function') window.selectCatalogFilter(cat, '');
      appendMsg(
        `<p>He filtrado por <strong>${esc(cat)}</strong>. Aquí tienes modelos para revisar; puedes abrir la ficha o seguir afinando por WhatsApp.</p>`,
        false
      );
      renderProductCards(suggestForCategory(cat));
      renderChips([{ id: 'restart', label: 'Nueva consulta' }]);
      return;
    }

    if (id === 'restart') {
      msgs.innerHTML = '';
      showWelcome();
      return;
    }

    if (id === 'ver_cats') {
      appendMsg('<p>Elige una categoría del catálogo:</p>', false);
      renderChips(categoryChips());
      return;
    }

    const sc = SCENARIOS[id];
    const title = sc ? sc.label : 'Tu selección';
    appendMsg(`<p>Según <strong>${esc(title)}</strong>, estos equipos encajan bien con lo que comentas (potencia, uso y familia de producto). Toca <strong>Ver</strong> para la ficha técnica y galería.</p>`, false);
    const picks = suggestForScenario(id);
    if (picks.length) renderProductCards(picks);
    else appendMsg('<p>No encontré coincidencias fuertes; revisa el catálogo completo o escríbenos.</p>', false);

    renderChips([
      { id: 'restart', label: 'Nueva consulta' },
      { id: 'wa', label: 'WhatsApp con un asesor' }
    ]);
  }

  function showWelcome() {
    appendMsg(
      '<p>¡Hola! Soy el <strong>asesor de producto</strong> de P.Acoustic. Con un par de clics te propongo modelos según tu escenario (eventos, instalación, graves…).</p><p>¿Qué se acerca más a lo que buscas?</p>',
      false
    );
    renderChips(welcomeChips());
  }

  function buildUI() {
    root = document.createElement('div');
    root.id = 'paAdvisorRoot';
    root.setAttribute('aria-live', 'polite');
    root.innerHTML = `
      <div class="pa-advisor-wrap">
        <div class="pa-advisor-panel" role="dialog" aria-label="Asesor de producto">
          <div class="pa-advisor-head">
            <div class="pa-advisor-head-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3C7 3 3 7 3 12v1l-2 2 3-1h1c5 0 9-4 9-9 0-1 0-2-.2-3"/><path d="M8 14c-1 4 2 7 6 7h1l3 1-1-3v-1c0-3-2-5-5-6"/></svg>
            </div>
            <div class="pa-advisor-head-text">
              <strong>Asesor de equipo</strong>
              <span>Recomendaciones según tu uso · Medellín, envíos Colombia</span>
            </div>
            <button type="button" class="pa-advisor-close" aria-label="Cerrar asesor">✕</button>
          </div>
          <div class="pa-advisor-messages"></div>
          <div class="pa-advisor-foot">
            <div class="pa-advisor-input-row">
              <input type="text" class="pa-advisor-input" maxlength="120" placeholder="Palabras clave (ej. line array 700W)" aria-label="Buscar en catálogo"/>
              <button type="button" class="pa-advisor-voice" aria-label="Dictar búsqueda" title="Dictar en español (micrófono)">
                <svg class="pa-advisor-voice-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 11v1a7 7 0 0014 0v-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 18v3M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button type="button" class="pa-advisor-send">Buscar</button>
            </div>
            <a class="pa-advisor-wa" href="${WA}${encodeURIComponent('Hola, quiero asesoría para elegir equipo P.Acoustic.')}" target="_blank" rel="noopener noreferrer">WhatsApp directo</a>
            <button type="button" class="pa-advisor-restart">Empezar de nuevo</button>
          </div>
        </div>
        <button type="button" class="pa-advisor-toggle" aria-expanded="false" aria-controls="paAdvisorPanel" aria-label="Abrir asesor de producto">
          <span class="pa-advisor-badge" aria-hidden="true">?</span>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>
        </button>
      </div>`;
    document.body.appendChild(root);
    msgs = root.querySelector('.pa-advisor-messages');

    root.querySelector('.pa-advisor-toggle').addEventListener('click', () => {
      root.classList.add('is-open');
      root.querySelector('.pa-advisor-toggle')?.setAttribute('aria-expanded', 'true');
      if (!msgs.dataset.inited) {
        msgs.dataset.inited = '1';
        showWelcome();
      }
    });
    root.querySelector('.pa-advisor-close').addEventListener('click', () => {
      root.classList.remove('is-open');
      root.querySelector('.pa-advisor-toggle')?.setAttribute('aria-expanded', 'false');
    });
    msgs.addEventListener('click', onMessagesClick);

    root.querySelector('.pa-advisor-restart').addEventListener('click', () => {
      msgs.innerHTML = '';
      delete msgs.dataset.inited;
      showWelcome();
      msgs.dataset.inited = '1';
    });

    function runAdvisorTextSearch() {
      const inp = root.querySelector('.pa-advisor-input');
      const q = (inp && inp.value) ? inp.value.trim() : '';
      if (!q) return;
      appendMsg(esc(q), true);
      inp.value = '';
      const nq = norm(q);
      const hits = getCatalog()
        .filter(p => norm([p.name, p.cat, p.subcat, p.desc].join(' ')).includes(nq))
        .slice(0, 6);
      if (hits.length) {
        appendMsg('<p>Modelos que coinciden con tu búsqueda:</p>', false);
        renderProductCards(hits);
      } else {
        appendMsg(
          '<p>No hallé coincidencias exactas. Prueba otra palabra (categoría, potencia, pulgadas) o escribe por <strong>WhatsApp</strong>.</p>',
          false
        );
      }
      renderChips([
        { id: 'restart', label: 'Nueva consulta' },
        { id: 'wa', label: 'WhatsApp con un asesor' }
      ]);
    }
    root.querySelector('.pa-advisor-send').addEventListener('click', runAdvisorTextSearch);
    root.querySelector('.pa-advisor-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runAdvisorTextSearch();
      }
    });

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const inpVoice = root.querySelector('.pa-advisor-input');
    const vbtn = root.querySelector('.pa-advisor-voice');
    const voiceSecure =
      window.isSecureContext ||
      /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname || '');
    if (!SR || !inpVoice || !vbtn || !voiceSecure) {
      vbtn?.remove();
    } else {
      let recognition = null;
      let voiceListening = false;
      vbtn.addEventListener('click', e => {
        e.preventDefault();
        if (voiceListening && recognition) {
          try { recognition.abort(); } catch (_) {}
          voiceListening = false;
          vbtn.classList.remove('pa-advisor-voice--active');
          return;
        }
        recognition = new SR();
        recognition.lang = 'es-CO';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;
        voiceListening = true;
        vbtn.classList.add('pa-advisor-voice--active');
        recognition.onresult = ev => {
          const t = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
          inpVoice.value = String(t || '').trim();
        };
        recognition.onerror = () => {
          voiceListening = false;
          vbtn.classList.remove('pa-advisor-voice--active');
        };
        recognition.onend = () => {
          voiceListening = false;
          vbtn.classList.remove('pa-advisor-voice--active');
          if (inpVoice.value.trim()) runAdvisorTextSearch();
        };
        try {
          recognition.start();
        } catch (_) {
          voiceListening = false;
          vbtn.classList.remove('pa-advisor-voice--active');
        }
      });
    }
  }

  function init() {
    if (document.getElementById('paAdvisorRoot')) return;
    buildUI();
  }

  document.addEventListener('pacoustic:catalog-ready', init, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    if (window.PAcousticCatalog && window.PAcousticCatalog.length) init();
  });
})();
