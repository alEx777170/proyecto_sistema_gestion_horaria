# SmartSchedule FISI – Sistema Adaptativo de Gestión Horaria

**Prototipo final interactivo de alta fidelidad** para la gestión inteligente de horarios académicos con optimización de tiempos muertos, resolución de conflictos y accesibilidad WCAG 2.1.

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

## 🎯 Funcionalidades del Prototipo Final

### Barra Superior
| Elemento | Descripción |
|----------|-------------|
| **Título del sistema** | Muestra "SmartSchedule FISI" y el contexto del semestre/semana actual. |
| **📊 Estadísticas** | Abre/cierra el panel inferior de estadísticas en tiempo real. |
| **🔔 Notificaciones** | Despliega un panel con notificaciones simuladas (conflictos, actualizaciones). |
| **♿ Accesibilidad** | Activa/desactiva un esquema de alto contraste WCAG 2.1 (ratio 4.5:1). |

### Panel Lateral (Sidebar)
- **Pestaña "Cursos"**: 6 cursos con código, grupo y prioridad.
- **Pestaña "Pendientes"**: 4 tareas pendientes por asignar.
- **Checkbox de selección múltiple**: Permite seleccionar varios cursos a la vez.
- **Barra de asignación batch**: Aparece al seleccionar cursos, permite asignarlos automáticamente.
- **Código de colores semántico (Semáforo)**:
  - 🔴 **Rojo** = Urgente
  - 🟡 **Amarillo** = Moderada
  - 🟢 **Verde** = Flexible

### Calendario Semanal
- Cuadrícula de **Lunes a Domingo**, con horas de **8:00 a 22:00**.
- Día actual (Miércoles) destacado con indicador visual.
- Bloques pre-cargados simulando un horario existente.
- **Drag & Drop intra-calendario**: mover bloques de una celda a otra.

---

## Escenarios Interactivos

### Escenario 1: Agregar Bloque ➕
1. Clic en **"+ Agregar Bloque"** (esquina superior derecha).
2. Se abre un modal para ingresar: nombre, código, día, hora y prioridad.
3. Al guardar, el bloque aparece en la celda con su color de prioridad.
4. Se muestra una notificación toast de confirmación.

### Escenario 2: Drag & Drop 🖱️
1. **Desde el sidebar**: arrastre una tarjeta sobre una celda vacía.
2. **Intra-calendario**: arrastre un bloque ya colocado a otra celda vacía.
3. El bloque se mueve con animación y se actualiza el estado.

### Escenario 3: Selección Múltiple y Asignación Batch 🚀
1. Active los checkboxes de varias tarjetas en el sidebar.
2. Aparecerá la barra de asignación con el contador de seleccionados.
3. Clic en **"🚀 Asignar"** para colocar todos automáticamente.

### Escenario 4: Resolución de Conflictos ⚠️
1. Arrastre una tarjeta sobre una celda **ya ocupada**.
2. Se abre un **modal interactivo de resolución** con 4 opciones:
   - 🔄 **Reemplazar**: quita el bloque existente y coloca el nuevo.
   - 🔀 **Cambiar grupo**: busca un horario alternativo en otro grupo.
   - 📍 **Mover al más cercano**: encuentra el espacio libre más próximo.
   - ❌ **Cancelar**: no realiza cambios.
3. Se muestran **sugerencias de horarios alternativos** disponibles.

### Escenario 5: Editar / Eliminar Bloques ✏️
1. Haga clic en un bloque del calendario.
2. Aparece un **popover de detalle** con nombre, código, horario y prioridad.
3. Opciones:
   - **✏️ Editar**: abre un modal para cambiar nombre, código o prioridad.
   - **🗑️ Eliminar**: remueve el bloque del calendario con animación.

### Escenario 6: Optimización de Tiempos Muertos ⚡
1. Clic en el botón **"⚡ Optimizar"** (junto a "Agregar Bloque").
2. El sistema detecta gaps (horas vacías) entre bloques de cada día.
3. Compacta los bloques eliminando tiempos muertos.
4. Muestra un **overlay de resultados**: bloques movidos, horas liberadas y detalle.

### Escenario 7: Panel de Estadísticas 📊
1. Clic en el botón **📊** de la barra superior.
2. Se abre un panel inferior con métricas en tiempo real:
   - % de ocupación semanal
   - Horas de tiempos muertos detectados
   - Horas por prioridad (🔴🟡🟢)
   - Total de bloques
3. Las barras de progreso se animan dinámicamente.

---

## Modo Accesibilidad (WCAG 2.1 AA)

Al activar el toggle de accesibilidad:
- Esquema cambia a **fondo claro con texto oscuro** (contraste ≥ 4.5:1).
- Bordes reforzados para mejor visibilidad.
- **Focus visible mejorado**: outline + glow en todos los elementos interactivos.
- **Skip Navigation**: enlace de salto al contenido principal (visible con Tab).
- **ARIA Live Region**: anuncios dinámicos para lectores de pantalla.
- **Navegación por teclado completa**: Tab, Enter, Escape, flechas en el calendario.
- **Atributos ARIA**: `role`, `aria-label`, `aria-checked`, `aria-modal`, `aria-live`, `aria-selected`.

---

## Estructura del Proyecto

```
proyecto_sistema_gestion_horaria/
├── index.html         → Estructura HTML5 semántica (skip nav, modales, popover, stats panel)
├── styles.css         → Sistema de diseño con tokens CSS, dark mode, accesibilidad, animaciones
├── script.js          → Lógica interactiva completa (D&D, optimización, conflictos, edición)
├── README.md          → Este archivo
└── documentos/        → PDFs de entregables previos del curso
```

---

## Limitaciones del Prototipo

| # | Limitación | Detalle |
|---|-----------|---------|
| 1 | **Sin persistencia de datos** | Los cambios se pierden al recargar. No hay localStorage ni backend. |
| 2 | **Datos simulados** | Cursos, tareas y notificaciones son datos de ejemplo en `script.js`. |
| 3 | **Sin autenticación** | No hay sistema de login ni roles de usuario. |
| 4 | **Drag & Drop en móviles** | La API nativa HTML5 no funciona en dispositivos táctiles sin polyfill. |
| 5 | **Bloques de una hora** | Cada bloque ocupa exactamente 1 hora. No hay soporte para duración variable. |
| 6 | **Optimización heurística** | El algoritmo de compactación es greedy, no óptimo global. |
| 7 | **Sin internacionalización** | La interfaz está fija en español. |

---

## Tecnologías Utilizadas

- **HTML5** – Estructura semántica con atributos ARIA extensivos
- **CSS3** – Variables CSS, Grid, Flexbox, animaciones, glassmorphism, `backdrop-filter`
- **JavaScript (ES6+)** – Vanilla JS, API nativa de Drag & Drop HTML5
- **Google Fonts** – Tipografía Inter

---

## Notas de Diseño

- **Tema oscuro** por defecto con estética glassmorphism y gradientes sutiles.
- **Micro-animaciones** en hover, drag, toast, popover, modales, optimización y bloques.
- **Código semántico de colores tipo semáforo** (🔴🟡🟢) integrado en tarjetas, bloques y labels.
- **Sistema de diseño basado en tokens CSS** para fácil personalización.
- **Accesibilidad WCAG 2.1 nivel AA** con modo de alto contraste.

---

*Prototipo Final desarrollado como demostración de concepto – Julio 2026*
*Grupo 02 – Diseño de Interfaces de Usuario – FISI*
