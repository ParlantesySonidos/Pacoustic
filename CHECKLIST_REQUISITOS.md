# CHECKLIST DE REQUISITOS - PA Acoustic

## Estado del Proyecto: EN DESARROLLO

---

## 1. SECCIONES / PÁGINAS INCLUIDAS

| Sección | Estado | Observaciones |
|---------|--------|---------------|
| Inicio | ✅ Completado | |
| Productos | ✅ Completado | |
| Nosotros | ✅ Completado | |
| Contacto | ✅ Completado | |
| Menú | ✅ Completado | |
| Footer | ✅ Completado | |
| Galería (fotos de eventos) | ❌ Pendiente | "Galería con 10 a 15 fotos proporcionadas por el cliente" |
| Preguntas frecuentes | ❌ No solicitado | |

---

## 2. FUNCIONALIDADES

| Funcionalidad | Estado | Observaciones |
|---------------|--------|---------------|
| Botón de WhatsApp | ✅ Completado | Múltiples ubicaciones: flotante, navbar, menú móvil |
| Navegación responsive | ✅ Completado | Desktop, tablet y móvil |
| Catálogo visual | ✅ Completado | Grid de productos con tarjetas |
| Modal de productos | ✅ Completado | Con especificaciones, imágenes y WhatsApp |
| Formulario de contacto | ❌ No solicitado | Contacto solo por WhatsApp |
| Carrusel automático en inicio | ✅ Completado | Banner con productos |
| Sistema de zoom en modal | ✅ Completado | Rueda mouse y pinch-to-zoom |
| Selector de categorías | ✅ Completado | Desktop, tablet y móvil |
| Indicador de categoría activa | ✅ Completado | Muestra la categoría seleccionada |
| Paginación de productos | ✅ Completado | Control de páginas en el catálogo |

---

## 3. DISEÑO Y APARIENCIA VISUAL

| Elemento | Estado | Observaciones |
|---------|--------|---------------|
| Modo oscuro | ✅ Completado | |
| Modo claro | ✅ Completado | |
| Marcas de agua en modo oscuro | ✅ Completado | |
| Marcas de agua en modo claro | ✅ Completado | Ajustado con filter |
| Logo en sección Nosotros | ✅ Completado | |

---

## 4. CONTENIDO (TEXTOS E IMÁGENES)

| Elemento | Estado | Observaciones |
|----------|--------|---------------|
| Textos actuales provisionales | ✅ Completado | |
| Textos finales entregados | ❌ Pendiente | "El cliente entregará textos finales del catálogo en un documento Word" |
| Logo entregado | ✅ Completado | |
| Imágenes actuales | ✅ Completado | 8 productos con imágenes |
| Nuevas imágenes pendientes | ❌ Pendiente | "El cliente entregará 10 imágenes nuevas en alta resolución" |

---

## 5. AJUSTES IMPLEMENTADOS RECIENTEMENTE

| Ajuste | Estado | Fecha |
|--------|--------|-------|
| Optimizar velocidad del banner principal | ✅ Completado | |
| Mantener reproducción de música solo en inicio | ✅ Completado | |
| Ajustes del modo claro para tablet y móviles | ✅ Completado | |
| Menú desplegable de categorías | ✅ Completado | Parlantes, Drivers, Cabinas, Line Array |
| Reemplazar logo en "Nosotros" | ✅ Completado | |
| Sistema de zoom en modal de productos | ✅ Completado | minZoom=1, maxZoom=3 |
| Auditoría técnica completa | ✅ Completado | 06/03/2026 |
| Corrección sistemas búsqueda duplicados | ✅ Completado | 06/03/2026 |
| Revisión de políticas y scripts | ✅ Completado | 07/03/2026 |
| Crear funciones applyAllFilters() y clearAllFilters() | ✅ Completado | 07/03/2026 |
| Corregir referencias a mobileMenuCategory | ✅ Completado | 07/03/2026 |
| Limpiar código: eliminar función handleMobileCategoryChange() sin usar | ✅ Completado | 08/03/2026 |
| Reorganización: eliminar archivos sin uso (productos.json, fonts/, hl30a-3.jpg) | ✅ Completado | 09/03/2026 |
| Corregir nombres de imágenes (pa10shefieeld → pa10sheffield) | ✅ Completado | 09/03/2026 |
| Optimizar código: eliminar funciones sin usar | ✅ Completado | 09/03/2026 |

---

## 6. PENDIENTES DEL CLIENTE

- [ ] Proporcionar 10-15 fotos para la Galería
- [ ] Proporcionar textos finales del catálogo en documento Word
- [ ] Proporcionar 10 imágenes nuevas en alta resolución
- [ ] Definir acción para marcas de agua en modo claro (ya implementado)

---

## 7. ELEMENTOS NO INCLUIDOS (FUERA DEL ALCANCE)

- ❌ Hosting
- ❌ Dominio
- ❌ Carrito de compras
- ❌ Pagos en línea
- ❌ Panel administrativo

---

## 8. A FUTURO (DESPUÉS DEL DESARROLLO)

- [ ] Contratación de dominio
- [ ] Contratación de hosting
- [ ] Publicación final de la página
- [ ] Indexación en Google

---

## 9. PRODUCTOS DEL CATÁLOGO

| # | Producto | Categoría | Estado |
|---|----------|-----------|--------|
| 1 | PA HL-30A | Line Array Activo | ✅ |
| 2 | PA HL-10A | Line Array Activo | ✅ |
| 3 | PA10N-900 | Parlante 10" Neodimio | ✅ |
| 4 | LF18X401+ | Woofer 18" Alto Rendimiento | ✅ |
| 5 | 18LW2420+ | Woofer 18" Ferrita | ✅ |
| 6 | PA8N-600 | Woofer 8" Neodimio | ✅ |
| 7 | PA12N-1000 | Woofer 12" Neodimio | ✅ |
| 8 | PA Sheffield 12 | Parlante 12" Ferrita | ✅ |

---

## RESUMEN

| Categoría | Completados | Pendientes | Total |
|-----------|-------------|------------|-------|
| Secciones | 6           | 1           | 7     |
| Funcionalidades | 8     | 0           | 8     |
| Ajustes solicitados | 15 | 0           | 15    |

**Progreso general: ~95%**

---

*Documento creado para seguimiento del proyecto PA Acoustic*
*Última actualización: 10/03/2026*

---

## 10. RECOMENDACIÓN: SISTEMA DE CARGA AUTOMÁTICA DE PRODUCTOS

### Problema Actual:
Los productos están hardcoded en `js/main.js`. Cuando el cliente agrega nuevas imágenes o documentos, debe editar el código manualmente.

### Solución Propuesta:

**Estructura de carpetas sugerida:**
```
img/
├── products/
│   ├── hl30a/
│   │   ├── main.png        (imagen principal)
│   │   ├── thumb-1.png    (miniaturas)
│   │   ├── thumb-2.png
│   │   └── watermark.png  (marca de agua)
│   ├── hl10a/
│   └── ...
│
doc/
├── products/
│   ├── hl30a.pdf   (ficha técnica)
│   ├── hl10a.pdf
│   └── ...
```

**Implementación recomendada:**

1. **Crear un archivo JSON de configuración** (`products-config.json`):
```json
{
  "products": [
    {
      "id": "hl30a",
      "name": "PA HL-30A",
      "category": "Line Array",
      "images": ["img/products/hl30a/main.png"],
      "watermark": "img/products/hl30a/watermark.png",
      "specs": "doc/products/hl30a.pdf"
    }
  ]
}
```

2. **O usar carga dinámica** - Leer carpetas y auto-generar productos:
   - Crear función que escanee carpetas `img/products/` y `doc/products/`
   - Generar array de productos automáticamente
   - No requiere editar código para agregar productos

### Ventajas:
- ✅ Cliente puede agregar productos sin editar código
- ✅ Solo necesita crear carpetas con imágenes
- ✅ Sistema escalable
- ✅ Mantenimiento más fácil

### Pendiente de Confirmación:
¿Deseas que implemente este sistema de carga automática?
