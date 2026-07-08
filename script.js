/* ============================================================
   SmartSchedule FISI – Sistema Adaptativo de Gestión Horaria
   Versión Final – Lógica Interactiva Completa
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Constants & Config ────────────────────────────────
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DAY_DATES = [16, 17, 18, 19, 20, 21, 22]; // Simulated week
  const START_HOUR = 8;
  const END_HOUR = 22;
  const TODAY_INDEX = 2; // Wednesday = Miércoles
  const TOTAL_SLOTS = 7 * (END_HOUR - START_HOUR); // 98 total cells

  // ── Sample Data ───────────────────────────────────────
  const COURSES = [
    { id: 'c1', name: 'Álgebra Lineal', code: 'MAT-201 · G01', priority: 'urgent', type: 'course' },
    { id: 'c2', name: 'Cálculo Integral', code: 'MAT-302 · G02', priority: 'moderate', type: 'course' },
    { id: 'c3', name: 'Programación II', code: 'INF-204 · G01', priority: 'flexible', type: 'course' },
    { id: 'c4', name: 'Física II', code: 'FIS-202 · G03', priority: 'urgent', type: 'course' },
    { id: 'c5', name: 'Estadística', code: 'MAT-105 · G01', priority: 'moderate', type: 'course' },
    { id: 'c6', name: 'Base de Datos', code: 'INF-301 · G02', priority: 'flexible', type: 'course' },
  ];

  const PENDING_TASKS = [
    { id: 'p1', name: 'Taller Cálculo', code: 'Entrega: Viernes', priority: 'urgent', type: 'pending' },
    { id: 'p2', name: 'Lab. Física', code: 'Práctica 5', priority: 'moderate', type: 'pending' },
    { id: 'p3', name: 'Proyecto BD', code: 'Sprint 2', priority: 'flexible', type: 'pending' },
    { id: 'p4', name: 'Quiz Álgebra', code: 'Cap. 3-4', priority: 'urgent', type: 'pending' },
  ];

  // Pre-placed blocks on the calendar (simulated existing schedule)
  const INITIAL_BLOCKS = [
    { day: 0, hour: 8,  name: 'Cálculo Integral', code: 'MAT-302', priority: 'moderate' },
    { day: 0, hour: 10, name: 'Programación II',  code: 'INF-204', priority: 'flexible' },
    { day: 1, hour: 9,  name: 'Física II',        code: 'FIS-202', priority: 'urgent' },
    { day: 1, hour: 14, name: 'Estadística',      code: 'MAT-105', priority: 'moderate' },
    { day: 2, hour: 10, name: 'Álgebra Lineal',   code: 'MAT-201', priority: 'urgent' },
    { day: 2, hour: 15, name: 'Base de Datos',    code: 'INF-301', priority: 'flexible' },
    { day: 3, hour: 8,  name: 'Cálculo Integral', code: 'MAT-302', priority: 'moderate' },
    { day: 3, hour: 11, name: 'Programación II',  code: 'INF-204', priority: 'flexible' },
    { day: 4, hour: 9,  name: 'Física II',        code: 'FIS-202', priority: 'urgent' },
    { day: 4, hour: 13, name: 'Estadística',      code: 'MAT-105', priority: 'moderate' },
  ];

  // ── State ─────────────────────────────────────────────
  const occupiedCells = {};          // key = "day-hour" → { name, code, priority }
  const selectedCards = new Set();   // IDs of selected sidebar cards
  let draggedData = null;            // Current drag payload
  let currentPopoverBlock = null;    // { day, hour } for active popover/edit
  let pendingConflict = null;        // Conflict resolution state

  // ── DOM References ────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const calendarGrid     = $('#calendarGrid');
  const panelCourses     = $('#panelCourses');
  const panelPending     = $('#panelPending');
  const modalOverlay     = $('#modalOverlay');
  const btnAddBlock      = $('#btnAddBlock');
  const modalClose       = $('#modalClose');
  const modalCancel      = $('#modalCancel');
  const modalSave        = $('#modalSave');
  const accessibilityToggle = $('#accessibilityToggle');
  const notificationBtn  = $('#notificationBtn');
  const notificationDropdown = $('#notificationDropdown');
  const hourSelect       = $('#hourSelect');
  const toastContainer   = $('#toastContainer');
  const liveAnnouncer    = $('#liveAnnouncer');

  // New elements
  const btnOptimize      = $('#btnOptimize');
  const statsPanel       = $('#statsPanel');
  const statsToggleBtn   = $('#statsToggleBtn');
  const statsPanelClose  = $('#statsPanelClose');
  const batchBar         = $('#batchBar');
  const batchCount       = $('#batchCount');
  const batchAssignBtn   = $('#batchAssignBtn');

  // Conflict modal
  const conflictModalOverlay  = $('#conflictModalOverlay');
  const conflictModalClose    = $('#conflictModalClose');
  const conflictInfo          = $('#conflictInfo');
  const conflictOptions       = $('#conflictOptions');
  const conflictSuggestionsList = $('#conflictSuggestionsList');

  // Block popover
  const blockPopover   = $('#blockPopover');
  const popoverClose   = $('#popoverClose');
  const popoverTitle   = $('#popoverTitle');
  const popoverMeta    = $('#popoverMeta');
  const popoverPriority = $('#popoverPriority');
  const popoverEdit    = $('#popoverEdit');
  const popoverDelete  = $('#popoverDelete');

  // Edit modal
  const editModalOverlay = $('#editModalOverlay');
  const editModalClose   = $('#editModalClose');
  const editModalCancel  = $('#editModalCancel');
  const editModalSave    = $('#editModalSave');

  // Optimization overlay
  const optimizationOverlay = $('#optimizationOverlay');
  const optimizationResults = $('#optimizationResults');
  const optimizationClose   = $('#optimizationClose');

  // ══════════════════════════════════════════════════════
  //  INITIALIZATION
  // ══════════════════════════════════════════════════════
  init();

  function init() {
    buildHourOptions();
    buildCalendarGrid();
    renderCourseCards(panelCourses, COURSES);
    renderCourseCards(panelPending, PENDING_TASKS);
    placeInitialBlocks();
    setupTabs();
    setupModal();
    setupAccessibility();
    setupNotifications();
    setupOptimization();
    setupStatsPanel();
    setupBatchAssign();
    setupBlockPopover();
    setupEditModal();
    setupConflictModal();
    setupGlobalKeyboard();
    updateStats();
  }

  // ── ARIA Live Announcer ───────────────────────────────
  function announce(message) {
    liveAnnouncer.textContent = '';
    setTimeout(() => { liveAnnouncer.textContent = message; }, 100);
  }

  // ── Priority Label Helper ─────────────────────────────
  function getPriorityLabel(p) {
    const map = { urgent: 'Urgente', moderate: 'Moderada', flexible: 'Flexible' };
    return map[p] || p;
  }

  // ══════════════════════════════════════════════════════
  //  CALENDAR GRID BUILD
  // ══════════════════════════════════════════════════════

  function buildHourOptions() {
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = `${String(h).padStart(2, '0')}:00`;
      hourSelect.appendChild(opt);
    }
  }

  function buildCalendarGrid() {
    // Corner cell
    const corner = document.createElement('div');
    corner.className = 'corner-header calendar-day-header';
    corner.setAttribute('aria-hidden', 'true');
    calendarGrid.appendChild(corner);

    // Day headers
    DAYS.forEach((day, i) => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header' + (i === TODAY_INDEX ? ' today' : '');
      header.innerHTML = `${day}<span class="day-number">${DAY_DATES[i]}</span>`;
      calendarGrid.appendChild(header);
    });

    // Time rows
    for (let h = START_HOUR; h < END_HOUR; h++) {
      // Time label
      const timeLabel = document.createElement('div');
      timeLabel.className = 'time-label';
      timeLabel.textContent = `${String(h).padStart(2, '0')}:00`;
      calendarGrid.appendChild(timeLabel);

      // Day cells
      for (let d = 0; d < 7; d++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.dataset.day = d;
        cell.dataset.hour = h;
        cell.id = `cell-${d}-${h}`;
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `${DAYS[d]} ${String(h).padStart(2, '0')}:00`);
        cell.tabIndex = -1;

        // Drag & Drop event listeners
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragenter', handleDragEnter);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);

        calendarGrid.appendChild(cell);
      }
    }
  }

  // ══════════════════════════════════════════════════════
  //  SIDEBAR COURSE/TASK CARDS
  // ══════════════════════════════════════════════════════

  function renderCourseCards(panel, items) {
    items.forEach(item => {
      const card = createCourseCard(item);
      panel.appendChild(card);
    });
  }

  function createCourseCard(item) {
    const card = document.createElement('div');
    card.className = `course-card priority-${item.priority}`;
    card.setAttribute('draggable', 'true');
    card.dataset.id = item.id;
    card.dataset.name = item.name;
    card.dataset.code = item.code;
    card.dataset.priority = item.priority;
    card.dataset.type = item.type;
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `${item.name} – ${item.code} – Prioridad: ${getPriorityLabel(item.priority)}`);
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="card-checkbox-wrap">
        <input type="checkbox" class="card-checkbox" data-id="${item.id}" aria-label="Seleccionar ${item.name}" tabindex="-1">
      </div>
      <div class="grip-icon" aria-hidden="true">
        <div class="grip-dot-row"><span class="grip-dot"></span><span class="grip-dot"></span></div>
        <div class="grip-dot-row"><span class="grip-dot"></span><span class="grip-dot"></span></div>
        <div class="grip-dot-row"><span class="grip-dot"></span><span class="grip-dot"></span></div>
      </div>
      <div class="course-card-info">
        <div class="course-card-name">${item.name}</div>
        <div class="course-card-meta">${item.code}</div>
      </div>
      <span class="priority-label ${item.priority}">${getPriorityLabel(item.priority)}</span>
    `;

    // Checkbox events
    const checkbox = card.querySelector('.card-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      if (e.target.checked) {
        selectedCards.add(item.id);
        card.classList.add('selected');
      } else {
        selectedCards.delete(item.id);
        card.classList.remove('selected');
      }
      updateBatchBar();
    });

    // Prevent checkbox from starting drag
    checkbox.addEventListener('mousedown', (e) => e.stopPropagation());

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
  }

  // ══════════════════════════════════════════════════════
  //  BATCH ASSIGNMENT (Multi-Select)
  // ══════════════════════════════════════════════════════

  function updateBatchBar() {
    const count = selectedCards.size;
    batchCount.textContent = `${count} seleccionado${count !== 1 ? 's' : ''}`;
    batchBar.classList.toggle('active', count > 0);
  }

  function setupBatchAssign() {
    batchAssignBtn.addEventListener('click', () => {
      if (selectedCards.size === 0) return;

      // Find available slots
      const availableSlots = [];
      for (let d = 0; d < 7 && availableSlots.length < selectedCards.size; d++) {
        for (let h = START_HOUR; h < END_HOUR && availableSlots.length < selectedCards.size; h++) {
          const key = `${d}-${h}`;
          if (!occupiedCells[key]) {
            availableSlots.push({ day: d, hour: h });
          }
        }
      }

      if (availableSlots.length < selectedCards.size) {
        showToast('⚠️ No hay suficientes espacios disponibles para todos los cursos seleccionados.', 'warning', 4000);
        return;
      }

      let i = 0;
      const assigned = [];
      selectedCards.forEach(cardId => {
        const cardEl = $(`.course-card[data-id="${cardId}"]`);
        if (cardEl && availableSlots[i]) {
          const slot = availableSlots[i];
          placeBlockOnCell(slot.day, slot.hour, cardEl.dataset.name, cardEl.dataset.code, cardEl.dataset.priority, true);
          assigned.push(cardEl.dataset.name);

          // Remove card with animation
          cardEl.style.transition = 'all 0.3s ease';
          cardEl.style.opacity = '0';
          cardEl.style.transform = 'translateX(-20px) scale(0.9)';
          setTimeout(() => cardEl.remove(), 300);
          i++;
        }
      });

      selectedCards.clear();
      updateBatchBar();
      updateStats();

      showToast(`✅ ${i} curso${i !== 1 ? 's' : ''} asignado${i !== 1 ? 's' : ''} automáticamente al horario.`, 'success', 4000);
      announce(`${i} cursos asignados automáticamente: ${assigned.join(', ')}.`);
    });
  }

  // ══════════════════════════════════════════════════════
  //  BLOCK PLACEMENT & REMOVAL
  // ══════════════════════════════════════════════════════

  function placeInitialBlocks() {
    INITIAL_BLOCKS.forEach(block => {
      placeBlockOnCell(block.day, block.hour, block.name, block.code, block.priority, false);
    });
  }

  function placeBlockOnCell(day, hour, name, code, priority, animate = true) {
    const cellKey = `${day}-${hour}`;
    const cell = $(`#cell-${day}-${hour}`);
    if (!cell) return;

    // Mark as occupied
    occupiedCells[cellKey] = { name, code, priority };

    // Remove any existing block element
    const existingBlock = cell.querySelector('.calendar-block');
    if (existingBlock) existingBlock.remove();

    const blockEl = document.createElement('div');
    blockEl.className = `calendar-block priority-${priority}`;
    blockEl.setAttribute('draggable', 'true');
    blockEl.dataset.day = day;
    blockEl.dataset.hour = hour;
    blockEl.innerHTML = `
      <span class="block-name">${name}</span>
      <span class="block-time">${code} · ${String(hour).padStart(2, '0')}:00</span>
    `;
    blockEl.setAttribute('title', `${name} – ${code}`);
    blockEl.setAttribute('role', 'button');
    blockEl.setAttribute('aria-label', `${name}, ${code}, ${DAYS[day]} ${String(hour).padStart(2, '0')}:00, Prioridad: ${getPriorityLabel(priority)}`);
    blockEl.tabIndex = 0;

    if (animate) {
      blockEl.style.animation = 'blockPlaceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // Click → show popover
    blockEl.addEventListener('click', (e) => {
      e.stopPropagation();
      showBlockPopover(parseInt(blockEl.dataset.day), parseInt(blockEl.dataset.hour), blockEl);
    });

    // Keyboard: Enter/Space → show popover
    blockEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showBlockPopover(parseInt(blockEl.dataset.day), parseInt(blockEl.dataset.hour), blockEl);
      }
    });

    // Intra-calendar drag: allow moving blocks within the grid
    blockEl.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      const d = parseInt(blockEl.dataset.day);
      const h = parseInt(blockEl.dataset.hour);
      draggedData = {
        name, code, priority,
        sourceDay: d,
        sourceHour: h,
        isCalendarBlock: true
      };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
      setTimeout(() => blockEl.classList.add('dragging'), 0);
    });

    blockEl.addEventListener('dragend', () => {
      blockEl.classList.remove('dragging');
      cleanupDragStates();
      draggedData = null;
    });

    cell.appendChild(blockEl);
  }

  function removeBlockFromCell(day, hour) {
    const cellKey = `${day}-${hour}`;
    const cell = $(`#cell-${day}-${hour}`);
    if (!cell) return;

    delete occupiedCells[cellKey];
    const block = cell.querySelector('.calendar-block');
    if (block) {
      block.style.animation = 'blockRemoveOut 0.3s ease forwards';
      setTimeout(() => block.remove(), 300);
    }
  }

  // ══════════════════════════════════════════════════════
  //  DRAG & DROP (Sidebar → Calendar + Intra-Calendar)
  // ══════════════════════════════════════════════════════

  function handleDragStart(e) {
    const card = e.currentTarget;
    draggedData = {
      id: card.dataset.id,
      name: card.dataset.name,
      code: card.dataset.code,
      priority: card.dataset.priority,
      type: card.dataset.type,
      isCalendarBlock: false
    };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
    setTimeout(() => card.classList.add('dragging'), 0);
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedData = null;
    cleanupDragStates();
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    const cellKey = `${cell.dataset.day}-${cell.dataset.hour}`;

    // Clean previous highlights from other cells
    $$('.calendar-cell.drag-over').forEach(c => {
      if (c !== cell) c.classList.remove('drag-over');
    });
    $$('.calendar-cell.drag-over-conflict').forEach(c => {
      if (c !== cell) c.classList.remove('drag-over-conflict');
    });
    $$('.conflict-message').forEach(m => m.remove());

    if (occupiedCells[cellKey]) {
      // Check if dragging the same block over itself
      if (draggedData && draggedData.isCalendarBlock &&
          draggedData.sourceDay === parseInt(cell.dataset.day) &&
          draggedData.sourceHour === parseInt(cell.dataset.hour)) {
        return;
      }

      cell.classList.add('drag-over-conflict');
      cell.classList.remove('drag-over');

      // Show floating conflict tooltip
      const msg = document.createElement('div');
      msg.className = 'conflict-message';
      msg.textContent = '⚠️ Conflicto – Soltar para resolver';
      cell.style.position = 'relative';
      cell.appendChild(msg);
    } else {
      cell.classList.add('drag-over');
      cell.classList.remove('drag-over-conflict');
    }
  }

  function handleDragLeave(e) {
    const cell = e.currentTarget;
    if (!cell.contains(e.relatedTarget)) {
      cell.classList.remove('drag-over');
      cell.classList.remove('drag-over-conflict');
      const msg = cell.querySelector('.conflict-message');
      if (msg) msg.remove();
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    const day = parseInt(cell.dataset.day);
    const hour = parseInt(cell.dataset.hour);
    const cellKey = `${day}-${hour}`;

    // Clean up visual states
    cell.classList.remove('drag-over');
    cell.classList.remove('drag-over-conflict');
    $$('.conflict-message').forEach(m => m.remove());

    // Get drag data
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
      data = draggedData;
    }
    if (!data) return;

    // ── CONFLICT: Cell already occupied ──
    if (occupiedCells[cellKey]) {
      // Ignore if dropping on itself
      if (data.isCalendarBlock && data.sourceDay === day && data.sourceHour === hour) return;

      // Open conflict resolution modal
      showConflictModal(data, occupiedCells[cellKey], day, hour);
      return;
    }

    // ── SUCCESS: Drop on empty cell ──
    // If intra-calendar move, remove from source
    if (data.isCalendarBlock) {
      removeBlockFromCell(data.sourceDay, data.sourceHour);
    }

    placeBlockOnCell(day, hour, data.name, data.code, data.priority, true);

    // Remove card from sidebar if applicable
    if (!data.isCalendarBlock && data.id) {
      removeSidebarCard(data);
    }

    updateStats();
    showToast(
      `✅ "${data.name}" asignado al ${DAYS[day]} ${String(hour).padStart(2, '0')}:00.`,
      'success', 3500
    );
    announce(`${data.name} asignado al ${DAYS[day]} a las ${String(hour).padStart(2, '0')} horas.`);
  }

  function cleanupDragStates() {
    $$('.calendar-cell.drag-over').forEach(c => c.classList.remove('drag-over'));
    $$('.calendar-cell.drag-over-conflict').forEach(c => c.classList.remove('drag-over-conflict'));
    $$('.conflict-message').forEach(m => m.remove());
  }

  function removeSidebarCard(block) {
    if (!block.isCalendarBlock && block.id) {
      const cardEl = $(`.course-card[data-id="${block.id}"]`);
      if (cardEl) {
        cardEl.style.transition = 'all 0.3s ease';
        cardEl.style.opacity = '0';
        cardEl.style.transform = 'translateX(-20px) scale(0.9)';
        setTimeout(() => cardEl.remove(), 300);
      }
    }
  }

  // ══════════════════════════════════════════════════════
  //  CONFLICT RESOLUTION MODAL
  // ══════════════════════════════════════════════════════

  function setupConflictModal() {
    conflictModalClose.addEventListener('click', closeConflictModal);
    conflictModalOverlay.addEventListener('click', (e) => {
      if (e.target === conflictModalOverlay) closeConflictModal();
    });
  }

  function showConflictModal(newBlock, existingBlock, day, hour) {
    pendingConflict = { newBlock, existingBlock, day, hour };

    // Subtitle
    $('#conflictModalSubtitle').textContent = `${DAYS[day]} a las ${String(hour).padStart(2, '0')}:00`;

    // Info cards
    conflictInfo.innerHTML = `
      <div class="conflict-block-card existing">
        <div class="conflict-block-label">📌 Bloque Actual</div>
        <div class="conflict-block-name">${existingBlock.name}</div>
        <div class="conflict-block-code">${existingBlock.code} · ${getPriorityLabel(existingBlock.priority)}</div>
      </div>
      <div class="conflict-vs">VS</div>
      <div class="conflict-block-card incoming">
        <div class="conflict-block-label">🆕 Nuevo Bloque</div>
        <div class="conflict-block-name">${newBlock.name}</div>
        <div class="conflict-block-code">${newBlock.code} · ${getPriorityLabel(newBlock.priority)}</div>
      </div>
    `;

    // Resolution options
    conflictOptions.innerHTML = `
      <button class="conflict-option-btn" data-action="replace">
        <span class="conflict-option-icon">🔄</span>
        <div>
          <div class="conflict-option-title">Reemplazar Existente</div>
          <div class="conflict-option-desc">Quita "${existingBlock.name}" y coloca "${newBlock.name}" en su lugar</div>
        </div>
      </button>
      <button class="conflict-option-btn" data-action="swap-group">
        <span class="conflict-option-icon">🔀</span>
        <div>
          <div class="conflict-option-title">Cambiar al Grupo 02</div>
          <div class="conflict-option-desc">Busca un horario alternativo para "${newBlock.name}" en otro grupo</div>
        </div>
      </button>
      <button class="conflict-option-btn" data-action="move-nearest">
        <span class="conflict-option-icon">📍</span>
        <div>
          <div class="conflict-option-title">Mover al Horario Más Cercano</div>
          <div class="conflict-option-desc">Coloca "${newBlock.name}" en el espacio libre más cercano</div>
        </div>
      </button>
      <button class="conflict-option-btn cancel" data-action="cancel">
        <span class="conflict-option-icon">❌</span>
        <div>
          <div class="conflict-option-title">Cancelar</div>
          <div class="conflict-option-desc">No realizar ningún cambio</div>
        </div>
      </button>
    `;

    // Find and show alternative suggestions
    const suggestions = findAvailableSlots(day, hour, 5);
    const suggestionsContainer = $('#conflictSuggestions');

    if (suggestions.length > 0) {
      conflictSuggestionsList.innerHTML = suggestions.map(s =>
        `<button class="suggestion-slot" data-day="${s.day}" data-hour="${s.hour}">
          ${DAYS[s.day]} ${String(s.hour).padStart(2, '0')}:00
        </button>`
      ).join('');
      suggestionsContainer.style.display = 'block';

      // Suggestion click handlers
      conflictSuggestionsList.querySelectorAll('.suggestion-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          const sDay = parseInt(btn.dataset.day);
          const sHour = parseInt(btn.dataset.hour);

          if (pendingConflict.newBlock.isCalendarBlock) {
            removeBlockFromCell(pendingConflict.newBlock.sourceDay, pendingConflict.newBlock.sourceHour);
          }

          placeBlockOnCell(sDay, sHour, pendingConflict.newBlock.name, pendingConflict.newBlock.code, pendingConflict.newBlock.priority, true);
          removeSidebarCard(pendingConflict.newBlock);
          updateStats();

          showToast(`✅ "${pendingConflict.newBlock.name}" asignado al ${DAYS[sDay]} ${String(sHour).padStart(2, '0')}:00.`, 'success', 3500);
          announce(`${pendingConflict.newBlock.name} asignado al ${DAYS[sDay]} a las ${String(sHour).padStart(2, '0')} horas.`);
          closeConflictModal();
        });
      });
    } else {
      suggestionsContainer.style.display = 'none';
    }

    // Option button click handlers
    conflictOptions.querySelectorAll('.conflict-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleConflictAction(btn.dataset.action);
      });
    });

    conflictModalOverlay.classList.add('active');
    announce('Conflicto horario detectado. Se muestran opciones de resolución.');
  }

  function handleConflictAction(action) {
    if (!pendingConflict) return;
    const { newBlock, existingBlock, day, hour } = pendingConflict;

    switch (action) {
      case 'replace':
        removeBlockFromCell(day, hour);
        setTimeout(() => {
          if (newBlock.isCalendarBlock) {
            removeBlockFromCell(newBlock.sourceDay, newBlock.sourceHour);
          }
          placeBlockOnCell(day, hour, newBlock.name, newBlock.code, newBlock.priority, true);
          removeSidebarCard(newBlock);
          updateStats();
          showToast(`🔄 "${newBlock.name}" reemplazó a "${existingBlock.name}" el ${DAYS[day]}.`, 'success', 4000);
          announce(`${newBlock.name} reemplazó a ${existingBlock.name}.`);
        }, 350);
        break;

      case 'swap-group': {
        const alt = findAvailableSlots(day, hour, 1)[0];
        if (alt) {
          if (newBlock.isCalendarBlock) {
            removeBlockFromCell(newBlock.sourceDay, newBlock.sourceHour);
          }
          const newCode = newBlock.code.replace(/G0\d/, 'G02');
          placeBlockOnCell(alt.day, alt.hour, newBlock.name, newCode, newBlock.priority, true);
          removeSidebarCard(newBlock);
          updateStats();
          showToast(`🔀 "${newBlock.name}" cambiado al Grupo 02: ${DAYS[alt.day]} ${String(alt.hour).padStart(2, '0')}:00.`, 'success', 4000);
          announce(`${newBlock.name} cambiado al Grupo 02 en ${DAYS[alt.day]}.`);
        } else {
          showToast('⚠️ No hay horarios alternativos disponibles para el cambio de grupo.', 'warning', 3500);
        }
        break;
      }

      case 'move-nearest': {
        const nearest = findNearestSlot(day, hour);
        if (nearest) {
          if (newBlock.isCalendarBlock) {
            removeBlockFromCell(newBlock.sourceDay, newBlock.sourceHour);
          }
          placeBlockOnCell(nearest.day, nearest.hour, newBlock.name, newBlock.code, newBlock.priority, true);
          removeSidebarCard(newBlock);
          updateStats();
          showToast(`📍 "${newBlock.name}" movido al ${DAYS[nearest.day]} ${String(nearest.hour).padStart(2, '0')}:00.`, 'success', 4000);
          announce(`${newBlock.name} movido al ${DAYS[nearest.day]}.`);
        } else {
          showToast('⚠️ No hay espacios disponibles cercanos.', 'warning', 3500);
        }
        break;
      }

      case 'cancel':
        showToast('❌ Operación cancelada. No se realizaron cambios.', 'warning', 2500);
        break;
    }

    closeConflictModal();
  }

  function closeConflictModal() {
    conflictModalOverlay.classList.remove('active');
    pendingConflict = null;
  }

  // ── Slot Finding Algorithms ───────────────────────────

  function findAvailableSlots(preferDay, preferHour, count) {
    const slots = [];
    const added = new Set();

    const tryAdd = (d, h) => {
      const key = `${d}-${h}`;
      if (!occupiedCells[key] && !added.has(key) && h >= START_HOUR && h < END_HOUR) {
        slots.push({ day: d, hour: h });
        added.add(key);
        return true;
      }
      return false;
    };

    // First: same day, nearby hours
    for (let offset = 1; offset <= END_HOUR - START_HOUR && slots.length < count; offset++) {
      tryAdd(preferDay, preferHour + offset);
      tryAdd(preferDay, preferHour - offset);
    }

    // Then: adjacent days
    for (let dayOffset = 1; dayOffset < 7 && slots.length < count; dayOffset++) {
      for (const dir of [-1, 1]) {
        const d = ((preferDay + dir * dayOffset) % 7 + 7) % 7;
        // Try near same hour first
        tryAdd(d, preferHour);
        for (let hOff = 1; hOff <= END_HOUR - START_HOUR && slots.length < count; hOff++) {
          tryAdd(d, preferHour + hOff);
          tryAdd(d, preferHour - hOff);
        }
      }
    }

    return slots.slice(0, count);
  }

  function findNearestSlot(day, hour) {
    // BFS-style search: expand outward from target
    for (let radius = 1; radius <= 20; radius++) {
      for (let dh = -radius; dh <= radius; dh++) {
        for (let dd = -radius; dd <= radius; dd++) {
          if (Math.abs(dh) !== radius && Math.abs(dd) !== radius) continue;
          const d = ((day + dd) % 7 + 7) % 7;
          const h = hour + dh;
          if (h < START_HOUR || h >= END_HOUR) continue;
          const key = `${d}-${h}`;
          if (!occupiedCells[key]) return { day: d, hour: h };
        }
      }
    }
    return null;
  }

  // ══════════════════════════════════════════════════════
  //  BLOCK DETAIL POPOVER
  // ══════════════════════════════════════════════════════

  function setupBlockPopover() {
    popoverClose.addEventListener('click', hideBlockPopover);

    document.addEventListener('click', (e) => {
      if (blockPopover.classList.contains('active') &&
          !blockPopover.contains(e.target) &&
          !e.target.closest('.calendar-block')) {
        hideBlockPopover();
      }
    });
  }

  function showBlockPopover(day, hour, blockEl) {
    const data = occupiedCells[`${day}-${hour}`];
    if (!data) return;

    currentPopoverBlock = { day, hour };

    popoverTitle.textContent = data.name;
    popoverMeta.innerHTML = `
      <div class="popover-meta-row">📋 ${data.code}</div>
      <div class="popover-meta-row">📅 ${DAYS[day]}, ${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00</div>
    `;
    popoverPriority.innerHTML = `<span class="priority-label ${data.priority}">${getPriorityLabel(data.priority)}</span>`;

    // Position popover near the block
    const rect = blockEl.getBoundingClientRect();
    const popW = 260;
    const popH = 220;

    let left = rect.right + 12;
    let top = rect.top;

    // If goes off right edge, show on left
    if (left + popW > window.innerWidth) {
      left = rect.left - popW - 12;
    }
    // If goes off left edge, center below
    if (left < 8) {
      left = Math.max(8, rect.left);
    }
    // If goes off bottom edge
    if (top + popH > window.innerHeight) {
      top = window.innerHeight - popH - 16;
    }
    if (top < 8) top = 8;

    blockPopover.style.left = `${left}px`;
    blockPopover.style.top = `${top}px`;
    blockPopover.classList.add('active');
  }

  function hideBlockPopover() {
    blockPopover.classList.remove('active');
    currentPopoverBlock = null;
  }

  // ══════════════════════════════════════════════════════
  //  EDIT / DELETE BLOCK
  // ══════════════════════════════════════════════════════

  function setupEditModal() {
    // Edit button in popover
    popoverEdit.addEventListener('click', () => {
      if (!currentPopoverBlock) return;
      const { day, hour } = currentPopoverBlock;
      const data = occupiedCells[`${day}-${hour}`];
      if (!data) return;

      hideBlockPopover();
      openEditModal(day, hour, data);
    });

    // Delete button in popover
    popoverDelete.addEventListener('click', () => {
      if (!currentPopoverBlock) return;
      const { day, hour } = currentPopoverBlock;
      const data = occupiedCells[`${day}-${hour}`];
      if (!data) return;

      hideBlockPopover();

      removeBlockFromCell(day, hour);
      updateStats();
      showToast(`🗑️ "${data.name}" eliminado del ${DAYS[day]} ${String(hour).padStart(2, '0')}:00.`, 'warning', 3500);
      announce(`${data.name} eliminado del horario.`);
    });

    // Edit modal controls
    editModalClose.addEventListener('click', closeEditModal);
    editModalCancel.addEventListener('click', closeEditModal);
    editModalOverlay.addEventListener('click', (e) => {
      if (e.target === editModalOverlay) closeEditModal();
    });

    // Save edits
    editModalSave.addEventListener('click', () => {
      if (!currentPopoverBlock) return;
      const { day, hour } = currentPopoverBlock;

      const name = $('#editCourseName').value.trim();
      const code = $('#editCourseCode').value.trim() || 'Sin código';
      const priority = document.querySelector('input[name="editPriority"]:checked')?.value || 'moderate';

      if (!name) {
        $('#editCourseName').focus();
        showToast('⚠️ El nombre del curso no puede estar vacío.', 'warning', 3000);
        return;
      }

      // Remove old and place updated
      removeBlockFromCell(day, hour);
      setTimeout(() => {
        placeBlockOnCell(day, hour, name, code, priority, true);
        updateStats();
        showToast(`✏️ "${name}" actualizado correctamente.`, 'success', 3500);
        announce(`${name} actualizado en el horario.`);
        closeEditModal();
      }, 350);
    });
  }

  function openEditModal(day, hour, data) {
    currentPopoverBlock = { day, hour };
    $('#editCourseName').value = data.name;
    $('#editCourseCode').value = data.code;

    // Set the correct priority radio
    const capitalizedPriority = data.priority.charAt(0).toUpperCase() + data.priority.slice(1);
    const radio = $(`#editPriority${capitalizedPriority}`);
    if (radio) radio.checked = true;

    editModalOverlay.classList.add('active');
    setTimeout(() => $('#editCourseName').focus(), 100);
  }

  function closeEditModal() {
    editModalOverlay.classList.remove('active');
    $('#editBlockForm').reset();
    currentPopoverBlock = null;
  }

  // ══════════════════════════════════════════════════════
  //  OPTIMIZATION OF DEAD TIMES (Tiempos Muertos)
  // ══════════════════════════════════════════════════════

  function setupOptimization() {
    btnOptimize.addEventListener('click', runOptimization);
    optimizationClose.addEventListener('click', () => {
      optimizationOverlay.classList.remove('active');
    });
    optimizationOverlay.addEventListener('click', (e) => {
      if (e.target === optimizationOverlay) optimizationOverlay.classList.remove('active');
    });
  }

  function runOptimization() {
    let totalMoved = 0;
    let totalFreed = 0;
    const movementLog = [];

    btnOptimize.classList.add('optimizing');
    announce('Optimizando horario, por favor espera…');

    // For each day, compact blocks by removing gaps
    for (let d = 0; d < 7; d++) {
      // Collect all blocks for this day, sorted by hour
      const dayBlocks = [];
      for (let h = START_HOUR; h < END_HOUR; h++) {
        const key = `${d}-${h}`;
        if (occupiedCells[key]) {
          dayBlocks.push({ hour: h, ...occupiedCells[key] });
        }
      }

      if (dayBlocks.length < 2) continue;

      // Compact: slide blocks upward to fill gaps
      let nextSlot = dayBlocks[0].hour; // Keep first block in place

      for (let i = 0; i < dayBlocks.length; i++) {
        const block = dayBlocks[i];
        if (block.hour > nextSlot) {
          // Gap detected — move block up
          const fromHour = block.hour;
          const toHour = nextSlot;

          // Remove from old position in state
          delete occupiedCells[`${d}-${fromHour}`];

          // Place at new position in state
          occupiedCells[`${d}-${toHour}`] = {
            name: block.name,
            code: block.code,
            priority: block.priority
          };

          totalMoved++;
          totalFreed += (fromHour - toHour);
          movementLog.push(`${block.name}: ${DAYS[d]} ${String(fromHour).padStart(2, '0')}:00 → ${String(toHour).padStart(2, '0')}:00`);

          nextSlot = toHour + 1;
        } else {
          nextSlot = block.hour + 1;
        }
      }
    }

    // Re-render all blocks with animation after a brief delay
    setTimeout(() => {
      // Clear all block elements from DOM
      $$('.calendar-block').forEach(b => b.remove());

      // Re-place all blocks from state with animation
      Object.entries(occupiedCells).forEach(([key, data]) => {
        const [d, h] = key.split('-').map(Number);
        placeBlockOnCell(d, h, data.name, data.code, data.priority, true);
      });

      updateStats();
      btnOptimize.classList.remove('optimizing');

      if (totalMoved === 0) {
        showToast('✨ ¡Tu horario ya está optimizado! No se encontraron tiempos muertos para eliminar.', 'success', 4000);
        announce('El horario ya está optimizado. No se encontraron tiempos muertos.');
      } else {
        // Show optimization results overlay
        optimizationResults.innerHTML = `
          <div class="opt-result-row">
            <span class="opt-result-label">Bloques reubicados</span>
            <span class="opt-result-value">${totalMoved}</span>
          </div>
          <div class="opt-result-row">
            <span class="opt-result-label">Horas liberadas</span>
            <span class="opt-result-value">${totalFreed} hrs</span>
          </div>
          <div class="opt-result-divider"></div>
          <div class="opt-result-log">
            ${movementLog.map(m => `<div class="opt-log-item">→ ${m}</div>`).join('')}
          </div>
        `;
        optimizationOverlay.classList.add('active');
        announce(`Optimización completada: ${totalMoved} bloques movidos, ${totalFreed} horas liberadas.`);
      }
    }, 600);
  }

  // ══════════════════════════════════════════════════════
  //  STATISTICS PANEL
  // ══════════════════════════════════════════════════════

  function setupStatsPanel() {
    statsToggleBtn.addEventListener('click', () => {
      const isActive = statsPanel.classList.toggle('active');
      if (isActive) {
        updateStats();
        announce('Panel de estadísticas abierto.');
      } else {
        announce('Panel de estadísticas cerrado.');
      }
    });

    statsPanelClose.addEventListener('click', () => {
      statsPanel.classList.remove('active');
      announce('Panel de estadísticas cerrado.');
    });
  }

  function updateStats() {
    const blocks = Object.values(occupiedCells);
    const total = blocks.length;
    const occupancyPct = Math.round((total / TOTAL_SLOTS) * 100);

    // Count by priority
    const urgentCount = blocks.filter(b => b.priority === 'urgent').length;
    const moderateCount = blocks.filter(b => b.priority === 'moderate').length;
    const flexibleCount = blocks.filter(b => b.priority === 'flexible').length;

    // Calculate dead times: gaps between first and last block per day
    let deadTimeHours = 0;
    for (let d = 0; d < 7; d++) {
      const dayHours = [];
      for (let h = START_HOUR; h < END_HOUR; h++) {
        if (occupiedCells[`${d}-${h}`]) dayHours.push(h);
      }
      if (dayHours.length >= 2) {
        const span = dayHours[dayHours.length - 1] - dayHours[0] + 1;
        deadTimeHours += (span - dayHours.length);
      }
    }

    // Animate stat updates
    const updateStat = (id, value, barId, pct) => {
      const el = $(`#${id}`);
      const bar = $(`#${barId}`);
      if (el) el.textContent = value;
      if (bar) {
        requestAnimationFrame(() => {
          bar.style.width = `${Math.min(pct, 100)}%`;
        });
      }
    };

    updateStat('statOccupancy', `${occupancyPct}%`, 'statOccupancyBar', occupancyPct);
    updateStat('statDeadTimes', `${deadTimeHours} hrs`, 'statDeadTimesBar', Math.min((deadTimeHours / 10) * 100, 100));
    updateStat('statUrgent', `${urgentCount} hrs`, 'statUrgentBar', total > 0 ? (urgentCount / total) * 100 : 0);
    updateStat('statModerate', `${moderateCount} hrs`, 'statModerateBar', total > 0 ? (moderateCount / total) * 100 : 0);
    updateStat('statFlexible', `${flexibleCount} hrs`, 'statFlexibleBar', total > 0 ? (flexibleCount / total) * 100 : 0);
    updateStat('statTotalBlocks', `${total}`, 'statTotalBar', (total / 20) * 100);
  }

  // ══════════════════════════════════════════════════════
  //  SIDEBAR TABS
  // ══════════════════════════════════════════════════════

  function setupTabs() {
    const tabs = $$('.sidebar-tab');
    const panels = $$('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const target = tab.dataset.tab;
        const panel = target === 'courses' ? panelCourses : panelPending;
        panel.classList.add('active');
      });
    });
  }

  // ══════════════════════════════════════════════════════
  //  ADD BLOCK MODAL
  // ══════════════════════════════════════════════════════

  function setupModal() {
    const openModal = () => {
      modalOverlay.classList.add('active');
      setTimeout(() => $('#courseName').focus(), 100);
    };

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      $('#addBlockForm').reset();
      $('#priorityModerate').checked = true;
    };

    btnAddBlock.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Save new block
    modalSave.addEventListener('click', () => {
      const name = $('#courseName').value.trim();
      const code = $('#courseCode').value.trim() || 'Sin código';
      const day = parseInt($('#daySelect').value);
      const hour = parseInt($('#hourSelect').value);
      const priority = document.querySelector('input[name="priority"]:checked')?.value || 'moderate';

      // Validation
      if (!name) {
        $('#courseName').focus();
        showToast('⚠️ Por favor, ingresa el nombre del curso.', 'warning', 3000);
        return;
      }
      if (isNaN(day)) {
        showToast('⚠️ Selecciona un día de la semana.', 'warning', 3000);
        return;
      }
      if (isNaN(hour)) {
        showToast('⚠️ Selecciona una hora.', 'warning', 3000);
        return;
      }

      const cellKey = `${day}-${hour}`;

      // Conflict: open resolution modal
      if (occupiedCells[cellKey]) {
        const existing = occupiedCells[cellKey];
        closeModal();
        showConflictModal(
          { name, code, priority, isCalendarBlock: false },
          existing, day, hour
        );
        return;
      }

      // Place block
      placeBlockOnCell(day, hour, name, code, priority, true);
      updateStats();
      showToast(`✅ "${name}" agregado al ${DAYS[day]} ${String(hour).padStart(2, '0')}:00.`, 'success', 3500);
      announce(`${name} agregado al horario.`);
      closeModal();
    });
  }

  // ══════════════════════════════════════════════════════
  //  ACCESSIBILITY TOGGLE
  // ══════════════════════════════════════════════════════

  function setupAccessibility() {
    let isLightMode = false;
    const themeLabel = $('#themeToggleLabel');

    const toggle = () => {
      isLightMode = !isLightMode;
      document.body.classList.toggle('accessibility-mode', isLightMode);
      accessibilityToggle.classList.toggle('active', isLightMode);
      accessibilityToggle.setAttribute('aria-checked', String(isLightMode));

      // Update label
      themeLabel.textContent = isLightMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro';

      showToast(
        isLightMode
          ? '☀️ Modo claro activado'
          : '🌙 Modo oscuro activado',
        'success',
        2500
      );
      announce(isLightMode ? 'Modo claro activado.' : 'Modo oscuro activado.');
    };

    accessibilityToggle.addEventListener('click', toggle);
    accessibilityToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  // ══════════════════════════════════════════════════════
  //  NOTIFICATION DROPDOWN
  // ══════════════════════════════════════════════════════

  function setupNotifications() {
    let isOpen = false;

    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      notificationDropdown.classList.toggle('active', isOpen);

      if (isOpen) {
        const badge = $('#notifBadge');
        if (badge) badge.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        isOpen = false;
        notificationDropdown.classList.remove('active');
      }
    });
  }

  // ══════════════════════════════════════════════════════
  //  GLOBAL KEYBOARD NAVIGATION
  // ══════════════════════════════════════════════════════

  function setupGlobalKeyboard() {
    // Escape closes any open overlay
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modalOverlay.classList.contains('active')) {
          modalOverlay.classList.remove('active');
          $('#addBlockForm').reset();
          $('#priorityModerate').checked = true;
        }
        if (conflictModalOverlay.classList.contains('active')) closeConflictModal();
        if (editModalOverlay.classList.contains('active')) closeEditModal();
        if (optimizationOverlay.classList.contains('active')) optimizationOverlay.classList.remove('active');
        if (blockPopover.classList.contains('active')) hideBlockPopover();
      }
    });

    // Arrow key navigation within calendar grid
    calendarGrid.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (!active || !active.classList.contains('calendar-cell')) return;

      const day = parseInt(active.dataset.day);
      const hour = parseInt(active.dataset.hour);
      let nextDay = day, nextHour = hour;

      switch (e.key) {
        case 'ArrowRight':  nextDay = Math.min(day + 1, 6);                break;
        case 'ArrowLeft':   nextDay = Math.max(day - 1, 0);                break;
        case 'ArrowDown':   nextHour = Math.min(hour + 1, END_HOUR - 1);   break;
        case 'ArrowUp':     nextHour = Math.max(hour - 1, START_HOUR);     break;
        default: return;
      }

      e.preventDefault();
      const nextCell = $(`#cell-${nextDay}-${nextHour}`);
      if (nextCell) nextCell.focus();
    });
  }

  // ══════════════════════════════════════════════════════
  //  TOAST NOTIFICATIONS
  // ══════════════════════════════════════════════════════

  function showToast(message, type = 'success', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: '✅',
      warning: '⚠️',
      conflict: '🚫',
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || '💬'}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

});
