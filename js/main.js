/**
======================================================================
PA ACOUSTIC — main.js
======================================================================
**/

const WP = 'https://wa.me/573053402732';
const WP_SVG = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

/** Sube en 1 cuando cambies categorías/productos en data/products.json (rompe caché en GitHub Pages y móviles). */
const CATALOG_JSON_VERSION = 3;

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
    // Cache selector categoría (sincronizado con sidebar; puede estar oculto)
    domCache.catalogCategory    = document.getElementById('catalogCategory');
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
  // Objeto configuración paginación (6 productos por página, página actual 1)
  const PAGINATION_CONFIG = { itemsPerPage: 6, currentPage: 1 };

  /** Estado del audio intro (hero); compartido para pausar al abrir catálogo o modal. */
  const introAudioState = { started: false };

  function introAudioInHeroZone() {
    const hero = document.querySelector('.hero');
    if (!hero) return window.scrollY < 120;
    const bottom = hero.getBoundingClientRect().bottom;
    return bottom > window.innerHeight * 0.52;
  }

  function forceStopIntroAudio() {
    introAudioState.started = false;
    const audio = document.getElementById('introAudio');
    if (!audio) return;
    audio.pause();
    audio.volume = 0.6;
  }

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
    hideCategoryFlyout();
    document.getElementById('mainNavbar')?.classList.remove('nav-search-open');
    document.getElementById('navMobileSearchToggle')?.setAttribute('aria-expanded', 'false');
    // Scroll suave instantáneo a posición 0 (top página)
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Limpia clase 'active' de todos enlaces navegación
    clearNavActive();
  }
  // Event handler click enlaces navegación principal
  function handleNavClick(e, sectionId) {
    if (sectionId === 'products') forceStopIntroAudio();
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
  // Inicializa reproducción audio intro solo en la zona del hero (no en catálogo ni al abrir modal)
  function initIntroAudio() {
    const audio = document.getElementById('introAudio');
    if (!audio) return;
    function stop() {
      let fade = setInterval(() => {
        if (audio.volume > 0.05) audio.volume -= 0.05;
        else { clearInterval(fade); audio.pause(); audio.volume = 0.6; introAudioState.started = false; }
      }, 80);
    }
    function play() {
      if (introAudioState.started || !introAudioInHeroZone()) return;
      introAudioState.started = true;
      audio.volume = 0.5;
      audio.play().catch(() => { introAudioState.started = false; });
    }
    window.addEventListener('scroll', () => {
      if (!introAudioInHeroZone() && introAudioState.started) stop();
      if (introAudioInHeroZone() && !introAudioState.started) play();
    }, { passive: true });
    if (introAudioInHeroZone()) play();
    document.addEventListener('click', function f(e) {
      if (introAudioInHeroZone() && e.target.closest('.hero')) play();
    }, { once: true, capture: true });
    document.addEventListener('pointerdown', e => {
      if (e.target.closest('#products, .banner-wrap')) forceStopIntroAudio();
    }, { capture: true });
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
    const response = await fetch(`data/products.json?v=${CATALOG_JSON_VERSION}`, { cache: 'no-store' });
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
      
      // ✅ Multi-video support: collect video, video2, video3+, etc.
      const videos = [];
      for (let key of Object.keys(p)) {
        if (key.startsWith('video') && p[key]) {
          videos.push(p[key]);
        }
      }
      
      const nid = typeof p.id === 'number' && !Number.isNaN(p.id)
        ? p.id
        : (parseInt(String(p.id), 10) || 999999);
      return {
        // ID único lowercase-kebab-case desde name
        id:        p.name.toLowerCase().replace(/\s+/g, '-'),
        // Id numérico original JSON (referencia; el listado se ordena por nombre)
        nid,
        // Nombre en mayúsculas
        name:      p.name.toUpperCase(),
        // Categoría o "Parlantes" por defecto
        cat:       p.category || "Parlantes",
        subcat:    (p.subcategory && String(p.subcategory).trim()) ? String(p.subcategory).trim() : "",
        badge:     "Producto", // Badge fijo todos productos
        // Descripción o texto por defecto
        desc:      p.description || "Producto de audio profesional",
        imgs:      gallery, // Array imágenes procesado
        videos,    // ✅ Array videos procesado
        bannerImg: p.bannerImg || null,
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
        doc:       p.document || null // PDF ficha técnica opcional
      };
    });
    products.sort(compareProductsCatalog);
    window.PAcousticCatalog = products;
    // document (no window): CustomEvent no burbujea por defecto; chatAdvisor escucha en document.
    try {
      document.dispatchEvent(new CustomEvent('pacoustic:catalog-ready', { bubbles: true }));
    } catch (_) {}
    // Renderiza banner con productos cargados
    renderBanner();
    fillCategorySelect();
    renderSidebarCategories();
    // Renderiza grid productos inicial
    renderProducts();
  } catch (e) {
    // Log error consola (desarrollo/debug)
    console.error("Error cargando products.json:", e);
    window.PAcousticCatalog = [];
    try {
      document.dispatchEvent(new CustomEvent('pacoustic:catalog-ready', { bubbles: true }));
    } catch (_) {}
  }
}

// ========================================
// BANNER
// ========================================
function onBannerItemClick(id) {
  forceStopIntroAudio();
  document.getElementById('products').scrollIntoView({ behavior: 'instant' });
  setTimeout(() => openModal(id), 450);
}
function renderBanner() {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  const items = products
    .filter(p => p.bannerImg && p.bannerImg.trim() !== '')
    .map(p => ({ src: p.bannerImg, alt: p.name, id: p.id }));
  const dup = [...items, ...items, ...items];
  track.innerHTML = dup.map(({ src, alt, id }) => `
    <div class="banner-item" onclick="onBannerItemClick('${id}')" role="button" tabindex="0" aria-label="Ver ${escapeAttr(alt)}">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="eager" decoding="async"/>
    </div>`).join('');
  initBannerItemSizing(track);
}

function rootRemPx() {
  const fs = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(fs) && fs > 0 ? fs : 16;
}

/** Ancho útil dentro de .banner-wrap (rect − padding); evita desajuste 100vw vs caja real en móvil. */
function getBannerInnerWidthPx(wrap) {
  if (!wrap) return 0;
  const cs = getComputedStyle(wrap);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  const w = wrap.getBoundingClientRect().width - pl - pr;
  return w > 48 ? Math.floor(w) : 0;
}

/** Ancho del slide: en móvil = ancho interior real del wrap (no 100vw, que suele ser más ancho y rompe object-fit). */
function getBannerSlideTargetWidth() {
  const vw = window.innerWidth || document.documentElement.clientWidth || 400;
  const rem = rootRemPx();
  const wrap = document.querySelector('.banner-wrap');

  if (vw <= 768) {
    const inner = getBannerInnerWidthPx(wrap);
    if (inner > 48) return Math.max(100, inner);
    if (wrap) {
      const cs = getComputedStyle(wrap);
      const pl = parseFloat(cs.paddingLeft) || 0;
      const pr = parseFloat(cs.paddingRight) || 0;
      const inner2 = Math.floor(wrap.clientWidth - pl - pr);
      if (inner2 > 48) return Math.max(100, inner2);
    }
    return Math.max(100, Math.floor(vw));
  }

  const inner = wrap ? getBannerInnerWidthPx(wrap) : 0;
  let slot = Math.min(820, vw - 2.75 * rem);
  slot = Math.floor(Math.min(slot, inner > 48 ? inner : wrap?.clientWidth || vw));
  return Math.max(100, slot);
}

/** Altura en px si la imagen se escala a ancho `w` manteniendo proporción natural. */
function getBannerImageDisplayHeight(img, w) {
  if (img.naturalWidth < 2) return 0;
  return (w * img.naturalHeight) / img.naturalWidth;
}

/**
 * Mayor altura entre todas las imágenes ya decodificadas (la más “larga/alta” marca el marco común).
 */
function getBannerMaxDisplayHeightForWidth(track, w) {
  let maxH = 0;
  track.querySelectorAll('.banner-item img').forEach(img => {
    const h = getBannerImageDisplayHeight(img, w);
    if (h > maxH) maxH = h;
  });
  return maxH;
}

/**
 * Misma altura H para todos los slides + altura explícita del #bannerTrack (evita hueco negro enorme en móvil).
 * H = altura al ancho w de la imagen más alta; el resto rellena el marco con object-fit: cover (sin bandas).
 * Sin imágenes cargadas aún: fallback compacto en móvil.
 */
function relayoutAllBannerItems() {
  const track = document.getElementById('bannerTrack');
  if (!track) return;
  const vw = window.innerWidth || document.documentElement.clientWidth || 400;
  const vh = Math.max(
    window.innerHeight || 0,
    window.visualViewport?.height || 0,
    document.documentElement?.clientHeight || 0
  ) || 600;
  let w = getBannerSlideTargetWidth();
  if (vw > 768) {
    const probe = track.querySelector('.banner-item');
    if (probe) {
      probe.style.width = '';
      probe.style.flex = '';
      void probe.offsetWidth;
      const rw = probe.getBoundingClientRect().width;
      if (rw > 60 && rw <= vw + 24) w = Math.min(w, Math.round(rw));
    }
  }

  const rowCap = vw <= 768 ? Math.min(vh * 0.82, 780) : Math.min(vh * 0.94, 920);
  const maxH = getBannerMaxDisplayHeightForWidth(track, w);

  let H;
  if (maxH < 1) {
    if (vw <= 768) {
      H = Math.round(Math.min(Math.max(vw * 0.72, 280), rowCap));
    } else {
      H = Math.round(Math.min(380, rowCap));
    }
  } else {
    H = Math.round(Math.min(Math.max(maxH, vw <= 768 ? 160 : 140), rowCap));
  }

  const wrap = track.parentElement?.classList?.contains('banner-wrap')
    ? track.parentElement
    : document.querySelector('.banner-wrap');
  if (wrap) {
    if (vw <= 768) wrap.style.setProperty('--banner-slide-w', `${Math.round(w)}px`);
    else wrap.style.removeProperty('--banner-slide-w');
  }

  track.querySelectorAll('.banner-item').forEach(item => {
    item.style.width = `${Math.round(w)}px`;
    item.style.flex = `0 0 ${Math.round(w)}px`;
    item.style.height = `${H}px`;
  });

  track.style.height = `${H}px`;
  track.style.maxHeight = `${H}px`;
  track.style.minHeight = '0';
  track.style.overflow = 'hidden';
}

function bindBannerItemImage(img) {
  const run = () => relayoutAllBannerItems();
  if (img.complete && img.naturalWidth > 1) run();
  else {
    img.addEventListener('load', run, { once: true });
    img.addEventListener('error', run, { once: true });
  }
}

function initBannerItemSizing(track) {
  if (!track) return;
  track.querySelectorAll('.banner-item img').forEach(bindBannerItemImage);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => relayoutAllBannerItems());
  });
  ensureBannerLayoutObserver();
}

let _bannerLayoutIo = null;
function ensureBannerLayoutObserver() {
  const wrap = document.querySelector('.banner-wrap');
  if (!wrap || wrap.dataset.bannerLayoutIo === '1') return;
  wrap.dataset.bannerLayoutIo = '1';
  _bannerLayoutIo = new IntersectionObserver(
    () => scheduleBannerRelayout(),
    { root: null, rootMargin: '120px 0px 120px 0px', threshold: [0, 0.01] }
  );
  _bannerLayoutIo.observe(wrap);
}

let _bannerResizeT = null;
function scheduleBannerRelayout() {
  clearTimeout(_bannerResizeT);
  _bannerResizeT = setTimeout(relayoutAllBannerItems, 100);
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
function normFilterStr(s) {
  return String(s || '').trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Fila/tile del flyout activo si coincide categoría + sub con el filtro del catálogo. */
function isFlyoutItemActive(flyCategory, btnSub) {
  const curCat = (document.getElementById('catalogCategory')?.value || '').trim();
  const curSub = (document.getElementById('catalogSubcategory')?.value || '').trim();
  if (normFilterStr(flyCategory) !== normFilterStr(curCat)) return false;
  const s = String(btnSub == null ? '' : btnSub).trim();
  const cs = String(curSub || '').trim();
  if (!cs && !s) return true;
  return normFilterStr(cs) === normFilterStr(s);
}

/** Catálogo: A–Z por categoría, luego subcategoría, luego nombre (números en orden natural). */
function compareProductsCatalog(a, b) {
  const byCat = String(a.cat || '').localeCompare(String(b.cat || ''), 'es', { sensitivity: 'base', numeric: true });
  if (byCat !== 0) return byCat;
  const bySub = String(a.subcat || '').localeCompare(String(b.subcat || ''), 'es', { sensitivity: 'base', numeric: true });
  if (bySub !== 0) return bySub;
  return String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base', numeric: true });
}
function getRepresentativeImage(cat, subOptional) {
  const c = normFilterStr(cat);
  const s = subOptional ? normFilterStr(subOptional) : '';
  const p = products.find(pr => normFilterStr(pr.cat) === c && (!s || normFilterStr(pr.subcat) === s));
  return p?.imgs?.[0] || '';
}
function getProductSearchText(p) {
  return [p.name, p.cat, p.subcat, p.desc, (p.tags||[]).join(' '), (p.apps||[]).join(' ')]
    .join(' ').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
function getFilteredProducts() {
  const se = document.getElementById('catalogSearch');
  const ce = document.getElementById('catalogCategory');
  const su = document.getElementById('catalogSubcategory');
  const q  = se?.value ? se.value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '') : '';
  const c  = ce?.value ? normFilterStr(ce.value) : '';
  const s  = su?.value ? normFilterStr(su.value) : '';
  let list = products;
  if (c) {
    list = list.filter(p => normFilterStr(p.cat) === c);
    if (s) list = list.filter(p => normFilterStr(p.subcat) === s);
  }
  if (q) list = list.filter(p => getProductSearchText(p).includes(q));
  return list;
}
function getUniqueCategories() {
  const set = new Set();
  products.forEach(p => {
    const c = (p.cat || '').trim();
    if (c) set.add(c);
  });
  const preferred = ['Cabinas', 'Woofer', 'Drivers', 'Crossover'];
  const rest = [...set].filter(c => !preferred.includes(c)).sort((a, b) => a.localeCompare(b, 'es'));
  const ordered = [];
  preferred.forEach(p => { if (set.has(p)) ordered.push(p); });
  return [...ordered, ...rest];
}
function fillCategorySelect() {
  const sel = document.getElementById('catalogCategory');
  const mob = document.getElementById('mobileCatalogCategory');
  if (!sel && !mob) return;
  const cur = ((sel && sel.value) || (mob && mob.value) || '').trim();
  const cats = getUniqueCategories();
  const html = '<option value="">Todas las categorías</option>' +
    cats.map(c => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');
  if (sel) {
    sel.innerHTML = html;
    if (!cur) sel.value = '';
    else if (cats.includes(cur)) sel.value = cur;
    else sel.value = '';
  }
  if (mob) {
    mob.innerHTML = html;
    mob.value = sel ? (sel.value || '') : (cats.includes(cur) ? cur : '');
  }

  const su = document.getElementById('catalogSubcategory');
  if (!su) return;
  const catNow = ((sel && sel.value) || (mob && mob.value) || '').trim();
  if (!catNow) {
    su.value = '';
    return;
  }
  const validSubs = getSubcategoriesForCategory(catNow);
  const curSub = normFilterStr(su.value);
  if (!curSub || !validSubs.some(s => normFilterStr(s) === curSub)) su.value = '';
  else {
    const canonical = validSubs.find(s => normFilterStr(s) === curSub);
    if (canonical) su.value = canonical;
  }
}

function getSubcategoriesForCategory(cat) {
  const key = (cat || '').trim().toLowerCase();
  if (!key) return [];
  const subs = new Set();
  products.forEach(p => {
    if ((p.cat || '').trim().toLowerCase() !== key) return;
    const s = (p.subcat || '').trim();
    if (s) subs.add(s);
  });
  return [...subs].sort((a, b) => a.localeCompare(b, 'es'));
}

function getCategoryIcon(cat) {
  const icons = {
    Cabinas: '▣',
    Woofer: '◉',
    Drivers: '△',
    Crossover: '↔',
    Parlantes: '◇'
  };
  return icons[cat] || '▸';
}

let sidebarFlyoutHideT = null;
function clearSidebarFlyoutHideTimer() {
  if (sidebarFlyoutHideT) {
    clearTimeout(sidebarFlyoutHideT);
    sidebarFlyoutHideT = null;
  }
}
function scheduleSidebarFlyoutHide() {
  clearSidebarFlyoutHideTimer();
  sidebarFlyoutHideT = setTimeout(() => hideCategoryFlyout(), 200);
}

function suppressTodasActiveWhileFlyoutOpen() {
  const sb = document.getElementById('sidebar');
  const allBtn = document.querySelector('#sidebarCategories .sidebar-cat--all');
  if (!sb || !allBtn) return;
  if (allBtn.classList.contains('active')) {
    sb.dataset.todasActiveSuppressed = '1';
    allBtn.classList.remove('active');
  }
}

function restoreTodasActiveAfterFlyoutClose() {
  const sb = document.getElementById('sidebar');
  const allBtn = document.querySelector('#sidebarCategories .sidebar-cat--all');
  if (!sb || !allBtn || sb.dataset.todasActiveSuppressed !== '1') return;
  const curCat = (document.getElementById('catalogCategory')?.value || '').trim();
  const curSub = (document.getElementById('catalogSubcategory')?.value || '').trim();
  if (!curCat && !curSub) allBtn.classList.add('active');
  delete sb.dataset.todasActiveSuppressed;
}

function hideCategoryFlyout() {
  clearSidebarFlyoutHideTimer();
  restoreTodasActiveAfterFlyoutClose();
  document.getElementById('sidebar')?.classList.remove('sidebar--flyout-preview');
  document.querySelectorAll('.sidebar-cat--parent.is-flyout-open').forEach(el => el.classList.remove('is-flyout-open'));
  const fly = document.getElementById('sidebarFlyout');
  if (!fly) {
    updateSidebarCategoryActive();
    return;
  }
  fly.classList.remove('is-open', 'sidebar-flyout--sheet');
  fly.removeAttribute('data-open-cat');
  fly.setAttribute('aria-hidden', 'true');
  fly.innerHTML = '';
  fly.style.left = fly.style.top = fly.style.right = fly.style.bottom = fly.style.transform = fly.style.maxHeight = '';
  updateSidebarCategoryActive();
}

function showCategoryFlyout(anchorBtn) {
  clearSidebarFlyoutHideTimer();
  const cat = anchorBtn.getAttribute('data-cat');
  if (!cat) return;
  const subs = getSubcategoriesForCategory(cat);
  if (!subs.length) return;
  suppressTodasActiveWhileFlyoutOpen();
  const fly = document.getElementById('sidebarFlyout');
  const countAll = products.filter(p => (p.cat || '').toLowerCase() === cat.toLowerCase()).length;
  const isMobile = window.innerWidth <= 1024;
  const imgAll = getRepresentativeImage(cat, '');
  if (isMobile) {
    fly.innerHTML = `
      <div class="sidebar-flyout-title">${escapeHtml(cat)}</div>
      <div class="sidebar-flyout-inner sidebar-flyout-inner--grid" role="group" aria-label="Subcategorías de ${escapeAttr(cat)}">
        <button type="button" class="sidebar-flyout-tile${isFlyoutItemActive(cat, '') ? ' active' : ''}" data-cat="${escapeAttr(cat)}" data-sub="">
          <div class="sidebar-flyout-tile-img">${imgAll ? `<img src="${escapeAttr(imgAll)}" alt="" loading="lazy"/>` : '<span class="sidebar-flyout-placeholder" aria-hidden="true"></span>'}</div>
          <span class="sidebar-flyout-pill">Ver todos</span>
          <span class="sidebar-flyout-tile-n">${countAll}</span>
        </button>
        ${subs.map(sub => {
    const n = products.filter(
      p => (p.cat || '').toLowerCase() === cat.toLowerCase() && (p.subcat || '').trim().toLowerCase() === sub.toLowerCase()
    ).length;
    const img = getRepresentativeImage(cat, sub);
    return `<button type="button" class="sidebar-flyout-tile${isFlyoutItemActive(cat, sub) ? ' active' : ''}" data-cat="${escapeAttr(cat)}" data-sub="${escapeAttr(sub)}">
          <div class="sidebar-flyout-tile-img">${img ? `<img src="${escapeAttr(img)}" alt="" loading="lazy"/>` : '<span class="sidebar-flyout-placeholder" aria-hidden="true"></span>'}</div>
          <span class="sidebar-flyout-pill">${escapeHtml(sub)}</span>
          <span class="sidebar-flyout-tile-n">${n}</span>
        </button>`;
  }).join('')}
      </div>`;
  } else {
    fly.innerHTML = `
    <div class="sidebar-flyout-title">${escapeHtml(cat)}</div>
    <div class="sidebar-flyout-inner sidebar-flyout-inner--list" role="group" aria-label="Subcategorías de ${escapeAttr(cat)}">
      <button type="button" class="sidebar-flyout-row${isFlyoutItemActive(cat, '') ? ' active' : ''}" data-cat="${escapeAttr(cat)}" data-sub="">
        <span>Ver todos</span><span class="sidebar-flyout-n">${countAll}</span>
      </button>
      ${subs.map(sub => {
    const n = products.filter(
      p => (p.cat || '').toLowerCase() === cat.toLowerCase() && (p.subcat || '').trim().toLowerCase() === sub.toLowerCase()
    ).length;
    return `<button type="button" class="sidebar-flyout-row${isFlyoutItemActive(cat, sub) ? ' active' : ''}" data-cat="${escapeAttr(cat)}" data-sub="${escapeAttr(sub)}">
        <span>${escapeHtml(sub)}</span><span class="sidebar-flyout-n">${n}</span>
      </button>`;
  }).join('')}
    </div>`;
  }
  if (isMobile) {
    fly.classList.add('sidebar-flyout--sheet');
    fly.style.left = '50%';
    fly.style.right = 'auto';
    fly.style.transform = 'translateX(-50%)';
    fly.style.top = 'auto';
    fly.style.bottom = 'max(12px, env(safe-area-inset-bottom, 12px))';
    fly.style.maxHeight = 'min(78vh, 560px)';
  } else {
    fly.classList.remove('sidebar-flyout--sheet');
    const ar = anchorBtn.getBoundingClientRect();
    const fw = 272;
    const pad = 10;
    let left = ar.right + 6;
    if (left + fw > window.innerWidth - pad) left = Math.max(pad, ar.left - fw - 6);
    fly.style.left = `${left}px`;
    let top = ar.top;
    const maxH = Math.min(window.innerHeight - pad * 2, 440);
    fly.style.maxHeight = `${maxH}px`;
    const estH = 48 + subs.length * 44;
    if (top + estH > window.innerHeight - pad) top = Math.max(pad, window.innerHeight - estH - pad);
    if (top < pad) top = pad;
    fly.style.top = `${top}px`;
  }
  fly.dataset.openCat = cat;
  fly.classList.add('is-open');
  fly.setAttribute('aria-hidden', 'false');
  document.getElementById('sidebar')?.classList.add('sidebar--flyout-preview');
  document.querySelectorAll('.sidebar-cat--parent.is-flyout-open').forEach(el => el.classList.remove('is-flyout-open'));
  anchorBtn.classList.add('is-flyout-open');
  updateSidebarCategoryActive();
}

function onSidebarParentEnter(e) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  clearSidebarFlyoutHideTimer();
  showCategoryFlyout(e.currentTarget);
}

function onSidebarParentLeave() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  scheduleSidebarFlyoutHide();
}

function bindSidebarFlyoutTriggers() {
  const ul = document.getElementById('sidebarCategories');
  if (!ul) return;
  // Solo escritorio con ratón: en táctil, mouseleave entre filas programa un cierre
  // que mata el flyout recién abierto al cambiar de categoría (hace falta tocar dos veces).
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  ul.querySelectorAll('.sidebar-cat--parent[data-has-subs="1"]').forEach(btn => {
    btn.addEventListener('mouseenter', onSidebarParentEnter);
    btn.addEventListener('mouseleave', onSidebarParentLeave);
  });
}

function renderSidebarCategories() {
  const ul = document.getElementById('sidebarCategories');
  if (!ul) return;
  hideCategoryFlyout();
  const cats = getUniqueCategories();
  const curCat = (document.getElementById('catalogCategory')?.value || '').trim();
  const curSub = (document.getElementById('catalogSubcategory')?.value || '').trim();

  const todasActive = !curCat && !curSub;
  let html = `<li>
    <button type="button" class="sidebar-cat sidebar-cat--all${todasActive ? ' active' : ''}" data-cat="" data-sub="">
      <span class="sidebar-cat-ico" aria-hidden="true">⌂</span>
      <span class="sidebar-cat-label">Todas las categorías</span>
      <span class="sidebar-cat-meta"><span class="sidebar-cat-count" aria-label="${products.length} productos">${products.length}</span></span>
    </button>
  </li>`;

  cats.forEach(cat => {
    const subs = getSubcategoriesForCategory(cat);
    const countAll = products.filter(p => (p.cat || '').toLowerCase() === cat.toLowerCase()).length;
    const parentActive = curCat === cat && !curSub;
    const hasSubs = subs.length > 0;
    html += `<li class="sidebar-cat-group">
      <button type="button" class="sidebar-cat sidebar-cat--parent${parentActive ? ' active' : ''}${hasSubs ? ' has-subs' : ''}" data-cat="${escapeAttr(cat)}" data-sub=""${hasSubs ? ' data-has-subs="1"' : ''}>
        <span class="sidebar-cat-ico" aria-hidden="true">${getCategoryIcon(cat)}</span>
        <span class="sidebar-cat-label">${escapeHtml(cat)}</span>
        <span class="sidebar-cat-meta">
          <span class="sidebar-cat-count" aria-label="${countAll} productos">${countAll}</span>
          ${hasSubs ? '<span class="sidebar-cat-chev" aria-hidden="true"></span>' : ''}
        </span>
      </button>
    </li>`;
  });

  ul.innerHTML = html;
  bindSidebarFlyoutTriggers();
}

function updateSidebarCategoryActive() {
  const curCat = (document.getElementById('catalogCategory')?.value || '').trim();
  const curSub = (document.getElementById('catalogSubcategory')?.value || '').trim();
  const fly = document.getElementById('sidebarFlyout');
  const flyOpen = fly?.classList.contains('is-open');
  const openCat = (fly?.dataset.openCat || '').trim();

  document.querySelectorAll('#sidebarCategories .sidebar-cat').forEach(btn => {
    const c = (btn.getAttribute('data-cat') || '').trim();
    const s = (btn.getAttribute('data-sub') || '').trim();
    let on = false;
    if (!c && !s) {
      on = !curCat && !curSub;
      if (document.getElementById('sidebar')?.dataset.todasActiveSuppressed === '1') on = false;
      if (flyOpen && openCat) on = false;
    } else if (btn.classList.contains('sidebar-cat--parent')) {
      const hasSubs = btn.getAttribute('data-has-subs') === '1';
      if (hasSubs && flyOpen && openCat) {
        on = normFilterStr(c) === normFilterStr(openCat);
      } else if (c && !s) {
        on = curCat === c && !curSub;
      } else {
        on = curCat === c && curSub === s;
      }
    } else if (c && !s) {
      on = curCat === c && !curSub;
    } else {
      on = curCat === c && curSub === s;
    }
    btn.classList.toggle('active', on);
  });
  document.querySelectorAll('#sidebarCategories .sidebar-cat--parent').forEach(btn => {
    const c = (btn.getAttribute('data-cat') || '').trim();
    if (flyOpen && openCat) {
      btn.classList.toggle('has-sub-filter', normFilterStr(c) === normFilterStr(openCat) && !!curSub && normFilterStr(curCat) === normFilterStr(c));
    } else {
      btn.classList.toggle('has-sub-filter', !!curSub && curCat === c);
    }
  });
  if (fly?.classList.contains('is-open')) {
    const oc = fly.dataset.openCat || '';
    fly.querySelectorAll('.sidebar-flyout-row, .sidebar-flyout-tile').forEach(btn => {
      const s = btn.getAttribute('data-sub');
      btn.classList.toggle('active', isFlyoutItemActive(oc, s == null ? '' : s));
    });
  }
}

/** Scroll del documento a #products bajo la navbar fija (móvil y escritorio). */
function scrollWindowToProductsSection() {
  const products = document.getElementById('products');
  if (!products) return;
  const nav = document.getElementById('mainNavbar');
  const pad = 12;

  function run() {
    const navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    const y = products.getBoundingClientRect().top + window.pageYOffset - navH - pad;
    window.scrollTo({ top: Math.max(0, Math.round(y)), left: 0, behavior: 'auto' });
  }

  run();
  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
  setTimeout(run, 0);
  setTimeout(run, 80);
  setTimeout(run, 200);
}

function selectCatalogFilter(rawCat, rawSub) {
  hideCategoryFlyout();
  const cat = rawCat == null ? '' : String(rawCat).trim();
  let sub = rawSub == null ? '' : String(rawSub).trim();
  if (!cat) sub = '';
  const ce = document.getElementById('catalogCategory');
  const su = document.getElementById('catalogSubcategory');
  if (ce) ce.value = cat;
  const mobCat = document.getElementById('mobileCatalogCategory');
  if (mobCat) mobCat.value = cat;
  if (su) su.value = sub;
  PAGINATION_CONFIG.currentPage = 1;
  renderProducts();
  updateSidebarCategoryActive();
  document.querySelectorAll('.sidebar-section .sidebar-link').forEach(a => a.classList.remove('active'));
  closeSidebarMobile({ skipScrollRestore: true });
  scrollWindowToProductsSection();
}
if (typeof window !== 'undefined') window.selectCatalogFilter = selectCatalogFilter;

/**
 * Bloquea el scroll de la página (html + body + fixed, compatible con iOS).
 * Varios overlays a la vez (p. ej. modal + lightbox) usan un contador: solo el primer acquire aplica estilos y solo el último release los quita.
 */
let _pageScrollLockDepth = 0;
let _pageScrollLockY = 0;

function acquirePageScrollLock() {
  if (_pageScrollLockDepth === 0) {
    _pageScrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_pageScrollLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  _pageScrollLockDepth++;
}

function releasePageScrollLock(opts = {}) {
  if (_pageScrollLockDepth <= 0) return;
  _pageScrollLockDepth--;
  if (_pageScrollLockDepth > 0) return;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  if (!opts.skipScrollRestore) {
    window.scrollTo(0, _pageScrollLockY);
  }
}

function setSidebarOpen(open, opts = {}) {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebarOverlay');
  const btn = document.getElementById('navSidebarToggle');
  const mobile = window.matchMedia('(max-width: 1024px)').matches;
  if (!sb) return;
  if (mobile) {
    sb.classList.toggle('open', open);
    if (ov) {
      ov.classList.toggle('open', open);
      ov.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (btn) {
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (open) acquirePageScrollLock();
    else releasePageScrollLock(opts);
  } else {
    sb.classList.remove('open');
    if (ov) {
      ov.classList.remove('open');
      ov.setAttribute('aria-hidden', 'true');
    }
    if (btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
    releasePageScrollLock(opts);
  }
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (!sb) return;
  const mobile = window.matchMedia('(max-width: 1024px)').matches;
  const fly = document.getElementById('sidebarFlyout');
  if (mobile && sb.classList.contains('open') && fly?.classList.contains('is-open')) {
    hideCategoryFlyout();
    return;
  }
  setSidebarOpen(!sb.classList.contains('open'));
}

function closeSidebarMobile(opts = {}) {
  hideCategoryFlyout();
  document.getElementById('mainNavbar')?.classList.remove('nav-search-open');
  document.getElementById('navMobileSearchToggle')?.setAttribute('aria-expanded', 'false');
  setSidebarOpen(false, opts);
}

function handleSidebarLink(e, sectionId) {
  e.preventDefault();
  closeSidebarMobile();
  const target = document.getElementById(sectionId);
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  document.querySelectorAll('.sidebar-section .sidebar-link').forEach(a => a.classList.remove('active'));
  e.currentTarget.classList.add('active');
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
  const su       = document.getElementById('catalogSubcategory');
  const query    = se?.value ? se.value.trim() : '';
  const category = ce?.value ? ce.value.trim() : '';
  const subcat   = su?.value ? su.value.trim() : '';

  const pc = document.getElementById('productsCount');
  if (pc) {
    const total = filtered.length;
    const ip = PAGINATION_CONFIG.itemsPerPage;
    const cp = PAGINATION_CONFIG.currentPage;
    const itemStart = total ? (cp - 1) * ip + 1 : 0;
    const itemEnd = Math.min(cp * ip, total);
    const onThisPage = total ? itemEnd - itemStart + 1 : 0;
    const pageRangeLabel = `${onThisPage}-${ip}`;
    if (total > 0) {
      pc.innerHTML = `<span class="count-page-line" aria-label="Página ${cp}, ítems ${itemStart} a ${itemEnd} de ${total} (${onThisPage} en esta página de hasta ${ip})"><span class="count-page-prefix">Página</span> <span class="count-page-num">${cp}</span> <span class="count-page-range">${pageRangeLabel}</span></span>
        <span class="count-total-wrap" role="status"><span class="count-total-kicker">Total</span><strong class="count-total-num">${total}</strong><span class="count-total-suffix">producto${total === 1 ? '' : 's'}</span></span>`;
      pc.style.display = 'flex';
    } else { pc.style.display = 'none'; }
  }

  const ca = document.getElementById('categoryActive');
  const cn = document.getElementById('categoryName');
  if (ca && cn) {
    if (category) {
      const label = subcat ? `${category} · ${subcat}` : category;
      cn.textContent = label;
      ca.style.display = 'inline-flex';
    } else { ca.style.display = 'none'; }
  }

  if (filtered.length === 0 && (query || category || subcat)) {
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
  const sorted  = [...filtered].sort(compareProductsCatalog);
  const page    = sorted.slice(start, start + ip);
  const grouped = {};
  page.forEach(p => { if (!grouped[p.cat]) grouped[p.cat] = []; grouped[p.cat].push(p); });

  let html = ''; let delay = 0;
  Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })).forEach((cat, i) => {
    if (i > 0) html += `<div class="prod-category-header"><span>${escapeHtml(cat)}</span></div>`;
      grouped[cat].forEach(p => {
        // ✅ Updated for multi-video: count all videos + imgs >1
        const numVideos = (p.videos || []).length;
        const hasMedia  = p.imgs.length > 1 || numVideos > 0;
        const mediaCount = p.imgs.length + numVideos;
        const mediaIcon = numVideos > 0 ? '🎬' : (p.imgs.length > 1 ? '📷' : '');
        html += `
          <div class="prod-card" style="--card-delay:${delay*0.07}s" onclick="openModal('${p.id}')">
            <div class="prod-img-wrap">
              <img src="${escapeAttr(p.imgs[0])}" alt="${escapeAttr(p.name)}" loading="lazy"/>
              ${p.watermark ? `<img src="${escapeAttr(p.watermark)}" alt="" class="prod-watermark"/>` : ''}
              <span class="prod-badge">${escapeHtml(p.badge)}</span>
              ${hasMedia ? `<span class="prod-gallery-count">${mediaIcon} ${mediaCount}</span>` : ''}
            </div>
            <div class="prod-body">
              <div class="prod-cat">${escapeHtml(p.cat)}${p.subcat ? ` <span class="prod-sub">· ${escapeHtml(p.subcat)}</span>` : ''}</div>
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

function setupVoiceCatalogSearch() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const se = document.getElementById('catalogSearch');
  const mob = document.getElementById('mobileMenuSearch');
  const btnDesk = document.getElementById('catalogSearchVoiceBtn');
  const btnMob = document.getElementById('mobileMenuSearchVoiceBtn');
  const secure =
    window.isSecureContext ||
    /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname || '');
  if (!SR || !se || !secure) {
    btnDesk?.remove();
    btnMob?.remove();
    return;
  }
  btnDesk?.removeAttribute('hidden');
  btnMob?.removeAttribute('hidden');

  let recognition = null;
  let listening = false;

  function setListening(on) {
    listening = on;
    [btnDesk, btnMob].forEach(b => b?.classList.toggle('nav-voice-btn--active', on));
  }

  function applyVoiceTranscript(text) {
    const t = String(text || '').trim();
    if (!t) return;
    se.value = t;
    if (mob) mob.value = t;
    PAGINATION_CONFIG.currentPage = 1;
    renderProducts();
    document.getElementById('products')?.scrollIntoView({ behavior: 'instant' });
  }

  function onMicClick(e) {
    e.preventDefault();
    if (listening && recognition) {
      try { recognition.abort(); } catch (_) {}
      setListening(false);
      return;
    }
    recognition = new SR();
    recognition.lang = 'es-CO';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = ev => {
      const t = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
      applyVoiceTranscript(t);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
    } catch (_) {
      setListening(false);
    }
  }

  [btnDesk, btnMob].forEach(btn => {
    if (btn) btn.addEventListener('click', onMicClick);
  });
}

function setupCatalogFilters() {
  fillCategorySelect();
  const se = document.getElementById('catalogSearch');
  const ce = document.getElementById('catalogCategory');
  const mob_s = document.getElementById('mobileMenuSearch');
  if (se) {
    se.addEventListener('input', () => { PAGINATION_CONFIG.currentPage = 1; renderProducts(); });
    se.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); renderProducts(); document.getElementById('products').scrollIntoView({ behavior: 'instant' }); }
    });
  }
  function onCatalogCategoryChangeFromUI() {
    const ceLocal = document.getElementById('catalogCategory');
    const mobLocal = document.getElementById('mobileCatalogCategory');
    if (ceLocal && mobLocal) mobLocal.value = ceLocal.value;
    const effective = (ceLocal?.value || '').trim();
    const subEl = document.getElementById('catalogSubcategory');
    if (subEl) {
      if (!effective) subEl.value = '';
      else {
        const ok = getSubcategoriesForCategory(effective).map(s => normFilterStr(s));
        if (!ok.includes(normFilterStr(subEl.value))) subEl.value = '';
      }
    }
    PAGINATION_CONFIG.currentPage = 1;
    updateSidebarCategoryActive();
    renderProducts();
    scrollWindowToProductsSection();
  }

  if (ce) {
    ce.addEventListener('change', onCatalogCategoryChangeFromUI);
  }
  const mobCatSel = document.getElementById('mobileCatalogCategory');
  if (mobCatSel) {
    mobCatSel.addEventListener('change', () => {
      if (ce) ce.value = mobCatSel.value;
      onCatalogCategoryChangeFromUI();
    });
  }
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
}

// ========================================
// MODAL
// ========================================
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  forceStopIntroAudio();

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
  // ✅ Show arrows if total media > 1 (imgs + videos)
  const totalMedia = p.imgs.length + (p.videos || []).length;
  if (totalMedia > 1) {
    const arrowL = document.createElement('button');
    arrowL.className = 'modal-nav-arrow left'; arrowL.innerHTML = '&#8249;';
    arrowL.setAttribute('aria-label', 'Medio anterior');
    arrowL.onclick = (e) => { e.stopPropagation(); if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(-1); };
    const arrowR = document.createElement('button');
    arrowR.className = 'modal-nav-arrow right'; arrowR.innerHTML = '&#8250;';
    arrowR.setAttribute('aria-label', 'Medio siguiente');
    arrowR.onclick = (e) => { e.stopPropagation(); if (typeof modalZoomCleanup==='function') modalZoomCleanup(); navegarGaleria(1); };
    mainWrap.appendChild(arrowL);
    mainWrap.appendChild(arrowR);
  }

  const thumbsEl   = document.getElementById('modalThumbs');
  // ✅ Multi-video: use p.videos array
  const numVideos = (p.videos || []).length;
  const hasVideo  = numVideos > 0;
  const totalItems = p.imgs.length + numVideos;

  if (totalItems > 1) {
    let thumbsHTML = p.imgs.map((img, i) => `
      <div class="modal-thumb ${i === 0 ? 'active' : ''}"
           onclick="if(typeof modalZoomCleanup==='function')modalZoomCleanup(); cambiarImg('${escapeAttr(img)}', this)"
           role="tab" data-type="img" aria-label="Imagen ${i + 1} de ${p.imgs.length}">
        <img src="${escapeAttr(img)}" alt="Vista ${i + 1}" loading="lazy"/>
      </div>`).join('');
    
    // ✅ Render all videos as thumbs
    (p.videos || []).forEach((videoUrl, vIdx) => {
      const embed = getVideoEmbed(videoUrl);
      const thumbBg = embed?.thumb
        ? `style="background-image:url('${escapeAttr(embed.thumb)}');background-size:cover;background-position:center;"`
        : '';
      thumbsHTML += `
        <div class="modal-thumb modal-thumb-video"
             onclick="if(typeof modalZoomCleanup==='function')modalZoomCleanup(); cambiarAVideo('${escapeAttr(videoUrl)}', this)"
             role="tab" data-type="video" ${thumbBg} aria-label="Video ${vIdx + 1} del producto">
          <span class="thumb-play-icon">&#9654;</span>
        </div>`;
    });
    
    thumbsEl.innerHTML = thumbsHTML;
    thumbsEl.style.display = 'flex';
  } else {
    thumbsEl.innerHTML = '';
    thumbsEl.style.display = 'none';
  }

  document.getElementById('modalInfo').innerHTML = `
    <span class="modal-badge">${escapeHtml(p.badge)}</span>
    <div class="modal-cat">${escapeHtml(p.cat)}${p.subcat ? ` <span class="modal-subcat">· ${escapeHtml(p.subcat)}</span>` : ''}</div>
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

  // ✅ Init gallery state for mixed media
  openModal._currentThumbIdx = 0;
  openModal._imgs = p.imgs;
  openModal._videos = p.videos || [];
  const modalOv = document.getElementById('modalOverlay');
  const modalJustOpened = !modalOv.classList.contains('open');
  modalOv.classList.add('open');
  if (modalJustOpened) acquirePageScrollLock();
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
  // ✅ Updated for mixed media gallery
  const thumbs = document.querySelectorAll('.modal-thumb');
  if (thumbs.length <= 1) return;
  
  // Update current index cycling through ALL thumbs (img + video)
  let currentIdx = openModal._currentThumbIdx || 0;
  currentIdx = (currentIdx + dir + thumbs.length) % thumbs.length;
  openModal._currentThumbIdx = currentIdx;
  
  // Activate thumb and trigger its content
  const targetThumb = thumbs[currentIdx];
  targetThumb.click(); // Triggers cambiarImg or cambiarAVideo
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
  // ✅ Track thumb index in mixed gallery
  const allThumbs = document.querySelectorAll('.modal-thumb');
  const newIdx = Array.from(allThumbs).indexOf(el);
  if (newIdx !== -1) openModal._currentThumbIdx = newIdx;
}

function cerrarModal(e) { if (e.target === document.getElementById('modalOverlay')) cerrarModalBtn(); }

function cerrarModalBtn() {
  const lbPre = document.getElementById('lightboxOverlay');
  if (lbPre && lbPre.classList.contains('open')) cerrarLightbox();
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
  const modalOv = document.getElementById('modalOverlay');
  const modalWasOpen = modalOv.classList.contains('open');
  modalOv.classList.remove('open');
  if (modalWasOpen) releasePageScrollLock();
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
const LB_MAX = 1.45;

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
  const lbWasOpen = lb.classList.contains('open');
  lb.classList.add('open');
  if (!lbWasOpen) acquirePageScrollLock();
}

function cerrarLightbox() {
  const lb = document.getElementById('lightboxOverlay');
  if (!lb || !lb.classList.contains('open')) return;
  lb.classList.remove('open');
  lbReset();
  releasePageScrollLock();
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
  setupVoiceCatalogSearch();
  initActiveMenuLink();
  initZoomControls();

  const sidebarCatUl = document.getElementById('sidebarCategories');
  if (sidebarCatUl) {
    sidebarCatUl.addEventListener('click', e => {
      const btn = e.target.closest('.sidebar-cat');
      if (!btn) return;
      const cat = btn.getAttribute('data-cat') || '';
      const sub = btn.getAttribute('data-sub') || '';
      const tapFlyout = window.matchMedia('(max-width: 1024px)').matches;
      if (btn.classList.contains('sidebar-cat--parent') && btn.getAttribute('data-has-subs') === '1' && tapFlyout) {
        const fly = document.getElementById('sidebarFlyout');
        const openSame =
          fly?.classList.contains('is-open') &&
          normFilterStr(fly?.dataset.openCat || '') === normFilterStr(cat);
        // Primero: mismo padre con panel abierto → solo cerrar el panel (no selectCatalogFilter: cerraría el menú).
        if (openSame) {
          hideCategoryFlyout();
          return;
        }
        clearSidebarFlyoutHideTimer();
        showCategoryFlyout(btn);
        return;
      }
      selectCatalogFilter(cat, sub);
    });
  }

  const sidebarFlyout = document.getElementById('sidebarFlyout');
  if (sidebarFlyout) {
    sidebarFlyout.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      clearSidebarFlyoutHideTimer();
    });
    sidebarFlyout.addEventListener('mouseleave', () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      scheduleSidebarFlyoutHide();
    });
    sidebarFlyout.addEventListener('click', e => {
      const row = e.target.closest('.sidebar-flyout-row, .sidebar-flyout-tile');
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      selectCatalogFilter(row.getAttribute('data-cat') || '', row.getAttribute('data-sub') || '');
    });
  }

  const navSearchToggle = document.getElementById('navMobileSearchToggle');
  if (navSearchToggle) {
    navSearchToggle.addEventListener('click', () => {
      const nav = document.getElementById('mainNavbar');
      if (!nav) return;
      const open = nav.classList.toggle('nav-search-open');
      navSearchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        const mob = document.getElementById('mobileMenuSearch');
        const desk = document.getElementById('catalogSearch');
        if (mob && desk && desk.value) mob.value = desk.value;
        mob?.focus();
      }
    });
  }

  window.addEventListener('resize', () => {
    hideCategoryFlyout();
    if (!window.matchMedia('(max-width: 1024px)').matches) {
      setSidebarOpen(false);
      document.getElementById('mainNavbar')?.classList.remove('nav-search-open');
      document.getElementById('navMobileSearchToggle')?.setAttribute('aria-expanded', 'false');
    }
    scheduleBannerRelayout();
  });
  window.addEventListener('orientationchange', () => scheduleBannerRelayout());
  window.addEventListener('load', () => scheduleBannerRelayout(), { once: true });
  window.addEventListener('pageshow', e => {
    if (e.persisted) loadProducts();
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => scheduleBannerRelayout());
  }

  document.getElementById('sidebarCloseBtn')?.addEventListener('click', () => closeSidebarMobile());

  document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    const fly = document.getElementById('sidebarFlyout');
    if (fly?.classList.contains('is-open')) {
      hideCategoryFlyout();
      return;
    }
    closeSidebarMobile();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const mobile = window.matchMedia('(max-width: 1024px)').matches;
    const sb = document.getElementById('sidebar');
    const fly = document.getElementById('sidebarFlyout');
    if (mobile && fly?.classList.contains('is-open')) {
      hideCategoryFlyout();
      return;
    }
    if (mobile && sb?.classList.contains('open')) closeSidebarMobile();
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});