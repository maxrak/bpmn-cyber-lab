import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';


import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';


//import cyberModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

import cyberModdleDescriptor from './extensions/cyberlab-moddle.json';
import CyberExtensionPropertiesProvider from './cyberExtensionPropertiesProvider';

import CyberPropertiesProvider from './cyberPropertiesProvider';

import RiskColorBehavior from './riskColorBehavior';
import CustomPaletteProvider from './customPaletteProvider';
import CustomContextPadProvider from './customContextPadProvider';
import { setupFileHandlers, loadSampleDiagram } from './fileHandlers';
import { getCurrentBpmn, updateFilenameUI } from './globalBpmnState';
import { initializeBpmnFileMenu } from './bpmnFileMenu';

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
    //CyberPropertiesProvider,
    CyberExtensionPropertiesProvider,
    RiskColorBehavior,
    { __init__: ['customPaletteProvider'], customPaletteProvider: ['type', CustomPaletteProvider] },
    { __init__: ['customContextPadProvider'], customContextPadProvider: ['type', CustomContextPadProvider] }
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor,
    cyber: cyberModdleDescriptor 
  }
});
window._modeler = modeler;

// Helper to get active modeler
window.getActiveModeler = function() {
  return window._modeler;
};

// Carica il BPMN dallo stato globale (o BPMN vuoto di default)
const initialBpmn = getCurrentBpmn();
modeler.importXML(initialBpmn).then(() => {
  try { 
    modeler.get('canvas').zoom('fit-viewport'); 
  } catch (e) { 
    console.warn('zoom failed', e); 
  }
  console.log('✅ Modeler inizializzato con BPMN dallo stato globale');
  
  // Calcola l'altezza minima del container interno in base alla palette
  setTimeout(() => {
    const palette = document.querySelector('.djs-palette');
    const canvasModeler = document.querySelector('#canvas-modeler');
    
    if (palette && canvasModeler) {
      const paletteHeight = palette.offsetHeight;
      const padding = 5000; // margine extra
      const minHeight = paletteHeight + padding;
      
      // Imposta min-height sul #canvas-modeler per permettere lo scroll
      canvasModeler.style.minHeight = `${minHeight}px`;
      console.log(`✅ Canvas min-height impostata: ${minHeight}px (palette: ${paletteHeight}px)`);
    }
  }, 300); // Attende il rendering della palette
}).catch(err => {
  console.error('❌ Errore caricamento BPMN iniziale', err);
});

// Setup navbar menu buttons to trigger toolbar buttons
document.addEventListener('DOMContentLoaded', () => {
  // Wire file handlers (must be after DOM is ready)
  setupFileHandlers(modeler);
  
  // Aggiorna l'indicatore del filename nella navbar
  updateFilenameUI();
  
  // Inizializza il menu dinamico dei file BPMN
  initializeBpmnFileMenu(modeler);
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
