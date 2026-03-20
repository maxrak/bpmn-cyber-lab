import BpmnModeler from 'bpmn-js/lib/Modeler';

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
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import './styles.css';

import './styles/properties-panel.css';
import './styles/properties-accordion.css';
import './styles/list-group.css';
import './styles/form-controls.css';

// mark mode
window.appMode = 'modeler';

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

// Helper to get active modeler
window.getActiveModeler = function() {
  return window._modeler;
};

// Load initial sample diagram
loadSampleDiagram(modeler, 'empty');

// Setup navbar menu buttons to trigger toolbar buttons
document.addEventListener('DOMContentLoaded', () => {
  // Wire file handlers (must be after DOM is ready)
  setupFileHandlers(modeler);

  const navOpenBtn = document.getElementById('nav-btn-open');
  const navSaveBtn = document.getElementById('nav-btn-save');
  const toolbarOpenBtn = document.getElementById('btn-open');
  const toolbarSaveBtn = document.getElementById('btn-save');

  // Wire navbar buttons to toolbar buttons
  if (navOpenBtn && toolbarOpenBtn) {
    navOpenBtn.addEventListener('click', () => toolbarOpenBtn.click());
  }

  if (navSaveBtn && toolbarSaveBtn) {
    navSaveBtn.addEventListener('click', () => toolbarSaveBtn.click());
  }
});

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
  try { 
    const m = window.getActiveModeler(); 
    if (m) m.get('commandStack').undo(); 
  } catch (e) { 
    console.warn('Undo failed', e); 
  }
});

if (redoBtn) redoBtn.addEventListener('click', () => {
  try { 
    const m = window.getActiveModeler(); 
    if (m) m.get('commandStack').redo(); 
  } catch (e) { 
    console.warn('Redo failed', e); 
  }
});

if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(0.1));
if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(-0.1));

if (fitBtn) fitBtn.addEventListener('click', () => {
  try {
    const canvas = modeler.get('canvas');
    canvas.zoom('fit-viewport');
    currentZoom = 1.0;
  } catch (e) { 
    console.warn('Fit viewport failed', e); 
  }
});

console.log('modeler-entry initialized');
