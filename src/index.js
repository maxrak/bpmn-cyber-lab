import BpmnModeler from 'bpmn-js/lib/Modeler';
import * as ModelUtil from 'bpmn-js/lib/util/ModelUtil';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

import CyberPropertiesProvider from './cyberPropertiesProvider';
import RiskColorBehavior from './riskColorBehavior';
import { setupFileHandlers, loadSampleDiagram } from './fileHandlers';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import './styles.css';

import './styles/properties-panel.css';
import './styles/properties-accordion.css';
import './styles/list-group.css';
import './styles/form-controls.css';

const modeler = new BpmnModeler({
  container: '#canvas-modeler',
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    CyberPropertiesProvider,
    RiskColorBehavior
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});
window._modeler = modeler;

window.getActiveModeler = function() {
  if (window.appMode === 'simulation' && window._simModeler) return window._simModeler;
  return window._modeler;
};

// Monkey-patch ModelUtil.getBusinessObject to ensure returned businessObject
// exposes a `get` function (some moddle-like objects may be plain objects
// when parsed differently). This prevents properties panel code from
// throwing "businessObject.get is not a function".
try {
  const originalGetBusinessObject = ModelUtil.getBusinessObject;
  ModelUtil.getBusinessObject = function(element) {
    const bo = originalGetBusinessObject(element);
    if (bo && typeof bo.get !== 'function') {
      return new Proxy(bo, {
        get(target, prop) {
          if (prop === 'get') return function(name) { return target[name]; };
          return target[prop];
        }
      });
    }
    return bo;
  };
} catch (e) {
  // do not break startup if ModelUtil is unavailable
  console.warn('Could not patch ModelUtil.getBusinessObject', e);
}

setupFileHandlers(modeler);
loadSampleDiagram(modeler, 'empty');

// Mini toolbar handlers (undo/redo/zoom/fit)
let currentZoom = 1.0;

function setZoom(delta) {
  currentZoom = Math.max(0.2, Math.min(2, currentZoom + delta));
  try {
    const m = window.getActiveModeler();
    if (m) m.get('canvas').zoom(currentZoom);
  } catch (err) {
    console.warn('Zoom not available yet', err);
  }
}

const undoBtn = document.getElementById('btn-undo');
const redoBtn = document.getElementById('btn-redo');
const zoomInBtn = document.getElementById('btn-zoom-in');
const zoomOutBtn = document.getElementById('btn-zoom-out');
const fitBtn = document.getElementById('btn-fit');

if (undoBtn) undoBtn.addEventListener('click', () => {
  try { const m = window.getActiveModeler(); if (m) m.get('commandStack').undo(); } catch (e) { console.warn(e); }
});
if (redoBtn) redoBtn.addEventListener('click', () => {
  try { const m = window.getActiveModeler(); if (m) m.get('commandStack').redo(); } catch (e) { console.warn(e); }
});
if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(0.1));
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(-0.1));
if (fitBtn) fitBtn.addEventListener('click', () => {
  try {
    const canvas = modeler.get('canvas');
    canvas.zoom('fit-viewport');
    currentZoom = 1.0;
  } catch (e) { console.warn(e); }
});

// App mode selector (Modeler / Simulation)
function setAppMode(mode) {
  window.appMode = mode;
  console.log('App mode set to', mode);
  const modelerEl = document.getElementById('canvas-modeler');
  const simEl = document.getElementById('canvas-sim');
  if (mode === 'simulation') {
    if (modelerEl) modelerEl.style.display = 'none';
    if (simEl) simEl.style.display = 'block';
  } else {
    if (modelerEl) modelerEl.style.display = 'block';
    if (simEl) simEl.style.display = 'none';
  }
  // set data attribute on visible canvas container for styling/inspection
  const visible = (mode === 'simulation') ? simEl : modelerEl;
  if (visible) visible.setAttribute('data-app-mode', mode);
}

// update the small badge in the toolbar to reflect current mode
function updateModeBadge(mode) {
  const badge = document.getElementById('app-mode-badge');
  if (!badge) return;
  const label = mode.charAt(0).toUpperCase() + mode.slice(1);
  badge.textContent = label;
  // color: modeler -> primary, simulation -> success
  badge.classList.remove('bg-primary', 'bg-success', 'bg-secondary');
  if (mode === 'simulation') badge.classList.add('bg-success');
  else if (mode === 'modeler') badge.classList.add('bg-primary');
  else badge.classList.add('bg-secondary');
}

const modeModeler = document.getElementById('mode-modeler');
const modeSimulation = document.getElementById('mode-simulation');

if (modeModeler || modeSimulation) {
  const initial = (modeModeler && modeModeler.checked) ? modeModeler.value : ((modeSimulation && modeSimulation.checked) ? modeSimulation.value : 'modeler');
  setAppMode(initial);
  updateModeBadge(initial);
  [modeModeler, modeSimulation].forEach(el => {
    if (!el) return;
    el.addEventListener('change', (e) => {
      if (e.target.checked) {
        setAppMode(e.target.value);
        updateModeBadge(e.target.value);
      }
    });
  });
}