import {
  getPrimarySecurityRequirement,
  getRequirementAbbreviation
} from './secureBPMNutils.js';

const OVERLAY_TYPE = 'sb-security';
const BADGE_W = 22;
const BADGE_H = 18;

export default class SecureBpmnRenderer {
  constructor(eventBus, overlays, elementRegistry) {
    this._overlays = overlays;
    this._elementRegistry = elementRegistry;

    eventBus.on('import.done', () => this._refreshAll());
    eventBus.on('commandStack.changed', () => this._refreshAll());
  }

  _refreshAll() {
    this._elementRegistry.forEach(element => this._updateOverlay(element));
  }

  _updateOverlay(element) {
    // Skip labels — they share businessObject with parent but have text coordinates
    if (!element || element.type === 'label' || !element.businessObject) return;

    // Remove stale badge for this element (no-op if none exists)
    try {
      this._overlays.remove({ element, type: OVERLAY_TYPE });
    } catch (e) { /* none registered yet */ }

    const req = getPrimarySecurityRequirement(element);
    if (!req || !req.requirementType) return;

    const label = getRequirementAbbreviation(req.requirementType, req);
    if (!label) return;

    const badge = document.createElement('div');
    badge.className = 'sb-security-badge';
    badge.setAttribute('title', req.requirementType);
    badge.innerHTML = `<span class="sb-lock">&#128274;</span><span class="sb-label">${label}</span>`;

    this._overlays.add(element, OVERLAY_TYPE, {
      position: this._badgePosition(element),
      html: badge
    });
  }

  /**
   * Position relative to the element's overlay container.
   *
   * The Overlays service anchors the container at:
   *   - Shapes:      (element.x, element.y)  — top-left of the shape
   *   - Connections: (bbox.x, bbox.y)         — top-left of the waypoint bounding box
   *
   * So for connections we offset from that bbox origin to reach the midpoint;
   * for shapes we just sit above the top-left corner.
   */
  _badgePosition(element) {
    const wps = element.waypoints;

    if (wps && wps.length >= 2) {
      // Use first and last waypoint to find the geometric midpoint of the path
      const first = wps[0];
      const last  = wps[wps.length - 1];
      const midX  = (first.x + last.x) / 2;
      const midY  = (first.y + last.y) / 2;

      // bbox origin (same formula as Overlays._updateOverlayContainer)
      const bboxX = Math.min(...wps.map(p => p.x));
      const bboxY = Math.min(...wps.map(p => p.y));

      return {
        left: midX - bboxX - BADGE_W / 2,
        top:  midY - bboxY - BADGE_H / 2
      };
    }

    // Shape: badge just above the top-left corner
    return { top: -BADGE_H - 2, left: 4 };
  }
}

SecureBpmnRenderer.$inject = ['eventBus', 'overlays', 'elementRegistry'];


