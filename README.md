# BPMN Cyber Lab

![BPMN](https://img.shields.io/badge/BPMN-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18+-brightgreen)

Piattaforma web educativa per la modellazione e simulazione di processi BPMN 2.0, con focus su cybersecurity, analisi dei rischi e anti-pattern di modellazione.

---

## 📋 Descrizione

BPMN Cyber Lab è costruito su [bpmn.io](https://bpmn.io) e offre tre ambienti principali integrati da una navbar unificata:

| Pagina | URL | Descrizione |
|--------|-----|-------------|
| **Home** | `/index.html` | Presentazione della piattaforma e accesso rapido |
| **Modeler** | `/modeler.html` | Editor BPMN con pannello proprietà cybersecurity |
| **Simulation** | `/simulation.html` | Simulatore token flow |
| **Documentation** | `/documentation.html` | Guida completa ed esempi interattivi |

---

## 🚀 Avvio Rapido

### Prerequisiti

- **Node.js** 18+ e npm
- Browser moderno (Chrome, Firefox, Edge, Safari)

### Installazione e avvio

```bash
npm install
npm start
```

Il dev server si avvia su `http://localhost:8080` con hot reload attivo.

### Build per produzione

```bash
npm run build
```

### Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm start` | Dev server con hot reload |
| `npm run build` | Build ottimizzata per produzione |
| `npm run generate-list` | Rigenera `public/BPMNs/list.json` |

---

## 🛠️ Funzionalità

### Modeler

Editor BPMN visuale con:
- **Toolbar**: Carica / Salva BPMN, Undo/Redo, Zoom, Fit to view
- **Menu File** (navbar): accesso rapido ai diagrammi salvati in `public/BPMNs/`
- **Pannello proprietà cybersecurity** (laterale destro) per annotare ogni task con:
  - `cyber.riskScore` (0–100) — punteggio numerico di rischio
  - `cyber.riskLevel` — Low / Medium / High / Critical
  - `cyber.threats` — minacce STRIDE identificate
  - `cyber.mitre` — tecniche MITRE ATT&CK applicabili
  - `cyber.controls` — controlli di sicurezza implementati
- **Colorazione automatica** degli elementi in base al livello di rischio:
  - 🟢 Low (0–30) · 🟡 Medium (31–60) · 🟠 High (61–85) · 🔴 Critical (86–100)

### Simulation

Simulatore interattivo basato su **bpmn-js-token-simulation**:
- **Controlli**: Play / Pause / Step / Reset
- Token visibili che scorrono attraverso il processo in tempo reale
- Utile per verificare il comportamento dei processi prima del deployment

### Documentation

Sezione documentazione completa con pagine dedicate per ogni esempio:

#### Guide operative
- ✏️ Come usare il Modeler
- ▶️ Come usare la Simulation

#### Esempi BPMN
- 🔀 Gateway Comparison — AND vs XOR vs Event-Based
- ✉️ Message Events — comunicazione punto-a-punto
- 📡 Signal Events — broadcast tra processi
- 🔗 Signal Events Multipli — gestione di segnali concorrenti
- ⚠️ Error Events — gestione errori ed eccezioni

#### Anti-Pattern di modellazione
| Pagina | BPMN associato | Problema illustrato |
|--------|---------------|---------------------|
| 🚫 Anti-Pattern Start/End | `anti-pattern-start-end.bpmn` | Start multipli ambigui, processi senza End Event |
| ❌ Anti-Pattern Gateway | `anti-pattern-gateway.bpmn` | AND vs XOR: uso del tipo sbagliato |
| 📨 Anti-Pattern Message Events | `anti-pattern-message-events-example.bpmn` | Boundary event fuori tempo → token appeso |
| 🔁 Anti-Pattern Loop | `anti-pattern-loop.bpmn` | Loop senza condizione di uscita → ciclo infinito |

---

## 📁 Struttura del Progetto

```
bpmn-cyber-lab/
├── src/                              # Codice sorgente compilato da webpack
│   ├── index.js                      # Entry point Modeler
│   ├── simulation-entry.js           # Entry point Simulation
│   ├── cyberPropertiesProvider.js    # Pannello proprietà cybersecurity
│   ├── riskColorBehavior.js          # Colorazione automatica per livello rischio
│   ├── fileHandlers.js               # Import/Export file BPMN
│   ├── simulation.js                 # Logica simulazione
│   └── styles/                       # CSS modulari
│       ├── properties-panel.css
│       ├── properties-accordion.css
│       ├── form-controls.css
│       └── list-group.css
├── public/                           # File statici serviti direttamente
│   ├── index.html                    # Homepage
│   ├── modeler.html                  # Pagina Modeler
│   ├── simulation.html               # Pagina Simulation
│   ├── documentation.html            # Indice documentazione
│   ├── documentation-modeler.html
│   ├── documentation-simulation.html
│   ├── documentation-gateway-comparison.html
│   ├── documentation-message-events.html
│   ├── documentation-signal-events.html
│   ├── documentation-multiple-signals.html
│   ├── documentation-error-events.html
│   ├── documentation-anti-pattern-start-end.html
│   ├── documentation-anti-pattern-gateway.html
│   ├── documentation-anti-pattern-message-events.html
│   ├── documentation-anti-pattern-loop.html
│   ├── bpmn-cyber-lab.png            # Logo applicazione
│   ├── favicon.png                   # Favicon
│   ├── vendor/                       # Bootstrap (bundle locale)
│   └── BPMNs/                        # Diagrammi di esempio
│       ├── gateway-comparison.bpmn
│       ├── message-events-example.bpmn
│       ├── message-events-example-correct.bpmn
│       ├── signal-events-example.bpmn
│       ├── multiple-signals-example.bpmn
│       ├── error-events-example.bpmn
│       ├── anti-pattern-start-end.bpmn
│       ├── anti-pattern-gateway.bpmn
│       ├── anti-pattern-message-events-example.bpmn
│       ├── anti-pattern-loop.bpmn
│       ├── iam_lifecycle_as_is_modeled.bpmn
│       ├── iam_lifecycle_risk_annotated.bpmn
│       ├── sample-iam-as-is.bpmn
│       ├── sample-empty.bpmn
│       └── list.json                 # Lista auto-generata (non editare a mano)
├── assets/
│   ├── cheatsheet.txt                # Reference STRIDE / MITRE ATT&CK
│   └── risktemplate.csv             # Template analisi rischi
├── scripts/
│   └── generate-bpmn-list.js        # Genera list.json
├── parser/                           # CLI Parser BPMN -> GitHub Actions
│   ├── bpmn2github.js                # Modulo core di parsing e mapping regole
│   ├── index.js                      # Entry point riga di comando
│   └── output/                       # File .yml generati automaticamente
├── bpmn_demo/                        # Demo didattica v1 con backend mock
├── bpmn_demo_pratica_v2/             # Demo didattica v2 semplificata
├── webpack.config.js
└── package.json
```
## 📚 Dipendenze Principali

| Libreria | Versione | Scopo |
|----------|----------|-------|
| bpmn-js | 17.8.1 | Motore di modellazione BPMN |
| bpmn-js-properties-panel | 5.21.0 | Pannello proprietà |
| bpmn-js-token-simulation | 0.38.2 | Simulazione token flow |
| camunda-bpmn-moddle | 7.0.1 | Estensioni modello Camunda |
| webpack | 5.97.0 | Bundler |
| Bootstrap | 5.x | UI framework |

---

## 📄 Licenza

Distribuito sotto licenza MIT.

---

**Versione**: 1.1.0  
**Ultimo aggiornamento**: Marzo 2026