// ========================================
// PA ACOUSTIC — modalZoom.js
// Modal: min 1x, max 3x (no encoge)
// Lightbox: min 1x, max 4x (no encoge)
// ========================================

// ── MODAL ZOOM ──
const MODAL_ZOOM_CONFIG = {
  currentZoom: 1,
  maxZoom: 1.15,  // Usuario: límite 15% aumento
  minZoom: 1,
  step: 0.05     // Paso fino control preciso
};

function modalZoomInit() {
  const img = document.getElementById('modalImgMain');
  if (!img) return;
  img.removeEventListener('wheel',    _mzWheel);
  img.removeEventListener('dblclick', _mzReset);
  MODAL_ZOOM_CONFIG.currentZoom = 1;
  img.style.transform      = 'scale(1)';
  img.style.transformOrigin = 'center center';
  img.style.transition     = 'transform 0.2s ease';
  img.addEventListener('wheel',    _mzWheel, { passive: false });
  img.addEventListener('dblclick', _mzReset);
}

function _mzWheel(e) {
  e.preventDefault();
  e.stopPropagation();
  const d = e.deltaY < 0 ? MODAL_ZOOM_CONFIG.step : -MODAL_ZOOM_CONFIG.step;
  MODAL_ZOOM_CONFIG.currentZoom = Math.max(
    MODAL_ZOOM_CONFIG.minZoom,
    Math.min(MODAL_ZOOM_CONFIG.maxZoom, MODAL_ZOOM_CONFIG.currentZoom + d)
  );
  const img = document.getElementById('modalImgMain');
  if (img) img.style.transform = `scale(${MODAL_ZOOM_CONFIG.currentZoom})`;
}

function _mzReset(e) {
  if (e) e.preventDefault();
  MODAL_ZOOM_CONFIG.currentZoom = 1;
  const img = document.getElementById('modalImgMain');
  if (img) { img.style.transition = 'transform 0.25s ease'; img.style.transform = 'scale(1)'; }
}

function modalZoomCleanup() {
  const img = document.getElementById('modalImgMain');
  if (!img) return;
  img.removeEventListener('wheel',    _mzWheel);
  img.removeEventListener('dblclick', _mzReset);
  MODAL_ZOOM_CONFIG.currentZoom = 1;
  img.style.transform  = 'scale(1)';
  img.style.transition = '';
}