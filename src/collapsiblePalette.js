/**
 * CollapsiblePalette
 * Aggiunge intestazioni cliccabili ai gruppi della palette per compattarli.
 * Lo stato (aperto/chiuso) viene persistito in localStorage.
 */

const GROUP_LABELS = {
  event:         'Events',
  gateway:       'Gateway',
  activity:      'Activity',
  data:          'Data',
  collaboration: 'Collaboration',
  artifact:      'Artifact'
};

const STORAGE_KEY = 'bpmn-palette-collapsed';

export default class CollapsiblePalette {
  constructor(eventBus, palette) {
    this._palette = palette;
    this._collapsed = this._loadState();

    eventBus.on('palette.changed', () => {
      // setTimeout 0 garantisce che il DOM sia aggiornato prima di manipolarlo
      setTimeout(() => this._applyCollapsible(), 0);
    });
  }

  // ── Persistenza ──────────────────────────────────────────────────────────

  _loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._collapsed));
    } catch {}
  }

  // ── Logica collasso ───────────────────────────────────────────────────────

  _applyCollapsible() {
    const container = this._palette._container;
    if (!container) return;

    const entriesContainer = container.querySelector('.djs-palette-entries');
    if (!entriesContainer) return;

    const groups = Array.from(
      entriesContainer.querySelectorAll('.group[data-group]')
    );

    groups.forEach((groupEl) => {
      const groupId = groupEl.getAttribute('data-group');
      const label = GROUP_LABELS[groupId];

      // Salta 'tools' (sempre visibile) e gruppi senza etichetta
      if (!label) return;

      // Evita doppia inizializzazione sullo stesso DOM
      if (groupEl.querySelector('.palette-group-header')) return;

      const isCollapsed = !!this._collapsed[groupId];

      // Crea l'intestazione cliccabile
      const header = document.createElement('div');
      header.className = 'palette-group-header';
      header.innerHTML = `
        <span class="palette-group-label">${label}</span>
        <span class="palette-group-arrow">${isCollapsed ? '&#9654;' : '&#9660;'}</span>
      `;

      // Inserisce l'header come primo figlio del gruppo
      groupEl.insertBefore(header, groupEl.firstChild);

      // Stato iniziale delle entry
      this._setEntriesVisibility(groupEl, !isCollapsed);

      // Click handler
      header.addEventListener('click', () => {
        const nowCollapsed = !this._collapsed[groupId];
        this._collapsed[groupId] = nowCollapsed;
        this._saveState();

        const arrow = header.querySelector('.palette-group-arrow');
        if (arrow) arrow.innerHTML = nowCollapsed ? '&#9654;' : '&#9660;';

        this._setEntriesVisibility(groupEl, !nowCollapsed);
      });
    });
  }

  _setEntriesVisibility(groupEl, visible) {
    const entries = groupEl.querySelectorAll('.entry');
    entries.forEach(e => {
      e.style.display = visible ? '' : 'none';
    });
  }
}

CollapsiblePalette.$inject = ['eventBus', 'palette'];
