/**
======================================================================
PA ACOUSTIC — main.js
======================================================================
**/

const WP = 'https://wa.me/573053402732';
const WP_SVG = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ========================================
  // CACHE DOM - Optimización rendimiento
  // ========================================
  // Objeto global para almacenar referencias DOM (evita múltiples getElementById)
  const domCache = {};
  // Función para inicializar cache de elementos DOM frecuentemente usados
  function initCache() {
    // Cache botón hamburguesa menú móvil
    domCache.navHamburger       = document.getElementById('navHamburger');
    // Cache lista enlaces navegación principal
    domCache.navLinks           = document.getElementById('navLinks');
    // Cache overlay menú móvil (cierre al tocar fuera)
    domCache.navMobileOverlay   = document.getElementById('navMobileOverlay');
    // Cache input búsqueda catálogo desktop
    domCache.catalogSearch      = document.getElementById('catalogSearch');
    // Cache selector categoría desktop
    domCache.catalogCategory    = document.getElementById('catalogCategory');
    // Cache contenedor caja búsqueda navbar
    domCache.navSearchBox       = document.getElementById('navSearchBox');
    // Cache botón trigger búsqueda navbar
    domCache.navSearchTrigger   = document.getElementById('navSearchTrigger');
    // Cache selector categoría menú móvil
    domCache.mobileMenuCategory = document.getElementById('mobileMenuCategory');
    // Cache input búsqueda menú móvil
    domCache.mobileMenuSearch   = document.getElementById('mobileMenuSearch');
    // Cache grid contenedor tarjetas productos
    domCache.productsGrid       = document.getElementById('productsGrid');
    // Cache sección contenedor productos
    domCache.products           = document.getElementById('products');
    // Cache indicador categoría activa
    domCache.categoryActive     = document.getElementById('categoryActive');
    // Cache track carrusel banner productos
    domCache.bannerTrack        = document.getElementById('bannerTrack');
    // Cache overlay modal productos
    domCache.modalOverlay       = document.getElementById('modalOverlay');
    // Cache contenedor principal modal
    domCache.modal              = document.getElementById('modal');
    // Cache body contenido modal
    domCache.modalBody          = document.getElementById('modalBody');
    // Cache título modal producto
    domCache.modalTitulo        = document.getElementById('modalTitulo');
    // Cache imagen principal modal
    domCache.modalImgMain       = document.getElementById('modalImgMain');
    // Cache contenedor miniaturas galería
    domCache.modalThumbs        = document.getElementById('modalThumbs');
    // Cache panel información producto modal
    domCache.modalInfo          = document.getElementById('modalInfo');
    // Cache elemento audio introductorio
    domCache.introAudio         = document.getElementById('introAudio');
  }
  // Función helper $() - Obtiene elemento del cache o DOM directamente
  function $(id) {
    // Si no existe en cache, obtener del DOM y guardar
    if (!domCache[id]) domCache[id] = document.getElementById(id);
    // Retorna referencia cacheada (evita queries repetidas)
    return domCache[id];
  }

// ========================================
  // CONFIG - Configuración global aplicación
  // ========================================
  // Objeto configuración paginación (8 productos por página, página actual 1)
  const PAGINATION_CONFIG = { itemsPerPage: 8, currentPage: 1 };

  // Función placeholder - Zoom controlado por modalZoom.js separado
  // Mantenida para compatibilidad futura
  function initZoomControls() {}

  // ========================================
  // NAVEGACIÓN - Manejo enlaces y scroll suave
  // ========================================
  // Event handler click logo - Scroll instantáneo al top página
  function handleLogoClick(e) {
    // Previene navegación por defecto del enlace
    e.preventDefault();
    // Scroll suave instantáneo a posición 0 (top página)
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Limpia clase 'active' de todos enlaces navegación
    clearNavActive();
  }
  // Event handler click enlaces navegación principal
  function handleNavClick(e, sectionId) {
    // Obtiene referencia lista enlaces navegación
    const nl = document.getElementById('navLinks');
    // Si menú móvil abierto, cerrarlo automáticamente
    if (nl && nl.classList.contains('open')) toggleMobileMenu();
    // Limpia clases active después breve delay (UX suave)
    setTimeout(() => clearNavActive(), 100);
  }
  // Elimina clase 'active' de todos enlaces navegación (.nav-link)
  function clearNavActive() {
    // Selecciona todos enlaces con clase .nav-link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  }

// ========================================
  // AUDIO - Sistema introductorio controlado por scroll
  // ========================================
  // Inicializa reproducción audio intro en homepage (solo scrollY < 100px)
  function initIntroAudio() {
    // Obtiene referencia elemento audio HTML
    const audio = document.getElementById('introAudio');
    // Si audio no existe en DOM, sale tempranamente
    if (!audio) return;
    // Flag control reproducción (evita múltiples plays)
    let started = false;
    // Función fade out gradual volumen hasta silencio
    function stop() {
      // Intervalo fade 80ms decremental 0.05 volumen
      let fade = setInterval(() => {
        // Reduce volumen hasta mínimo 0.05
        if (audio.volume > 0.05) audio.volume -= 0.05;
        // Cuando volumen bajo, pausa y reset
        else { clearInterval(fade); audio.pause(); audio.volume = 0.6; started = false; }
      }, 80);
    }
    // Función inicio reproducción con volumen bajo (política autoplay)
    function play() {
      // Sale si ya activo o scroll >= 100px (solo homepage visible)
      if (started || window.scrollY >= 100) return;
      // Marca como activo y volumen inicial suave
      started = true; audio.volume = 0.5;
      // Intenta reproducir (catch bloquea autoplay browsers)
      audio.play().catch(() => { started = false; });
    }
    // Listener scroll pasivo (performance) - controla play/stop
    window.addEventListener('scroll', () => {
      // Si scroll >=100px y activo, fade out
      if (window.scrollY >= 100 && started) stop();
      // Si scroll <100px y inactivo, play
      if (window.scrollY < 100 && !started) play();
    }, { passive: true });
    // Inicia inmediatamente al cargar (homepage)
    play();
    // Listener click único - permite play tras interacción usuario
    document.addEventListener('click', function f() {
      if (window.scrollY < 100) play();
      // Remueve listener una vez usado (evita múltiples bindings)
      document.removeEventListener('click', f);
    }, { once: true });
  }

// ========================================
  // PRODUCTOS - Carga y procesamiento JSON catálogo
  // ========================================
  // Array global productos procesados (formato normalizado)
  let products = [];

  // Función asíncrona carga datos JSON y normaliza estructura productos
  async function loadProducts() {
    try {
      // Fetch asíncrono archivo JSON productos
      const response = await fetch("data/products.json");
      // Parsea JSON respuesta a objeto data
      const data = await response.json();
      // Transforma array raw → formato interno normalizado
      products = data.map(p => {
        // Extrae imagen principal o cadena vacía si no existe
        const mainImg    = p.images?.main || "";
        // Obtiene array gallery raw del producto
        const rawGallery = p.images?.gallery;
        // Convierte a array si existe, sino array vacío
        const extraImgs  = Array.isArray(rawGallery) ? rawGallery : [];
        // Gallery final = main + extras únicos (sin duplicados main)
        const gallery    = [mainImg, ...extraImgs.filter(u => u && u !== mainImg)].filter(Boolean);
        return {
          // ID único lowercase-kebab-case desde name
          id:        p.name.toLowerCase().replace(/\s+/g, '-'),
          // Nombre en mayúsculas
          name:      p.name.toUpperCase(),
          // Categoría o "Parlantes" por defecto
          cat:       p.category || "Parlantes",
          badge:     "Producto", // Badge fijo todos productos
          // Descripción o texto por defecto
          desc:      p.description || "Producto de audio profesional",
          imgs:      gallery, // Array imágenes procesado
          // Watermark opcional
          watermark: p.images?.watermark || null,
          // Specs como array pares key-value (excluye 'aplicaciones')
          specs:     p.specs ? Object.entries(p.specs).filter(([k]) => k !== 'aplicaciones') : [],
          // Aplicaciones procesadas desde specs.aplicaciones
          apps:      p.specs?.aplicaciones
                     ? (typeof p.specs.aplicaciones === 'string'
                         ? p.specs.aplicaciones.split(',').map(s => s.trim()) // String → array limpio
                         : p.specs.aplicaciones) // Ya array
                     : [],
          tags:      [], // Placeholder tags futuros
          video:     p.video || null, // URL video opcional
          doc:       p.document || null // PDF ficha técnica opcional
        };
      });
      // Renderiza banner con productos cargados
      renderBanner();
      // Renderiza grid productos inicial
      renderProducts();
    } catch (e) {
      // Log error consola (desarrollo/debug)
      console.error("Error cargando products.json:", e);
    }
  }

// ========================================
// BANNER
// ========================================
function onBannerItemClick(id) {
  document.getElementById('products').scrollIntoView({ behavior: 'instant' });
  setTimeout(() => openModal(id), 450);
}
function renderBanner() {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  const items = products.map(p => ({ src: p.imgs[0], alt: p.name, id: p.id }));
  const dup   = [...items, ...items, ...items];
  track.innerHTML = dup.map(({ src, alt, id }) => `
    <div class="banner-item" onclick="onBannerItemClick('${id}')" role="button" tabindex="0" aria-label="Ver ${escapeAttr(alt)}">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy"/>
    </div>`).join('');
}

// ========================================
// VIDEO EMBED
// ========================================
function getVideoEmbed(url) {
  if (!url) return null;
  if (url.includes('res.cloudinary.com') && url.match(/\.(mp4|webm|mov)(\?|$)/i)) {
    const thumb = url
      .replace('/video/upload/', '/video/upload/so_0/')
      .replace(/\.(mp4|webm|mov)(\?|$)/i, '.jpg');
    return { type: 'video', src: url, thumb };
  }
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: 'video', src: url, thumb: null };
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return {
    type: 'iframe',
    src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    thumb: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  };
  const ytShorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
  if (ytShorts) return {
    type: 'iframe',
    src: `https://www.youtube.com/embed/${ytShorts[1]}?rel=0`,
    thumb: `https://img.youtube.com/vi/${ytShorts[1]}/hqdefault.jpg`
  };
  return null;
}

// ========================================
// FILTROS
// ========================================
function getProductSearchText(p) {
  return [p.name, p.cat, p.desc, (p.tags||[]).join(' '), (p.apps||[]).join(' ')]
    .join(' ').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
function getFilteredProducts() {
  const se = document.getElementById('catalogSearch');
  const ce = document.getElementById('catalogCategory');
  const q  = se?.value ? se.value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : '';
  const c  = ce?.value ? ce.value.trim().toLowerCase() : '';
  let list = products;
  if (c) list = list.filter(p => (p.cat||'').toLowerCase() === c);
  if (q) list = list.filter(p => getProductSearchText(p).includes(q));
  return list;
}
function getUniqueCategories() {
  const fixed = ['Line Array','Woofer','Drivers','Cabinas'];
  const from  = [];
  products.forEach(p => { if (p.cat && !from.includes(p.cat)) from.push(p.cat); });
  return [...new Set([...fixed, ...from])];
}
function fillCategorySelect() {
  const sel  = document.getElementById('catalogCategory');
  const mob  = document.getElementById('mobileMenuCategory');
  const cur  = sel?.value || '';
  const cats = getUniqueCategories();
  const html = '<option value="">Todas las categorías</option>' +
    cats.map(c => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');
  if (sel) { sel.innerHTML = html; if (cats.includes(cur)) sel.value = cur; }
  if (mob) mob.innerHTML = html;
}
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t||''; return d.innerHTML; }
function escapeAttr(t) { return String(t||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ========================================
// RENDER PRODUCTOS
// ========================================
function renderProducts() {
  const filtered  = getFilteredProducts();
  const grid      = document.getElementById('productsGrid');
  if (!grid) return;
  const se       = document.getElementById('catalogSearch');
  const ce       = document.getElementById('catalogCategory');
  const query    = se?.value ? se.value.trim() : '';
  const category = ce?.value ? ce.value.trim() : '';

  const pc = document.getElementById('productsCount');
  if (pc) {
    const total = filtered.length;
    const ip = PAGINATION_CONFIG.itemsPerPage;
    const cp = PAGINATION_CONFIG.currentPage;
    const start = Math.min(total, cp * ip);
    const end = cp * ip;
    if (total > 0) {
      pc.innerHTML = `<span class="count-label">Página</span><span class="count-current">${cp}</span>
        <span class="count-range">${start}-${end}</span>
        ${!category && !query ? `<span class="count-label">Total:</span>
        <span class="categoria-badge" style="background:var(--rojo);color:#fff;padding:0.2rem 0.7rem;border-radius:20px;font-size:0.75rem;font-weight:600;">${total} productos</span>` : ''}`;
      pc.style.display = 'inline-flex';
    } else { pc.style.display = 'none'; }
  }

  const ca = document.getElementById('categoryActive');
  const cn = document.getElementById('categoryName');
  if (ca && cn) {
    if (category) {
      const count = products.filter(p => (p.cat||'').toLowerCase() === category.toLowerCase()).length;
      cn.textContent = category + ' (' + count + ' productos)';
      ca.style.display = 'inline-flex';
    } else { ca.style.display = 'none'; }
  }

  if (filtered.length === 0 && (query || category)) {
    grid.innerHTML = `<div class="catalog-empty" style="grid-column:1/-1;text-align:center;padding:3rem 2rem;background:var(--bg3);border:1px solid var(--borde);border-radius:12px;">
      <p style="font-size:1rem;color:var(--texto);margin-bottom:.5rem;">No hay productos con los filtros seleccionados.</p>
      <p style="font-size:.85rem;color:var(--muted);">Cambia la categoría o el texto de búsqueda.</p></div>`;
    const pgc = document.getElementById('paginationControls');
    if (pgc) pgc.style.display = 'none';
    return;
  }

  const total = filtered.length;
  const ip    = PAGINATION_CONFIG.itemsPerPage;
  const tp    = Math.ceil(total / ip);
  if (PAGINATION_CONFIG.currentPage > tp) PAGINATION_CONFIG.currentPage = tp || 1;
  if (PAGINATION_CONFIG.currentPage < 1)  PAGINATION_CONFIG.currentPage = 1;

  const start   = (PAGINATION_CONFIG.currentPage - 1) * ip;
  const page    = filtered.slice(start, start + ip);
  const grouped = {};
  page.forEach(p => { if (!grouped[p.cat]) grouped[p.cat] = []; grouped[p.cat].push(p); });

  let html = ''; let delay = 0;
  Object.keys(grouped).forEach((cat, i) => {
    if (i > 0) html += `<div class="prod-category-header"><span>${escapeHtml(cat)}</span></div>`;
    grouped[cat].forEach(p => {
      const hasMedia   = p.imgs.length > 1 || !!p.video;
      const mediaCount = p.imgs.length + (p.video ? 1 : 0);
      html += `
        <div class="prod-card" style="--card-delay:${delay*0.07}s" onclick="openModal('${p.id}')">
          <div class="prod-img-wrap">
            <img src="${escapeAttr(p.imgs[0])}" alt="${escapeAttr(p.name)}" loading="lazy"/>
            ${p.watermark ? `<img src="${escapeAttr(p.watermark)}" alt="" class="prod-watermark"/>` : ''}
            <span class="prod-badge">${escapeHtml(p.badge)}</span>
            ${hasMedia ? `<span class="prod-gallery-count">${p.video ? '🎬' : '📷'} ${mediaCount}</span>` : ''}
          </div>
          <div class="prod-body">
            <div class="prod-cat">${escapeHtml(p.cat)}</div>
            <div class="prod-name">${escapeHtml(p.name)}</div>
            <div class="prod-desc">${escapeHtml(p.desc)}</div>
            <div class="prod-specs">${(p.tags||[]).map(t=>`<span class="spec-tag">${escapeHtml(t)}</span>`).join('')}</div>
            <div class="prod-footer"><button class="prod-btn">Ver más →</button></div>
          </div>
        </div>`;
      delay++;
    });
  });
  grid.innerHTML = html;
  renderPaginationControls(tp, PAGINATION_CONFIG.currentPage);
}

function renderPaginationControls(totalPages, currentPage) {
  let pg = document.getElementById('paginationControls');
  if (!pg) {
    const sec = document.getElementById('products');
    if (!sec) return;
    pg = document.createElement('div');
    pg.id = 'paginationControls';
    pg.className = 'pagination-controls';
    sec.appendChild(pg);
  }
  if (totalPages <= 1) {
    pg.innerHTML = `<div class="pagination-info"><span class="pagination-current">1</span><span class="pagination-separator">/</span><span class="pagination-total">1</span></div>`;
    pg.style.display = 'flex'; return;
  }
  pg.innerHTML = `
    <button class="pagination-btn" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''}>&#8249;</button>
    <div class="pagination-info">
      <span class="pagination-current">${currentPage}</span>
      <span class="pagination-separator">/</span>
      <span class="pagination-total">${totalPages}</span>
    </div>
    <button class="pagination-btn" onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>&#8250;</button>`;
  pg.style.display = 'flex';
}

function changePage(page) {
  const f  = getFilteredProducts();
  const tp = Math.ceil(f.length / PAGINATION_CONFIG.itemsPerPage);
  if (page < 1 || page > tp) return;
  PAGINATION_CONFIG.currentPage = page;
  renderProducts();
  const sec = document.getElementById('products');
  if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
}

function setupCatalogFilters() {
  fillCategorySelect();
  const se    = document.getElementById('catalogSearch');
  const ce    = document.getElementById('catalogCategory');
  const mob_c = document.getElementById('mobileMenuCategory');
  const mob_s = document.getElementById('mobileMenuSearch');
  const sb    = document.getElementById('navSearchBox');
  const st    = document.getElementById('navSearchTrigger');
  if (se) {
    se.addEventListener('input', () => { PAGINATION_CONFIG.currentPage = 1; renderProducts(); });
    se.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); renderProducts(); document.getElementById('products').scrollIntoView({ behavior: 'instant' }); }
    });
  }
  if (ce) ce.addEventListener('change', () => { PAGINATION_CONFIG.currentPage = 1; renderProducts(); document.getElementById('products').scrollIntoView({ behavior: 'instant' }); });
  if (mob_c) mob_c.addEventListener('change', () => {
    const nl = document.getElementById('navLinks');
    if (nl && nl.classList.contains('open')) toggleMobileMenu();
    if (ce) ce.value = mob_c.value;
    PAGINATION_CONFIG.currentPage = 1;
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'instant' });
  });
  if (mob_s) {
    mob_s.addEventListener('input', () => { if (se) { se.value = mob_s.value; PAGINATION_CONFIG.currentPage = 1; renderProducts(); } });
    mob_s.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (se) { se.value = mob_s.value; renderProducts(); }
        const nl = document.getElementById('navLinks');
        if (nl && nl.classList.contains('open')) toggleMobileMenu();
        document.getElementById('products').scrollIntoView({ behavior: 'instant' });
      }
    });
  }
  if (sb && st && se) {
    st.addEventListener('click', () => { const exp = sb.classList.toggle('expanded'); st.setAttribute('aria-expanded', exp); if (exp) se.focus(); });
    se.addEventListener('blur', () => { setTimeout(() => { sb.classList.remove('expanded'); st.setAttribute('aria-expanded', 'false'); }, 180); });
    se.addEventListener('keydown', e => { if (e.key === 'Escape') { se.blur(); sb.classList.remove('expanded'); st.setAttribute('aria-expanded', 'false'); } });
  }
}

// ========================================
// MODAL
// ========================================
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  // Inicializar zoom del modal
  if (typeof modalZoomInit === 'function') modalZoomInit();

  const mainWrap = document.getElementById('modalImgMain').parentElement;
  const oldVideo = mainWrap.querySelector('.modal-video-wrap');
  if (oldVideo) oldVideo.remove();

  const mainImg = document.getElementById('modalImgMain');
  mainImg.style.display   = '';
  mainImg.style.opacity   = '1';
  mainImg.style.transform = 'scale(1)';

  const mb    = document.getElementById('modalBody');
  const oldWm = mb.querySelector('.modal-watermark');
  if (oldWm) oldWm.remove();
  if (p.watermark) {
    const wm = document.createElement('img');
    wm.src = p.watermark; wm.className = 'modal-watermark';
    mb.appendChild(wm);
  }

  document.getElementById('modalTitulo').textContent = p.name;

  mainImg.src = p.imgs[0];
  mainImg.alt = 'Imagen de ' + p.name;
  mainImg.removeAttribute('srcset');
  mainImg.removeAttribute('sizes');
  mainImg.style.cursor = 'zoom-in';
  mainImg.onclick = (e) => { e.stopPropagation(); abrirLightbox(mainImg.src, p.name); };

  mainWrap.querySelectorAll('.modal-nav-arrow').forEach(a => a.remove());
  if (p.imgs.length > 1) {
    const arrowL = document.createElement('button');
    arrowL.className = 'modal-nav-arrow left'; arrowL.innerHTML = '&#8249;';
    arrowL.setAttribute('aria-label', 'Imagen anterior');
    arrowL.onclick = (e) => { e.stopPropagation(); if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(-1); };
    const arrowR = document.createElement('button');
    arrowR.className = 'modal-nav-arrow right'; arrowR.innerHTML = '&#8250;';
    arrowR.setAttribute('aria-label', 'Imagen siguiente');
    arrowR.onclick = (e) => { e.stopPropagation(); if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(1); };
    mainWrap.appendChild(arrowL);
    mainWrap.appendChild(arrowR);
  }

  const thumbsEl   = document.getElementById('modalThumbs');
  const hasVideo   = !!p.video;
  const totalItems = p.imgs.length + (hasVideo ? 1 : 0);

  if (totalItems > 1) {
    const imgThumbs = p.imgs.map((img, i) => `
      <div class="modal-thumb ${i === 0 ? 'active' : ''}"
           onclick="if(typeof modalZoomCleanup==='function')modalZoomCleanup(); cambiarImg('${escapeAttr(img)}', this)"
           role="tab" data-type="img" aria-label="Imagen ${i + 1} de ${p.imgs.length}">
        <img src="${escapeAttr(img)}" alt="Vista ${i + 1}" loading="lazy"/>
      </div>`).join('');
    const videoThumb = hasVideo ? (() => {
      const embed   = getVideoEmbed(p.video);
      const thumbBg = embed?.thumb
        ? `style="background-image:url('${embed.thumb}');background-size:cover;background-position:center;"`
        : '';
      return `
        <div class="modal-thumb modal-thumb-video"
             onclick="if(typeof modalZoomCleanup==='function')modalZoomCleanup(); cambiarAVideo('${escapeAttr(p.video)}', this)"
             role="tab" data-type="video" ${thumbBg} aria-label="Ver video del producto">
          <span class="thumb-play-icon">&#9654;</span>
        </div>`;
    })() : '';
    thumbsEl.innerHTML = imgThumbs + videoThumb;
    thumbsEl.style.display = 'flex';
  } else {
    thumbsEl.innerHTML = '';
    thumbsEl.style.display = 'none';
  }

  document.getElementById('modalInfo').innerHTML = `
    <span class="modal-badge">${escapeHtml(p.badge)}</span>
    <div class="modal-cat">${escapeHtml(p.cat)}</div>
    <div class="modal-name">${escapeHtml(p.name)}</div>
    <div class="modal-desc">${escapeHtml(p.desc)}</div>
    <table class="modal-tabla">
      ${(p.specs||[]).map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(v||'-'))}</td></tr>`).join('')}
    </table>
    <div class="modal-apps"><h4>Aplicaciones</h4>
      <ul>${(p.apps||[]).map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul>
    </div>
    ${p.doc ? `<button class="modal-pdf-btn" onclick="event.stopPropagation();abrirPDF('${escapeAttr(p.doc)}','${escapeAttr(p.name)}')">&#128196; Ver Ficha Técnica ${escapeHtml(p.name)}</button>` : ''}
    <a href="${WP}?text=${encodeURIComponent('Hola, me interesa el '+p.name+'. ¿Pueden darme información y precio?')}"
       target="_blank" rel="noopener noreferrer" class="modal-wp">${WP_SVG} Consultar por WhatsApp</a>`;

  openModal._currentImgIdx = 0;
  openModal._imgs          = p.imgs;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  openModal._prev = document.activeElement;

  const enfocables = document.getElementById('modal').querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  const first = enfocables[0], last = enfocables[enfocables.length - 1];
  function trap(e) {
    if (e.key === 'ArrowRight') { if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(1); return; }
    if (e.key === 'ArrowLeft')  { if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(-1); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  }
  document.addEventListener('keydown', trap);
  openModal._trap = trap;
  if (first) first.focus();
}

function navegarGaleria(dir) {
  const imgs = openModal._imgs;
  if (!imgs || imgs.length <= 1) return;
  openModal._currentImgIdx = (openModal._currentImgIdx + dir + imgs.length) % imgs.length;
  const idx   = openModal._currentImgIdx;
  const thumb = document.querySelectorAll('.modal-thumb[data-type="img"]')[idx];
  if (thumb) cambiarImg(imgs[idx], thumb);
}

function cambiarAVideo(url, el) {
  const embed = getVideoEmbed(url);
  if (!embed) return;
  const mainImg  = document.getElementById('modalImgMain');
  const mainWrap = mainImg.parentElement;
  mainWrap.querySelectorAll('.modal-nav-arrow').forEach(a => a.style.display = 'none');
  mainImg.style.display = 'none';
  const old = mainWrap.querySelector('.modal-video-wrap');
  if (old) old.remove();
  const videoWrap = document.createElement('div');
  videoWrap.className = 'modal-video-wrap';
  if (embed.type === 'iframe') {
    videoWrap.innerHTML = `<iframe src="${embed.src}" frameborder="0" allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      title="Video del producto" style="width:100%;height:100%;border:none;"></iframe>`;
  } else {
    videoWrap.innerHTML = `<video controls autoplay playsinline preload="auto"
      style="width:100%;height:100%;object-fit:contain;background:#000;">
      <source src="${embed.src}" type="video/mp4"/>
    </video>`;
  }
  mainWrap.appendChild(videoWrap);
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function cambiarImg(src, el) {
  const mainImg  = document.getElementById('modalImgMain');
  const mainWrap = mainImg.parentElement;
  const videoWrap = mainWrap.querySelector('.modal-video-wrap');
  if (videoWrap) videoWrap.remove();
  mainImg.style.display = '';
  mainWrap.querySelectorAll('.modal-nav-arrow').forEach(a => a.style.display = '');
  mainImg.style.transform  = 'scale(1)';
  mainImg.style.opacity    = '0';
  mainImg.style.transition = 'opacity 0.15s ease';
  setTimeout(() => {
    mainImg.src = src;
    mainImg.removeAttribute('srcset');
    mainImg.style.opacity = '1';
    mainImg.style.cursor  = 'zoom-in';
    mainImg.onclick = (e) => { e.stopPropagation(); abrirLightbox(src, ''); };
    // Reinicializar zoom para la nueva imagen
    if (typeof modalZoomInit === 'function') modalZoomInit();
  }, 150);
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const idx = Array.from(document.querySelectorAll('.modal-thumb[data-type="img"]')).indexOf(el);
  if (idx !== -1) openModal._currentImgIdx = idx;
}

function cerrarModal(e) { if (e.target === document.getElementById('modalOverlay')) cerrarModalBtn(); }

function cerrarModalBtn() {
  if (typeof modalZoomCleanup === 'function') modalZoomCleanup();
  const mainWrap = document.getElementById('modalImgMain')?.parentElement;
  if (mainWrap) {
    const videoWrap = mainWrap.querySelector('.modal-video-wrap');
    if (videoWrap) videoWrap.remove();
    const mainImg = document.getElementById('modalImgMain');
    if (mainImg) { mainImg.style.display = ''; mainImg.style.opacity = '1'; mainImg.style.transform = 'scale(1)'; }
    mainWrap.querySelectorAll('.modal-nav-arrow').forEach(a => a.style.display = '');
  }
  if (openModal._trap) { document.removeEventListener('keydown', openModal._trap); openModal._trap = null; }
  if (openModal._prev) { openModal._prev.focus(); openModal._prev = null; }
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const lb = document.getElementById('lightboxOverlay');
  if (lb && lb.classList.contains('open')) { cerrarLightbox(); return; }
  const pdfO = document.getElementById('pdfOverlay');
  if (pdfO && pdfO.style.display === 'flex') cerrarPDF();
  else cerrarModalBtn();
});

// ========================================
// PDF
// ========================================
function abrirPDF(url, nombre) {
  let pdfO = document.getElementById('pdfOverlay');
  if (!pdfO) {
    pdfO = document.createElement('div');
    pdfO.id = 'pdfOverlay';
    pdfO.style.cssText = 'position:fixed;inset:0;z-index:3000;background:rgba(13,27,42,0.9);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:1rem';
    document.body.appendChild(pdfO);
  }
  const mob = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const src = mob ? 'https://docs.google.com/viewer?url=' + encodeURIComponent(url) + '&embedded=true' : url;
  pdfO.innerHTML = `
    <div style="width:100%;max-width:960px;display:flex;flex-direction:column;height:100%;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;margin-bottom:0.75rem;background:#fff;border:1px solid var(--borde);border-radius:10px;flex-shrink:0;gap:0.75rem;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:700;color:var(--titulo);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">&#128196; ${escapeHtml(nombre)}</span>
        <button onclick="cerrarPDF()" style="width:36px;height:36px;border-radius:8px;border:1px solid var(--borde);background:transparent;color:var(--titulo);font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;" aria-label="Cerrar">&#10005;</button>
      </div>
      <iframe src="${src}" style="flex:1;width:100%;border:none;border-radius:10px;background:#fff;min-height:0;" title="Ficha Técnica ${escapeHtml(nombre)}"></iframe>
    </div>`;
  pdfO.style.display = 'flex';
}
function cerrarPDF() { const o = document.getElementById('pdfOverlay'); if (o) o.style.display = 'none'; }

// ========================================
// MENÚ MÓVIL
// ========================================
function toggleMobileMenu() {
  const h  = document.getElementById('navHamburger');
  const nl = document.getElementById('navLinks');
  const ov = document.getElementById('navMobileOverlay');
  if (!h || !nl) return;
  const open = h.classList.toggle('active');
  nl.classList.toggle('open');
  if (ov) ov.classList.toggle('open');
  h.setAttribute('aria-expanded', open);
}

// ========================================
// LIGHTBOX — min 1x, max 4x, pan libre
// ========================================
const LBState = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0, pinchDist: 0, pinchScale: 1 };
const LB_MIN = 1;
const LB_MAX = 1.15;  // Usuario: límite 15% aumento lightbox

function lbApply() {
  const img = document.getElementById('lbImg');
  if (img) img.style.transform = `translate(${LBState.x}px,${LBState.y}px) scale(${LBState.scale})`;
}
function lbReset() {
  LBState.scale = 1; LBState.x = 0; LBState.y = 0;
  const img = document.getElementById('lbImg');
  if (img) { img.style.transition = 'transform .3s ease'; lbApply(); setTimeout(() => { if (img) img.style.transition = 'none'; }, 320); }
}
function lbZoom(delta) {
  LBState.scale = Math.max(LB_MIN, Math.min(LB_MAX, LBState.scale + delta));
  lbApply();
}

function abrirLightbox(src, nombre) {
  let lb = document.getElementById('lightboxOverlay');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightboxOverlay';
    lb.innerHTML = `
      <button class="lb-close" onclick="cerrarLightbox()" aria-label="Cerrar">&#10005;</button>
      <div class="lb-img-wrap" id="lbWrap">
        <img id="lbImg" src="" alt="" draggable="false"/>
      </div>
      <div class="lb-controls">
        <button class="lb-ctrl-btn" onclick="lbZoom(0.3)" title="Acercar">&#65291;</button>
        <button class="lb-ctrl-btn" onclick="lbZoom(-0.3)" title="Alejar">&#65293;</button>
        <button class="lb-ctrl-btn" onclick="lbReset()" title="Restablecer">&#8635;</button>
        <span class="lb-hint">Arrastra · Pellizca · Doble tap para resetear</span>
      </div>`;
    document.body.appendChild(lb);

    const wrap = document.getElementById('lbWrap');
    const img  = document.getElementById('lbImg');

    lb.addEventListener('click', e => { if (e.target === lb) cerrarLightbox(); });
    img.addEventListener('dblclick', lbReset);

    wrap.addEventListener('mousedown', e => {
      LBState.dragging = true; LBState.lastX = e.clientX; LBState.lastY = e.clientY;
      img.style.cursor = 'grabbing'; e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!LBState.dragging) return;
      LBState.x += e.clientX - LBState.lastX; LBState.y += e.clientY - LBState.lastY;
      LBState.lastX = e.clientX; LBState.lastY = e.clientY; lbApply();
    });
    window.addEventListener('mouseup', () => { LBState.dragging = false; img.style.cursor = 'grab'; });

    wrap.addEventListener('wheel', e => { e.preventDefault(); lbZoom(e.deltaY < 0 ? 0.2 : -0.2); }, { passive: false });

    wrap.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        LBState.lastX = e.touches[0].clientX; LBState.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        LBState.pinchDist  = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        LBState.pinchScale = LBState.scale;
      }
    }, { passive: true });

    wrap.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        LBState.x += e.touches[0].clientX - LBState.lastX; LBState.y += e.touches[0].clientY - LBState.lastY;
        LBState.lastX = e.touches[0].clientX; LBState.lastY = e.touches[0].clientY; lbApply();
      } else if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        // Restringir entre LB_MIN y LB_MAX
        LBState.scale = Math.max(LB_MIN, Math.min(LB_MAX, LBState.pinchScale * (d / LBState.pinchDist)));
        lbApply();
      }
    }, { passive: false });
  }

  // Reset al abrir — siempre empieza en 1x
  LBState.scale = 1; LBState.x = 0; LBState.y = 0; LBState.dragging = false;
  const img = document.getElementById('lbImg');
  img.src = src; img.alt = nombre || '';
  img.style.transform = ''; img.style.transition = 'none'; img.style.cursor = 'grab';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
  const lb = document.getElementById('lightboxOverlay');
  if (lb) { lb.classList.remove('open'); lbReset(); }
  // No tocar body overflow — modal sigue abierto
}

// ========================================
// ENLACE ACTIVO
// ========================================
function initActiveMenuLink() {
  const secs  = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  if (!secs.length || !links.length) return;
  function update() {
    const sp   = window.scrollY + 150;
    const hero = document.querySelector('.hero')?.offsetHeight || 600;
    if (sp < hero) { links.forEach(l => l.classList.remove('active')); return; }
    secs.forEach(s => {
      if (sp >= s.offsetTop && sp < s.offsetTop + s.offsetHeight) {
        links.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === '#' + s.id) l.classList.add('active'); });
      }
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', function () {
  document.body.setAttribute('data-theme', 'light');
  initCache();
  initIntroAudio();
  loadProducts();
  setupCatalogFilters();
  initActiveMenuLink();
  initZoomControls();

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});