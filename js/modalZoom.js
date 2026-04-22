// =============================================================================
// PA ACOUSTIC — modalZoom.js
// Zoom con rueda y doble clic sobre la imagen principal del modal de producto.
// El lightbox a pantalla completa usa límites distintos en main.js (LB_MIN / LB_MAX).
// =============================================================================

// Objeto de estado: zoom actual, tope máximo/mínimo y paso por evento wheel.
const MODAL_ZOOM_CONFIG = {
  currentZoom: 1,   // Factor de escala aplicado con CSS transform (1 = 100%).
  maxZoom: 1.45,    // Tope de acercamiento en el modal (no se encoge por debajo de 1).
  minZoom: 1,       // No permite alejar por debajo del tamaño natural.
  step: 0.05        // Incremento/decremento por “tick” de rueda (suaviza el zoom).
};

// Reinicia listeners y estilos de la imagen del modal; se llama al abrir la ficha.
function modalZoomInit() {
  const img = document.getElementById('modalImgMain'); // Imagen grande del modal (#modalImgMain).
  if (!img) return;                                   // Si no hay modal abierto, no hacer nada.
  img.removeEventListener('wheel',    _mzWheel);      // Evita duplicar el mismo listener al reabrir.
  img.removeEventListener('dblclick', _mzReset);
  MODAL_ZOOM_CONFIG.currentZoom = 1;                 // Siempre arranca en 1x al entrar al modal.
  img.style.transform       = 'scale(1)';            // Aplica escala neutra en el DOM.
  img.style.transformOrigin = 'center center';       // El zoom crece desde el centro de la imagen.
  img.style.transition      = 'transform 0.2s ease'; // Transición corta al cambiar escala.
  img.addEventListener('wheel',    _mzWheel, { passive: false }); // passive:false → puede usar preventDefault.
  img.addEventListener('dblclick', _mzReset);        // Doble clic restaura 1x.
}

// Handler interno: rueda hacia arriba acerca, hacia abajo aleja (dentro del rango).
function _mzWheel(e) {
  e.preventDefault();                                // Evita scroll de la página detrás del modal.
  e.stopPropagation();                               // No burbuja al overlay u otros contenedores.
  const d = e.deltaY < 0 ? MODAL_ZOOM_CONFIG.step : -MODAL_ZOOM_CONFIG.step; // deltaY negativo = zoom in.
  MODAL_ZOOM_CONFIG.currentZoom = Math.max(          // Limita el valor entre minZoom y maxZoom.
    MODAL_ZOOM_CONFIG.minZoom,
    Math.min(MODAL_ZOOM_CONFIG.maxZoom, MODAL_ZOOM_CONFIG.currentZoom + d)
  );
  const img = document.getElementById('modalImgMain');
  if (img) img.style.transform = `scale(${MODAL_ZOOM_CONFIG.currentZoom})`; // Aplica el nuevo factor.
}

// Doble clic o llamada sin evento: vuelve a 1x con una transición un poco más larga.
function _mzReset(e) {
  if (e) e.preventDefault();                         // Si viene de dblclick, evita selección/navegación.
  MODAL_ZOOM_CONFIG.currentZoom = 1;
  const img = document.getElementById('modalImgMain');
  if (img) {
    img.style.transition = 'transform 0.25s ease';   // Animación visible al volver al tamaño normal.
    img.style.transform  = 'scale(1)';
  }
}

// Al cerrar el modal: quita listeners y deja la imagen lista para la siguiente apertura.
function modalZoomCleanup() {
  const img = document.getElementById('modalImgMain');
  if (!img) return;
  img.removeEventListener('wheel',    _mzWheel);
  img.removeEventListener('dblclick', _mzReset);
  MODAL_ZOOM_CONFIG.currentZoom = 1;
  img.style.transform  = 'scale(1)';               // Estado visual neutro.
  img.style.transition = '';                         // Quita transición para no interferir con el lightbox.
}
