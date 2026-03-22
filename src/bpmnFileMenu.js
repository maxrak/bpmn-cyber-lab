/**
 * BPMN File Menu Manager
 * Carica dinamicamente la lista dei file BPMN disponibili e popola il menu dropdown
 */

import { openBPMN } from './fileHandlers';

/**
 * Inizializza il menu dei file BPMN nella navbar
 * @param {Object} modeler - Istanza del modeler BPMN.js
 */
export function initializeBpmnFileMenu(modeler) {
  // Trova il dropdown menu nella navbar
  const fileDropdown = document.querySelector('#fileDropdown + .dropdown-menu');
  
  if (!fileDropdown) {
    console.warn('File dropdown menu non trovato nella navbar');
    return;
  }

  // Carica la lista dei file BPMN
  fetch('/BPMNs/list.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Impossibile caricare list.json');
      }
      return response.json();
    })
    .then(fileList => {
      // Aggiungi ogni file come voce del menu
      fileList.forEach(fileName => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'dropdown-item';
        button.type = 'button';
        
        // Icona per i file BPMN
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        icon.setAttribute('fill', 'currentColor');
        icon.setAttribute('class', 'bi bi-diagram-3 me-2');
        icon.setAttribute('viewBox', '0 0 16 16');
        icon.innerHTML = '<path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5z"/>';
        
        button.appendChild(icon);
        
        // Nome del file (rimuovi estensione .bpmn per visualizzazione più pulita)
        const displayName = fileName.replace('.bpmn', '');
        button.appendChild(document.createTextNode(displayName));
        
        // Aggiungi tooltip con nome completo
        button.title = fileName;
        
        // Gestisci click per caricare il file
        button.addEventListener('click', () => {
          const fileUrl = `/BPMNs/${fileName}`;
          console.log(`Caricamento file BPMN: ${fileUrl}`);
          
          openBPMN(modeler, fileUrl)
            .then(() => {
              console.log(`✅ File ${fileName} caricato con successo`);
            })
            .catch(err => {
              console.error(`❌ Errore nel caricamento di ${fileName}:`, err);
              alert(`Errore nel caricamento del file ${fileName}`);
            });
        });
        
        li.appendChild(button);
        fileDropdown.appendChild(li);
      });
      
      console.log(`✅ Menu file BPMN inizializzato con ${fileList.length} file`);
    })
    .catch(err => {
      console.error('❌ Errore nel caricamento della lista file BPMN:', err);
      
      // Aggiungi voce di errore nel menu
      const errorLi = document.createElement('li');
      errorLi.innerHTML = '<span class="dropdown-item text-danger">Errore caricamento lista file</span>';
      fileDropdown.appendChild(errorLi);
    });
}
