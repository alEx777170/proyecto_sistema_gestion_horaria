# Sistema Adaptativo de Gestión Horaria

**Prototipo interactivo de alta fidelidad** para la gestión inteligente de horarios académicos.

---

## Instrucciones de Uso

### Requisitos
- **Navegador web moderno** (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+).
- **No requiere instalación** de software adicional, servidores, ni herramientas de compilación.

### Ejecución
1. Descargue o clone los archivos del proyecto.
2. Abra el archivo `index.html` directamente en su navegador (doble clic o arrastrar al navegador).
3. La aplicación se carga completamente del lado del cliente.

---

## 🎯 Funcionalidades del Prototipo

### Barra Superior
| Elemento | Descripción |
|----------|-------------|
| **Título del sistema** | Muestra el nombre y contexto del semestre/semana actual. |
| **Campana de notificaciones** 🔔 | Al hacer clic, despliega un panel con notificaciones simuladas (conflictos, actualizaciones). |
| **Modo Accesibilidad** ♿ | Activa/desactiva un esquema de colores de alto contraste (ratio 4.5:1 según WCAG 2.1). |

### Panel Lateral (Sidebar)
- **Pestaña "Cursos Disponibles"**: Muestra 6 cursos de ejemplo con código, grupo y nivel de prioridad.
- **Pestaña "Pendientes"**: Muestra 4 tareas pendientes por asignar al calendario.
- Cada tarjeta incluye un **ícono de arrastre** (seis puntos ⠿) indicando que es arrastrable.
- Las tarjetas usan **código de colores semántico**:
  - 🔴 **Rojo** = Urgente
  - 🟡 **Amarillo** = Moderada
  - 🟢 **Verde** = Flexible

### Calendario Semanal
- Cuadrícula de **Lunes a Domingo**, con horas de **8:00 a 22:00** en el eje Y.
- El día actual (Miércoles) aparece destacado con un indicador visual.
- Bloques pre-cargados simulando un horario existente.

---

## Escenarios Interactivos

### Escenario 1: Agregar Bloque ➕
1. Haga clic en el botón **"+ Agregar Bloque"** (esquina superior derecha del calendario).
2. Se abre un **modal CSS** donde puede ingresar:
   - Nombre del curso (ej: "Álgebra")
   - Código/Grupo
   - Día de la semana
   - Hora
   - Prioridad (Urgente / Moderada / Flexible)
3. Al guardar, el bloque aparece en la celda correspondiente con su color de prioridad.
4. Se muestra una **notificación toast**: _"Recordatorio activado"_.

### Escenario 2: Mover Tarea (Drag & Drop) 🖱️
1. Vaya a la pestaña **"Pendientes"** en el panel lateral.
2. **Arrastre** una tarjeta (mantenga clic en ella).
3. **Suéltela** sobre una celda vacía del calendario.
4. La tarjeta desaparece del panel lateral y aparece como un bloque en el calendario.
5. Se muestra la notificación: _"Recordatorio activado"_.

### Escenario 3: Conflicto Horario ⚠️
1. Arrastre cualquier tarjeta sobre una **celda que ya contenga un bloque**.
2. La celda se resalta con un **borde/fondo rojo** indicando conflicto.
3. Aparece un **mensaje flotante temporal**: _"⚠️ Conflicto – Cambiar al Grupo 02"_.
4. Al soltar, se muestra un toast con la sugerencia de cambiar de grupo.
5. **El bloque NO se coloca** en la celda ocupada (se rechaza el drop).

---

## Modo Accesibilidad

Al activar el toggle de accesibilidad:
- El esquema cambia a **fondo claro con texto oscuro**.
- Los bordes se refuerzan para mejor visibilidad.
- Los colores de prioridad mantienen un **ratio de contraste ≥ 4.5:1** (WCAG 2.1 AA).
- Todos los elementos interactivos son **navegables por teclado** (Tab, Enter, Escape).
- Se utilizan **atributos ARIA** (`role`, `aria-label`, `aria-checked`, `aria-modal`) en todo el DOM.

---

## Estructura del Proyecto

```
adaptive-time-management/
├── index.html    → Estructura HTML5 semántica
├── styles.css    → Sistema de diseño con variables CSS (dark mode + accessibility)
├── script.js     → Lógica interactiva (Drag & Drop, Modal, Toasts)
└── README.md     → Este archivo
```

---

## Limitaciones del Prototipo

| # | Limitación | Detalle |
|---|-----------|---------|
| 1 | **Sin persistencia de datos** | Los cambios se pierden al recargar la página. No hay localStorage ni backend. |
| 2 | **Datos simulados** | Los cursos, tareas y notificaciones son datos de ejemplo codificados en `script.js`. |
| 3 | **Sin autenticación** | No hay sistema de login ni roles de usuario. |
| 4 | **Drag & Drop limitado** | Usa la API nativa HTML5 que puede tener variaciones menores entre navegadores. No funciona en dispositivos táctiles sin polyfill. |
| 5 | **Sin responsividad completa** | El sidebar se oculta en pantallas < 900px. La cuadrícula del calendario requiere scroll horizontal en pantallas pequeñas. |
| 6 | **Bloques de una hora** | Cada bloque ocupa exactamente una celda (1 hora). No hay soporte para clases de duración variable. |
| 7 | **Sin edición/eliminación** | No se pueden editar ni eliminar bloques una vez colocados en el calendario. |
| 8 | **Motor de optimización ausente** | La sugerencia "Cambiar al Grupo 02" es estática. No hay algoritmo real de resolución de conflictos. |
| 9 | **Navegadores táctiles** | La API de Drag & Drop nativa no está soportada en la mayoría de navegadores móviles. Se recomienda usar en desktop. |
| 10 | **Sin internacionalización** | La interfaz está fija en español. No hay soporte multi-idioma. |

---

## Tecnologías Utilizadas

- **HTML5** – Estructura semántica con atributos ARIA
- **CSS3** – Variables CSS, Grid, Flexbox, animaciones, glassmorphism, `backdrop-filter`
- **JavaScript (ES6+)** – Vanilla JS, API nativa de Drag & Drop HTML5
- **Google Fonts** – Tipografía Inter

---

## Notas de Diseño

- **Tema oscuro** por defecto con estética glassmorphism y gradientes sutiles.
- **Micro-animaciones** en hover, drag, toast notifications y transiciones de modal.
- **Código semántico de colores** integrado en tarjetas, bloques y etiquetas de prioridad.
- **Sistema de diseño basado en tokens CSS** (`--bg-primary`, `--accent-primary`, etc.) para fácil personalización.

---

*Prototipo desarrollado como demostración de concepto – Junio 2026*
