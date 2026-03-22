import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import { saveCurrentBpmn } from './globalBpmnState';

// sample BPMN files are served from `public/`; load them at runtime via fetch

export function loadSampleDiagram(modeler, which) {
  // map logical names to files in public/
  const map = {
    'empty': '/BPMNs/sample-empty.bpmn',
    'as-is': '/BPMNs/sample-iam-as-is.bpmn',
    'annotated': '/BPMNs/sample-iam-annotated.bpmn'
  };
  const url = map[which] || map['empty'];
  return openBPMN(modeler, url);
}

export function openBPMN(modeler, url) {
  return fetch(url).then(resp => {
    if (!resp.ok) throw new Error('Network response not ok: ' + resp.status);
    return resp.text();
  }).then(xml => {
    // detect if server returned an HTML page (SPA fallback) instead of BPMN XML
    const low = xml.toLowerCase();
    if (low.indexOf('</head>') !== -1 || low.indexOf('<!doctype html') !== -1 || low.indexOf('<html') !== -1) {
      console.error('Fetched resource is HTML, not BPMN XML', url);
      throw new Error('Fetched resource appears to be HTML, check the URL: ' + url);
    }
    const prepared = ensureBpmnDiagram(xml);
    console.log('Importing BPMN file', url, 'size:', prepared.length);
    
    // Salva il BPMN nello stato globale per condividerlo tra modeler e simulation
    const fileName = url.split('/').pop();
    saveCurrentBpmn(prepared, fileName);

    // If the app is in simulation mode, try to load bpmn-js-token-simulation.
    if (typeof window !== 'undefined' && window.appMode === 'simulation') {
      console.log('Opening BPMN in Simulation mode');
      // dynamic import of token simulation and modeler
      return Promise.all([
        import('bpmn-js/lib/Modeler'),
        import('bpmn-js-token-simulation')
      ]).then(([BpmnModelerModule, TokenSimModule]) => {
        const BpmnModelerCtor = BpmnModelerModule.default || BpmnModelerModule;
        const TokenSim = TokenSimModule.default || TokenSimModule;

        // destroy previous simulation modeler if exists
        if (window._simModeler && typeof window._simModeler.destroy === 'function') {
          try { window._simModeler.destroy(); } catch (e) { console.warn('Error destroying previous sim modeler', e); }
        }

        // instantiate a modeler with token simulation module as additional module
        const simModeler = new BpmnModelerCtor({
          container: '#canvas-sim',
          additionalModules: [ TokenSim ],
          moddleExtensions: { camunda: camundaModdleDescriptor }
        });
        window._simModeler = simModeler;

        return simModeler.importXML(prepared).then(() => {
          try { simModeler.get('canvas').zoom('fit-viewport'); } catch (e) { console.warn('zoom failed', e); }
          console.log('Simulation import succeeded', url);
          // ensure sim canvas is visible
          const modelerEl = document.getElementById('canvas-modeler');
          const simEl = document.getElementById('canvas-sim');
          if (modelerEl) modelerEl.style.display = 'none';
          if (simEl) simEl.style.display = 'block';
        });
      }).catch(err => {
        console.error('Simulation load failed, falling back to modeler', err);
        const fallback = modeler || (typeof window !== 'undefined' && window.getActiveModeler ? window.getActiveModeler() : null);
        if (!fallback) {
          console.error('No modeler available for fallback import');
          throw err;
        }
        return fallback.importXML(prepared).then(() => {
          try { fallback.get('canvas').zoom('fit-viewport'); } catch (e) { console.warn('zoom failed', e); }
          console.log('Import succeeded (fallback)', url);
        });
      });
    }

    // default: open with supplied modeler or active modeler
    const target = modeler || (typeof window !== 'undefined' && window.getActiveModeler ? window.getActiveModeler() : null);
    if (!target) {
      console.error('No modeler instance available to open BPMN');
      return Promise.reject(new Error('No modeler available'));
    }
    return target.importXML(prepared).then(() => {
      try { target.get('canvas').zoom('fit-viewport'); } catch (e) { console.warn('zoom failed', e); }
      console.log('Import succeeded', url);
    });
  }).catch(err => console.error('Error importing BPMN', url, err));
}

function ensureBpmnDiagram(xml) {
  if (/bpmndi:BPMNDiagram/.test(xml) || /<bpmndi:BPMNPlane/.test(xml)) {
    return xml;
  }

  // try to extract process id
  const procMatch = xml.match(/<bpmn:process[^>]*id="([^"]+)"/);
  const processId = procMatch ? procMatch[1] : null;

  // extract first element id inside process (startEvent, task, userTask, serviceTask, endEvent)
  let firstElementId = null;
  if (processId) {
    const procBlockMatch = xml.match(new RegExp(`<bpmn:process[^>]*id="${processId}"[\s\S]*?<\/bpmn:process>`));
    const procBlock = procBlockMatch ? procBlockMatch[0] : null;
    if (procBlock) {
      const elMatch = procBlock.match(/id="([^"]+)"/);
      if (elMatch) firstElementId = elMatch[1];
    }
  }

  const diagramId = 'BPMNDiagram_1';
  const planeId = 'BPMNPlane_1';
  const shapeId = (firstElementId || 'StartEvent_1') + '_di';

  const diagram = `\n  <bpmndi:BPMNDiagram id="${diagramId}">\n    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="${processId || ''}">\n      <bpmndi:BPMNShape id="${shapeId}" bpmnElement="${firstElementId || ''}">\n        <dc:Bounds x="152" y="102" width="36" height="36" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n`;

  return xml.replace(/<\/bpmn:definitions>\s*$/,'') + diagram + '</bpmn:definitions>';
}

export function setupFileHandlers(modeler) {
  const openBtn = document.getElementById('btn-open');
  const saveBtn = document.getElementById('btn-save');
  const fileInput = document.getElementById('file-input');
  const examplesMenu = document.getElementById('bpmns-menu');

  openBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      const xml = ev.target.result;
      const prepared = ensureBpmnDiagram(xml);
      console.log('Importing BPMN file, size:', prepared.length);
      
      // Salva il BPMN nello stato globale
      saveCurrentBpmn(prepared, file.name);
      
      const target = (typeof window !== 'undefined' && window.getActiveModeler) ? window.getActiveModeler() : modeler;
      if (!target) {
        console.error('No modeler instance available to import file');
        return;
      }
      target.importXML(prepared).then(() => {
        try { target.get('canvas').zoom('fit-viewport'); } catch (e) { console.warn('zoom failed', e); }
        console.log('Import succeeded');
      }).catch(err => {
        console.error('Error importing file', err);
      });
    };
    reader.readAsText(file);
  });

  saveBtn.addEventListener('click', () => {
    const target = (typeof window !== 'undefined' && window.getActiveModeler) ? window.getActiveModeler() : modeler;
    if (!target) {
      console.error('No modeler instance available to save');
      return;
    }
    target.saveXML({ format: true }).then(({ xml }) => {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }).catch(err => console.error('Error saving BPMN', err));
  });

  // helper to populate the BPMNs menu
  function populateBpmns() {
    fetch('/BPMNs/list.json').then(r => r.json()).then(list => {
      examplesMenu.innerHTML = '';
      list.forEach(name => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dropdown-item';
        btn.textContent = name.replace(/\.bpmn$/i, '');
        btn.addEventListener('click', () => openBPMN(null, `/BPMNs/${name}`));
        li.appendChild(btn);
        examplesMenu.appendChild(li);
      });

      // divider + refresh
      const divider = document.createElement('li');
      divider.innerHTML = '<hr class="dropdown-divider">';
      examplesMenu.appendChild(divider);

      const refreshLi = document.createElement('li');
      const refreshBtn = document.createElement('button');
      refreshBtn.type = 'button';
      refreshBtn.className = 'dropdown-item';
      refreshBtn.id = 'bpmns-refresh';
      refreshBtn.textContent = 'Refresh';
      refreshBtn.addEventListener('click', () => {
        // re-fetch the list.json and repopulate
        populateBpmns();
      });
      refreshLi.appendChild(refreshBtn);
      examplesMenu.appendChild(refreshLi);

    }).catch(err => {
      console.error('Failed to load BPMNs list', err);
      examplesMenu.innerHTML = '<li class="dropdown-item text-danger small px-3">Failed to load</li>';
    });
  }

  if (examplesMenu) {
    populateBpmns();
  }
}