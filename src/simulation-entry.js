import BpmnModeler from 'bpmn-js/lib/Modeler';
import TokenSim from 'bpmn-js-token-simulation';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import { setupFileHandlers, loadSampleDiagram } from './fileHandlers';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import './styles.css';
import './styles/properties-panel.css';
import './styles/properties-accordion.css';
import './styles/list-group.css';
import './styles/form-controls.css';

// mark mode
window.appMode = 'simulation';

const simModeler = new BpmnModeler({
  container: '#canvas-sim',
  additionalModules: [ TokenSim ],
  moddleExtensions: { camunda: camundaModdleDescriptor }
});
window._simModeler = simModeler;

// Helper to get active modeler in simulation mode
window.getActiveModeler = function() {
  return window._simModeler;
};

// Simulation log helper functions
let logContainer;

function addLogEntry(message, type = 'info') {
  if (!logContainer) {
    logContainer = document.getElementById('log-container');
  }
  if (!logContainer) return;
  
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  
  const timestamp = new Date().toLocaleTimeString('it-IT', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
  
  entry.innerHTML = `
    <div class="log-timestamp">${timestamp}</div>
    <div class="log-message">${message}</div>
  `;
  
  // Remove placeholder if present
  const placeholder = logContainer.querySelector('.text-muted');
  if (placeholder) {
    placeholder.remove();
  }
  
  logContainer.appendChild(entry);
  
  // Auto-scroll to bottom
  logContainer.scrollTop = logContainer.scrollHeight;
}

function clearLog() {
  if (!logContainer) {
    logContainer = document.getElementById('log-container');
  }
  if (!logContainer) return;
  logContainer.innerHTML = '<div class="text-muted small">In attesa di eventi di simulazione...</div>';
}

// load default sample into simulation modeler
try {
  loadSampleDiagram(simModeler, 'empty');
} catch (e) {
  console.warn('loadSampleDiagram failed in simulation-entry', e);
}

// Setup simulation controls
document.addEventListener('DOMContentLoaded', () => {
  // Wire file handlers to use the sim modeler (must be after DOM is ready)
  try {
    setupFileHandlers(simModeler);
  } catch (e) {
    console.warn('setupFileHandlers failed in simulation-entry', e);
  }

  // Setup navbar menu buttons to trigger toolbar buttons
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

  // Setup clear log button
  const clearLogBtn = document.getElementById('btn-clear-log');
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      clearLog();
      addLogEntry('Log pulito', 'info');
    });
  }

  // Add initial log entry
  addLogEntry('Simulazione pronta. Carica un file BPMN per iniziare.', 'success');
  console.log('📋 Log system initialized');

  // Listen to import success
  simModeler.on('import.done', (event) => {
    console.log('📄 Import done event:', event);
    if (event.error) {
      addLogEntry(`❌ Errore nel caricamento del diagramma: ${event.error.message}`, 'error');
    } else {
      addLogEntry('✅ Diagramma BPMN caricato con successo', 'success');
      addLogEntry('💡 Clicca il canvas per attivare la simulazione, poi usa Play', 'info');
    }
  });

  // Show simulation buttons
  const playBtn = document.getElementById('btn-sim-play');
  const pauseBtn = document.getElementById('btn-sim-pause');
  const stepBtn = document.getElementById('btn-sim-step');
  const resetBtn = document.getElementById('btn-sim-reset');

  console.log('🎮 Simulation buttons:', {
    play: !!playBtn,
    pause: !!pauseBtn,
    step: !!stepBtn,
    reset: !!resetBtn
  });

  // Check if token simulation is available
  try {
    const toggleMode = simModeler.get('toggleMode');
    console.log('🔧 Token simulation available:', !!toggleMode);
  } catch (e) {
    console.warn('⚠️ Token simulation not available:', e.message);
    addLogEntry(`⚠️ Token simulation non disponibile: verifica che il modulo sia caricato`, 'warning');
  }
  
  // Show simulation controls
  if (playBtn) {
    playBtn.style.display = 'inline-block';
    console.log('✅ Play button shown');
  }
  if (pauseBtn) {
    pauseBtn.style.display = 'inline-block';
    console.log('✅ Pause button shown');
  }
  if (stepBtn) {
    stepBtn.style.display = 'inline-block';
    console.log('✅ Step button shown');
  }
  if (resetBtn) {
    resetBtn.style.display = 'inline-block';
    console.log('✅ Reset button shown');
  }

    // Wire up simulation buttons
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        console.log('🎮 Play button clicked!');
        addLogEntry('▶️ Simulazione avviata', 'success');
        startTokenMonitoring();
        try {
          const simMode = simModeler.get('simulationSupport');
          console.log('SimulationSupport service:', simMode);
          if (simMode) {
            const result = simMode.toggleSimulation();
            console.log('toggleSimulation result:', result);
          } else {
            addLogEntry('❌ SimulationSupport non disponibile', 'error');
          }
        } catch (e) {
          console.error('Play failed', e);
          addLogEntry(`❌ Errore nell'avvio: ${e.message}`, 'error');
        }
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        console.log('🎮 Pause button clicked!');
        addLogEntry('⏸️ Simulazione in pausa', 'warning');
        stopTokenMonitoring();
        try {
          const simMode = simModeler.get('simulationSupport');
          if (simMode) {
            simMode.toggleSimulation();
          }
        } catch (e) {
          console.warn('Pause failed', e);
          addLogEntry(`❌ Errore nella pausa: ${e.message}`, 'error');
        }
      });
    }

    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        console.log('🎮 Step button clicked!');
        addLogEntry('⏭️ Eseguito un passo', 'info');
        // Check tokens once after step
        setTimeout(checkTokenChanges, 100);
        try {
          const simMode = simModeler.get('simulationSupport');
          if (simMode && simMode.triggerStep) {
            simMode.triggerStep();
          }
        } catch (e) {
          console.warn('Step failed', e);
          addLogEntry(`❌ Errore nell'esecuzione passo: ${e.message}`, 'error');
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        console.log('🎮 Reset button clicked!');
        addLogEntry('🔄 Simulazione riavviata', 'warning');
        stopTokenMonitoring();
        previousTokenState = {};
        try {
          const simMode = simModeler.get('simulationSupport');
          if (simMode && simMode.resetSimulation) {
            simMode.resetSimulation();
          }
        } catch (e) {
          console.warn('Reset failed', e);
          addLogEntry(`❌ Errore nel reset: ${e.message}`, 'error');
        }
      });
    }

    // Listen to simulation events - use polling instead of events
    const eventBus = simModeler.get('eventBus');
    
    console.log('🔧 EventBus loaded:', !!eventBus);
    
    // Track simulation state
    let previousTokenState = {};
    let isSimulationActive = false;
    let pollInterval = null;
    
    // Function to get current token state
    function getCurrentTokenState() {
      try {
        const simulator = simModeler.get('simulator');
        if (!simulator) return {};
        
        const state = {};
        const elementRegistry = simModeler.get('elementRegistry');
        
        // Get all elements
        elementRegistry.forEach((element) => {
          const scopes = simulator.findScopes(scope => {
            return !scope.destroyed && scope.children.some(c => !c.destroyed && c.element === element);
          });
          
          const tokenCount = scopes.reduce((sum, scope) => {
            return sum + scope.getTokensByElement(element);
          }, 0);
          
          if (tokenCount > 0) {
            state[element.id] = {
              name: element.businessObject.name || element.id,
              count: tokenCount
            };
          }
        });
        
        return state;
      } catch (e) {
        console.error('Error getting token state:', e);
        return {};
      }
    }
    
    // Function to compare states and log changes
    function checkTokenChanges() {
      const currentState = getCurrentTokenState();
      
      // Check for new tokens or increased counts
      Object.keys(currentState).forEach(elementId => {
        const current = currentState[elementId];
        const previous = previousTokenState[elementId];
        
        if (!previous) {
          // New token
          addLogEntry(`🔵 Token aggiunto a <strong>${current.name}</strong>`, 'info');
        } else if (current.count > previous.count) {
          // More tokens
          addLogEntry(`➕ Token aumentati su <strong>${current.name}</strong>: ${current.count}`, 'info');
        } else if (current.count < previous.count) {
          // Fewer tokens
          addLogEntry(`➖ Token diminuiti su <strong>${current.name}</strong>: ${current.count}`, 'info');
        }
      });
      
      // Check for removed tokens
      Object.keys(previousTokenState).forEach(elementId => {
        if (!currentState[elementId]) {
          const previous = previousTokenState[elementId];
          addLogEntry(`⚪ Token rimosso da <strong>${previous.name}</strong>`, 'info');
        }
      });
      
      previousTokenState = currentState;
      
      // Check if simulation is complete (no more tokens)
      if (isSimulationActive && Object.keys(currentState).length === 0 && Object.keys(previousTokenState).length > 0) {
        addLogEntry('🏁 Processo completato - nessun token attivo', 'success');
      }
    }
    
    // Start polling for token changes
    function startTokenMonitoring() {
      if (pollInterval) return;
      isSimulationActive = true;
      addLogEntry('👁️ Monitoraggio token attivato', 'info');
      pollInterval = setInterval(checkTokenChanges, 500); // Check every 500ms
    }
    
    // Stop polling
    function stopTokenMonitoring() {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        isSimulationActive = false;
        addLogEntry('👁️ Monitoraggio token disattivato', 'info');
      }
    }
    
    console.log('✅ Token monitoring setup complete');
  
  // Intercept native notifications by observing DOM changes
  try {
    // Create a MutationObserver to watch for notification elements being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if it's a notification element
            if (node.classList && (node.classList.contains('bts-notification') || 
                                   node.classList.contains('djs-notification'))) {
              // Extract notification type and message
              const message = node.textContent || node.innerText;
              let type = 'info';
              
              if (node.classList.contains('bts-notification-error') || 
                  node.classList.contains('djs-notification-error')) {
                type = 'error';
              } else if (node.classList.contains('bts-notification-warning') || 
                         node.classList.contains('djs-notification-warning')) {
                type = 'warning';
              } else if (node.classList.contains('bts-notification-success') || 
                         node.classList.contains('djs-notification-success')) {
                type = 'success';
              }
              
              console.log('📢 Notification detected:', type, message);
              addLogEntry(message, type);
            }
            
            // Also check children
            const notifications = node.querySelectorAll('.bts-notification, .djs-notification');
            notifications.forEach((notification) => {
              const message = notification.textContent || notification.innerText;
              let type = 'info';
              
              if (notification.classList.contains('bts-notification-error') || 
                  notification.classList.contains('djs-notification-error')) {
                type = 'error';
              } else if (notification.classList.contains('bts-notification-warning') || 
                         notification.classList.contains('djs-notification-warning')) {
                type = 'warning';
              } else if (notification.classList.contains('bts-notification-success') || 
                         notification.classList.contains('djs-notification-success')) {
                type = 'success';
              }
              
              console.log('📢 Notification detected in child:', type, message);
              addLogEntry(message, type);
            });
          }
        });
      });
    });
    
    // Start observing the document body for added notifications
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ Notification observer started');
  } catch (e) {
    console.log('⚠️ Could not setup notification observer:', e.message);
  }
});

console.log('simulation-entry initialized');
