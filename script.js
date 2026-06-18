document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── Constants & Config ────────────────────────────────
  const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const DAY_DATES = [16, 17, 18, 19, 20, 21, 22]; // Simulated week
  const START_HOUR = 8;
  const END_HOUR = 22;
  const TODAY_INDEX = 2; // Wednesday = Miércoles (index 2 for demo)

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
    { day: 0, hour: 8, name: 'Cálculo Integral', code: 'MAT-302', priority: 'moderate' },
    { day: 0, hour: 10, name: 'Programación II', code: 'INF-204', priority: 'flexible' },
    { day: 1, hour: 9, name: 'Física II', code: 'FIS-202', priority: 'urgent' },
    { day: 1, hour: 14, name: 'Estadística', code: 'MAT-105', priority: 'moderate' },
    { day: 2, hour: 10, name: 'Álgebra Lineal', code: 'MAT-201', priority: 'urgent' },
    { day: 2, hour: 15, name: 'Base de Datos', code: 'INF-301', priority: 'flexible' },
    { day: 3, hour: 8, name: 'Cálculo Integral', code: 'MAT-302', priority: 'moderate' },
    { day: 3, hour: 11, name: 'Programación II', code: 'INF-204', priority: 'flexible' },
    { day: 4, hour: 9, name: 'Física II', code: 'FIS-202', priority: 'urgent' },
    { day: 4, hour: 13, name: 'Estadística', code: 'MAT-105', priority: 'moderate' },
  ];

  // State: track occupied cells -> key = "day-hour"
  const occupiedCells = {};

  // ── DOM References ────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const calendarGrid = $('#calendarGrid');
  const panelCourses = $('#panelCourses');
  const panelPending = $('#panelPending');
  const modalOverlay = $('#modalOverlay');
  const btnAddBlock = $('#btnAddBlock');
  const modalClose = $('#modalClose');
  const modalCancel = $('#modalCancel');
  const modalSave = $('#modalSave');
  const accessibilityToggle = $('#accessibilityToggle');
  const notificationBtn = $('#notificationBtn');
  const notificationDropdown = $('#notificationDropdown');
  const hourSelect = $('#hourSelect');
  const toastContainer = $('#toastContainer');

  // ── Initialize ────────────────────────────────────────
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
  }

  // ── Build Hour <select> Options ───────────────────────
  function buildHourOptions() {
    for (let h = START_HOUR; h < END_HOUR; h++) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = `${String(h).padStart(2, '0')}:00`;
      hourSelect.appendChild(opt);
    }
  }

  // ── Build Calendar Grid ───────────────────────────────
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

        // Drag & Drop event listeners
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragenter', handleDragEnter);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);

        calendarGrid.appendChild(cell);
      }
    }
  }

  // ── Render Course/Task Cards ──────────────────────────
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

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
  }

  function getPriorityLabel(p) {
    const map = { urgent: 'Urgente', moderate: 'Moderada', flexible: 'Flexible' };
    return map[p] || p;
  }

  // ── Place Initial Blocks ──────────────────────────────
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

    const blockEl = document.createElement('div');
    blockEl.className = `calendar-block priority-${priority}`;
    blockEl.innerHTML = `
      <span class="block-name">${name}</span>
      <span class="block-time">${code} · ${String(hour).padStart(2, '0')}:00</span>
    `;
    blockEl.setAttribute('title', `${name} – ${code}`);

    if (animate) {
      blockEl.style.animation = 'fadeInPanel 0.35s ease';
    }

    cell.appendChild(blockEl);
  }

  // ── Drag & Drop Handlers ──────────────────────────────
  let draggedData = null;

  function handleDragStart(e) {
    const card = e.currentTarget;
    draggedData = {
      id: card.dataset.id,
      name: card.dataset.name,
      code: card.dataset.code,
      priority: card.dataset.priority,
      type: card.dataset.type,
    };

    // Set data transfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));

    // Visual feedback
    setTimeout(() => card.classList.add('dragging'), 0);
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    draggedData = null;

    // Clean up all drag-over states
    $$('.calendar-cell.drag-over').forEach(c => c.classList.remove('drag-over'));
    $$('.calendar-cell.drag-over-conflict').forEach(c => c.classList.remove('drag-over-conflict'));

    // Remove any floating conflict messages
    $$('.conflict-message').forEach(m => m.remove());
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    const cellKey = `${cell.dataset.day}-${cell.dataset.hour}`;

    // Remove previous states from other cells
    $$('.calendar-cell.drag-over').forEach(c => {
      if (c !== cell) c.classList.remove('drag-over');
    });
    $$('.calendar-cell.drag-over-conflict').forEach(c => {
      if (c !== cell) c.classList.remove('drag-over-conflict');
    });
    $$('.conflict-message').forEach(m => m.remove());

    if (occupiedCells[cellKey]) {
      // CONFLICT: Cell already occupied
      cell.classList.add('drag-over-conflict');
      cell.classList.remove('drag-over');

      // Show floating conflict message
      const msg = document.createElement('div');
      msg.className = 'conflict-message';
      msg.textContent = '⚠️ Conflicto – Cambiar al Grupo 02';
      cell.style.position = 'relative';
      cell.appendChild(msg);
    } else {
      // Normal drop zone
      cell.classList.add('drag-over');
      cell.classList.remove('drag-over-conflict');
    }
  }

  function handleDragLeave(e) {
    const cell = e.currentTarget;
    // Only remove if leaving to a non-child element
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

    // ── Scenario 3: Conflict Detection ──
    if (occupiedCells[cellKey]) {
      const existing = occupiedCells[cellKey];

      // Visual conflict flash
      cell.classList.add('drag-over-conflict');
      setTimeout(() => cell.classList.remove('drag-over-conflict'), 1200);

      // Toast: Conflict notification
      showToast(
        `⚠️ Conflicto horario: "${data.name}" coincide con "${existing.name}" el ${DAYS[day]} a las ${String(hour).padStart(2, '0')}:00. Sugerencia: Cambiar al Grupo 02.`,
        'conflict',
        5000
      );
      return;
    }

    // ── Scenario 2: Successful Drop ──
    placeBlockOnCell(day, hour, data.name, data.code, data.priority, true);

    // Remove card from sidebar
    const cardEl = $(`.course-card[data-id="${data.id}"]`);
    if (cardEl) {
      cardEl.style.transition = 'all 0.3s ease';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'translateX(-20px) scale(0.9)';
      setTimeout(() => cardEl.remove(), 300);
    }

    // Toast: Reminder activated
    showToast(
      `✅ "${data.name}" asignado al ${DAYS[day]} ${String(hour).padStart(2, '0')}:00. Recordatorio activado.`,
      'success',
      3500
    );
  }

  // ── Sidebar Tabs ──────────────────────────────────────
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

  // ── Modal ─────────────────────────────────────────────
  function setupModal() {
    const openModal = () => {
      modalOverlay.classList.add('active');
      $('#courseName').focus();
    };

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      $('#addBlockForm').reset();
      // Re-check default radio
      $('#priorityModerate').checked = true;
    };

    btnAddBlock.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });

    // ── Scenario 1: Add Block from Modal ──
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

      // Conflict check
      if (occupiedCells[cellKey]) {
        const existing = occupiedCells[cellKey];
        showToast(
          `⚠️ Conflicto: "${existing.name}" ya ocupa el ${DAYS[day]} a las ${String(hour).padStart(2, '0')}:00. Sugerencia: Cambiar al Grupo 02.`,
          'conflict',
          5000
        );
        return;
      }

      // Place block
      placeBlockOnCell(day, hour, name, code, priority, true);
      showToast(
        `✅ "${name}" agregado al ${DAYS[day]} ${String(hour).padStart(2, '0')}:00. Recordatorio activado.`,
        'success',
        3500
      );

      closeModal();
    });
  }

  // ── Accessibility Toggle ──────────────────────────────
  function setupAccessibility() {
    let isActive = false;

    const toggle = () => {
      isActive = !isActive;
      document.body.classList.toggle('accessibility-mode', isActive);
      accessibilityToggle.classList.toggle('active', isActive);
      accessibilityToggle.setAttribute('aria-checked', String(isActive));

      showToast(
        isActive
          ? '♿ Modo accesibilidad activado – Contraste WCAG 2.1 (4.5:1)'
          : '🎨 Modo estándar restaurado',
        isActive ? 'success' : 'warning',
        3000
      );
    };

    accessibilityToggle.addEventListener('click', toggle);
    accessibilityToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  // ── Notification Dropdown ─────────────────────────────
  function setupNotifications() {
    let isOpen = false;

    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      notificationDropdown.classList.toggle('active', isOpen);

      // Hide badge on first open
      if (isOpen) {
        const badge = $('#notifBadge');
        if (badge) badge.style.display = 'none';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        isOpen = false;
        notificationDropdown.classList.remove('active');
      }
    });
  }

  // ── Toast Notifications ───────────────────────────────
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

    // Auto-remove
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

});
