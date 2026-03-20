# BPMN Cyber Lab

![BPMN](https://img.shields.io/badge/BPMN-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Un tool per la modellazione di processi BPMN con annotazioni di cybersecurity per l'analisi dei rischi e delle minacce.

## 📋 Descrizione

BPMN Cyber Lab è una piattaforma web integrata per la modellazione e simulazione di processi BPMN con focus sulla cybersecurity. Basato su [bpmn.io](https://bpmn.io), offre un'interfaccia intuitiva divisa in quattro sezioni principali:

- **Home**: Pagina di benvenuto con descrizione della piattaforma e accesso rapido alle funzionalità
- **Modeler**: Editor BPMN avanzato con pannello proprietà personalizzato per annotazioni cyber
- **Simulation**: Simulatore di processi con token flow per visualizzare l'esecuzione dei workflow
- **Documentation**: Guida completa all'utilizzo del Modeler e della Simulation

### Caratteristiche principali

- **Proprietà cyber custom** per task e attività (STRIDE, MITRE ATT&CK)
- **Analisi dei rischi** tramite punteggi e livelli di rischio configurabili
- **Visualizzazione cromatica** automatica basata sui livelli di rischio
- **Simulazione interattiva** del flusso di processo con controlli Play/Pause/Step
- **Import/Export** di file BPMN con caricamento e salvataggio intuitivi
- **Interfaccia responsive** con navbar unificata e layout ottimizzato

## 🚀 Avvio Rapido

### Prerequisiti

- **Node.js** 18+ e npm
- Browser moderno (Chrome, Firefox, Edge, Safari)

### Installazione

```bash
# Clona il repository (se applicabile)
git clone <repository-url>
cd bpmn-cyber-lab

# Installa le dipendenze
npm install
```

### Avvio in modalità sviluppo

```bash
npm start
```

Questo comando:
1. Genera automaticamente la lista dei file BPMN disponibili
2. Avvia il webpack dev server con hot reload
3. Apre automaticamente il browser su `http://localhost:8080`

L'applicazione sarà accessibile con tre pagine principali:
- **Home** (`/index.html`) - Pagina di benvenuto e descrizione della piattaforma
- **Modeler** (`/modeler.html`) - Editor BPMN con annotazioni cybersecurity
- **Simulation** (`/simulation.html`) - Simulatore di processi con token flow

### Build per produzione

```bash
npm run build
```
Navigazione

L'applicazione presenta una navbar unificata presente su tutte le pagine con:
- **Home**: Ritorna alla pagina iniziale con descrizione della piattaforma
- **Modeler**: Accedi all'editor BPMN per creare e modificare diagrammi
- **Simulation**: Accedi al simulatore per eseguire i processi con token flow
- **Menu File** (solo Modeler e Simulation): Carica e salva file BPMN

### Modeler

La pagina **Modeler** offre un ambiente completo per la modellazione BPMN:

#### Toolbar principale
- **Carica BPMN**: Apri file `.bpmn` dal tuo computer
- **Salva BPMN**: Scarica il diagramma corrente come file `.bpmn`
- **Undo/Redo**: Annulla o ripeti le modifiche
- **Zoom +/-**: Ingrandisci o riduci la vista
- **Fit**: Adatta il diagramma alla viewport

#### Pannello Proprietà
Seleziona un elemento nel diagramma per modificarne le proprietà nel pannello laterale, incluse le annotazioni cybersecurity personalizzate.

### Simulation

La pagina **Simulation** permette di visualizzare ed eseguire i processi BPMN:

#### Controlli di simulazione
- **Carica BPMN**: Apri un file da simulare
- **Salva BPMN**: Scarica il diagramma (sola visualizzazione, non modificabile in modalità simulazione)
- **Play**: Avvia l'esecuzione automatica della simulazione
- **Pause**: Metti in pausa la simulazione
- **Step**: Esegui un passo alla volta
- **Reset**: Riavvia la simulazione dall'inizio

La simulazione visualizza i **token** che si muovono attraverso il processo, evidenziando gli elementi attivi.

### Gestione File

#### Aprire un diagramma BPMN

**Metodo 1 - Menu File (navbar)**:
1. Click su **File** → **Apri BPMN**
2. Seleziona un file `.bpmn` dal tuo computer

**Metodo 2 - Toolbar**:
1. Click sul pulsante **Carica BPMN** nella toolbar
2. Seleziona un file `.bpmn` dal tuo computer

#### Salvare un diagramma

**Metodo 1 - Menu File (navbar)**:
1. Click su **File** → **Salva BPMN**
2. Il file verrà scaricato come `diagram.bpmn`

**Metodo 2 - Toolbar**:
1. Click sul pulsante **Salva BPMN** nella toolbar
2. Il file verrà scaricato come `diagram.bpmn`

#### Esportare come immagine

1. Click su **FILE** → **Download SVG**
2. Il diagramma verrà esportato come immagine vettoriale

### Annotazioni Cybersecurity

Seleziona un task nel diagramma per accedere al pannello **Cybersecurity** sulla destra:

#### Proprietà disponibili:

- **cyber.riskScore** (0-100): Punteggio numerico di rischio
- **cyber.riskLevel**: Livello categorico (Low, Medium, High, Critical)
- **cyber.threats**: Minacce identificate (STRIDE)
- **cyber.mitre**: Tecniche MITRE ATT&CK applicabili
- **cyber.controls**: Controlli di sicurezza implementati
- **cybemodeler-entry.js          # Entry point Modeler
│   ├── simulation-entry.js       # Entry point Simulation
│   ├── cyberPropertiesProvider.js # Provider proprietà cyber
│   ├── riskColorBehavior.js      # Logica colorazione rischi
│   ├── fileHandlers.js           # Gestione import/export
│   └── styles/                   # Stili CSS personalizzati
├── public/                       # File statici
│   ├── index.html                # Homepage con descrizione
│   ├── modeler.html              # Pagina Modeler
│   ├── simulation.html           # Pagina Simulation
│   ├── documentation.html        # Documentazione utente
│   ├── vendor/                   # Librerie esterne (Bootstrap)
│   └── BPMNs/                    # Diagrammi di esempio
│       ├── example.bpmn
│       ├── sample-iam-as-is.bpmn
│       ├── sample-empty.bpmn
│       └── list.json             # Lista auto-generata
├── assets/                       # Risorse
│   ├── cheatsheet.txt            # Reference STRIDE/MITRE
│   └── risktemplate.csv          # Template analisi rischi
├── bpmn_demo/                    # Demo pratica con backend mock
├── bpmn_demo_pratica_v2/         # Demo v2 semplificata
└── webpack.config.js             # Configurazione build
### Colorazione automatica

I task vengono colorati automaticamente in base al livello di rischio:
- 🟢 **Low** (0-30): Verde
- 🟡 **Medium** (31-60): Giallo
- 🟠 **High** (61-85): Arancione
- 🔴 **Critical** (86-100): Rosso

## 📁 Struttura del Progetto

```
bpmn-cyber-lab/
├── src/                          # Codice sorgente
│   ├── index.js                  # Entry point principale
│   ├── simulation-entry.js       # Entry point simulazione
│   ├── cyberPropertiesProvider.js # Provider proprietà cyber
│   ├── riskColorBehavior.js      # Logica colorazione rischi
│   ├── fileHandlers.js           # Gestione import/export
│   └── styles/                   # Stili CSS
├── public/                       # File statici
│   ├── index.html                # Pagina principale
│   ├── modeler.html              # Modeler avanzato
│   ├── simulation.html           # Simulazione
│   └── BPMNs/                    # Diagrammi di esempio
│       ├── example.bpmn
│       ├── sample-iam-as-is.bpmn
│       └── list.json             # Lista auto-generata
├── assets/                       # Risorse
│   ├── cheatsheet.txt            # Reference STRIDE/MITRE
│   └── risktemplate.csv          # Template analisi rischi
├── bpmn_demo/                    # Demo pratica con backend mock
└── bpmn_demo_pratica_v2/         # Demo v2 semplificata
```

## 🎓 Demo Pratiche

Il progetto include due demo per scopi didattici sull'architettura BPM.

### Demo Pratica v1 (bpmn_demo)

Demo completa con backend mock che simula un workflow engine.

**Avvio Backend:**
```bash
cd bpmn_demo/backend
npm install
npm start
```
Backend disponibile su `http://localhost:3001`

**Avvio Frontend:**
```bash
cd bpmn_demo/frontend
python3 -m http.server 8080
```Riavvia il dev server se necessario

### Personalizzare le proprietà cyber

Modifica `src/cyberPropertiesProvider.js` per aggiungere nuovi campi o modificare le validazioni del pannello proprietà.

### Modificare i colori dei rischi

Edita `src/riskColorBehavior.js` per personalizzare la logica di colorazione automatica degli elementi in base al livello di rischio.

### Modificare l'interfaccia

- **Navbar**: Modifica direttamente `public/index.html`, `public/modeler.html`, `public/simulation.html`, `public/documentation.html`
- **Stili globali**: Edita `src/styles.css` o i file nella cartella `src/styles/`
- **Layout e margini**: Modifica gli stili inline nelle sezioni `<style>` dei file HTML
Seguire le stesse istruzioni della v1.

Vedere i rispettivi `README.md` nelle cartelle per dettagli.

## 🛠️ Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm start` | Avvia il dev server con hot reload |
| `npm run build` | Build per produzione |
| `npm run generate-list` | Rigenera la lista dei file BPMN |

## 📚 Dipendenze Principali

- **bpmn-js** (17.8.1) - Motore di modellazione BPMN
- **bpmn-js-properties-panel** (5.21.0) - Pannello proprietà
- **bpmn-js-token-simulation** (0.38.2) - Simulazione token
- **camunda-bpmn-moddle** (7.0.1) - Estensioni modello Camunda
- **webpack** (5.97.0) - Bundler

## 🔧 Configurazione

### Aggiungere nuovi diagrammi BPMN

1. Salva i file `.bpmn` nella cartella `public/BPMNs/`
2. Esegui `npm run generate-list` per aggiornare `list.json`
3. I diagrammi appariranno automaticamente nel dropdown di selezione

### Personalizzare le proprietà cyber
 cyber
- **Threat Modeling**: Identificare minacce STRIDE su workflow aziendali
- **Process Simulation**: Visualizzare l'esecuzione di processi complessi con token flow
- **Didattica**: Insegnare BPM, workflow e cybersecurity con esempi pratici interattivi
- **Documentazione**: Produrre diagrammi BPMN annotati con informazioni di sicurezza
- **Analisi IAM**: Valutare rischi nei processi di Identity & Access Management
- **Audit e Compliance**: Documentare controlli di sicurezza sui processi aziendali
Edita `src/riskColorBehavior.js` per personalizzare la logica di colorazione.

## 🎯 Casi d'Uso

- **Security Assessment**: Annotare processi esistenti con analisi dei rischi
- **Threat Modeling**: Identificare minacce STRIDE su workflow
- **Didattica**: Insegnare BPM e cybersecurity con esempi pratici
- **Documentazione**: Produrre diagrammi BPMN con annotazioni di sicurezza
- **Analisi IAM**: Valutare rischi nei processi di Identity & Access Management

## 🐛 Troubleshooting

### Il dev server non si avvia

```bash
# Pulisci caci pulsanti funzionino correttamente:
1. Controlla la console del browser (F12) per errori JavaScript
2. Assicurati che `public/BPMNs/sample-empty.bpmn` esista
3. Rigenera la lista: `npm run generate-list`

### Il caricamento file non funziona in Simulation

Verifica che `window.getActiveModeler()` sia definito. Ricarica la pagina dopo aver salvato le modifiche al codice.

### Layout o margini non corretti

Pulisci la cache del browser (Ctrl+Shift+R o Cmd+Shift+R su Mac) o apri in modalità incognito
Verifica che `public/BPMNs/list.json` esista:
```bash
npm run generate-list
```

### Errori nel browser

Apri la console sviluppatore (F12) e controlla eventuali errori JavaScript.

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT (vedi file LICENSE se presente).

## 👥 Contributi

Feedback e contributi sono benvenuti! Per suggerimenti o segnalazioni, aprire una issue.

## 📞 Supporto

Per domande o assistenza, contattare il maintainer del progetto.

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: Marzo 2026
