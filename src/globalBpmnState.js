/**
 * Global BPMN State Manager
 * Condivide lo stato del BPMN corrente tra modeler e simulation usando localStorage
 */

const STORAGE_KEY = 'bpmnCyberLab_currentBpmn';
const FILENAME_KEY = 'bpmnCyberLab_fileName';

// BPMN vuoto di default
const EMPTY_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="Definitions_1" 
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/**
 * Salva il BPMN corrente nello storage del browser
 * @param {string} xml - Il contenuto XML del BPMN
 * @param {string} fileName - Nome del file (opzionale)
 */
/**
 * Aggiorna l'elemento UI che mostra il nome del file corrente nella navbar
 */
export function updateFilenameUI() {
  if (typeof document !== 'undefined') {
    const filenameElement = document.getElementById('current-filename');
    if (filenameElement) {
      const fileName = getCurrentFileName();
      filenameElement.textContent = fileName || 'Nessun file';
    }
  }
}

export function saveCurrentBpmn(xml, fileName = null) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, xml);
      if (fileName) {
        localStorage.setItem(FILENAME_KEY, fileName);
      }
      console.log('📦 BPMN salvato in localStorage', { 
        fileName, 
        size: xml ? xml.length : 0 
      });
      // Aggiorna l'UI con il nuovo nome file
      updateFilenameUI();
    }
  } catch (e) {
    console.error('Errore salvataggio BPMN in localStorage', e);
  }
}

/**
 * Recupera il BPMN corrente dallo storage del browser
 * @returns {string} Il contenuto XML del BPMN o un BPMN vuoto di default
 */
export function getCurrentBpmn() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('📦 BPMN recuperato da localStorage', {
          fileName: localStorage.getItem(FILENAME_KEY),
          size: stored.length
        });
        return stored;
      }
    }
  } catch (e) {
    console.error('Errore recupero BPMN da localStorage', e);
  }
  console.log('📦 Nessun BPMN salvato, ritorno BPMN vuoto di default');
  return EMPTY_BPMN;
}

/**
 * Recupera il nome del file corrente
 * @returns {string|null} Il nome del file o null
 */
export function getCurrentFileName() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(FILENAME_KEY);
    }
  } catch (e) {
    console.error('Errore recupero filename da localStorage', e);
  }
  return null;
}

/**
 * Pulisce lo stato globale
 */
export function clearCurrentBpmn() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FILENAME_KEY);
      console.log('📦 Stato globale BPMN pulito da localStorage');
    }
  } catch (e) {
    console.error('Errore pulizia localStorage', e);
  }
}

/**
 * Ottiene il BPMN vuoto di default
 * @returns {string} BPMN vuoto
 */
export function getEmptyBpmn() {
  return EMPTY_BPMN;
}
