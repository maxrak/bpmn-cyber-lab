# Demo pratica: BPMN.io + backend mock

Questa demo serve per la lezione su **Architettura di un motore BPM**. Mostra tre aspetti:

1. **Modeling** con BPMN.io nel browser.
2. **Backend mock** che simula un piccolo workflow engine e tre service task REST.
3. **Scenario eseguibile** di order fulfillment con log degli step.

## Struttura

- `frontend/index.html`: pagina demo con BPMN.io modeler.
- `frontend/sample.bpmn`: processo BPMN di esempio.
- `backend/server.js`: backend mock con API REST.
- `backend/package.json`: dipendenze Node.js.

## Requisiti

- Node.js 18+
- npm

## Avvio

### 1. Avvio backend

```bash
cd backend
npm install
npm start
```

Backend disponibile su `http://localhost:3001`.

### 2. Avvio frontend

Da una seconda shell:

```bash
cd frontend
python3 -m http.server 8080
```

Aprire nel browser:

```text
http://localhost:8080
```

## Scenario mostrato in aula

Il processo esegue i seguenti step:

1. `Order received`
2. `Check payment` (service task REST)
3. Gateway `Approved?`
4. `Prepare order` (simulato come task applicativo)
5. `Create shipment` (service task REST)
6. End event `Completed` oppure `Cancelled`

## Suggerimento didattico

Durante la demo puoi evidenziare:

- differenza tra **process definition** e **process instance**;
- ruolo della **persistenza dello stato** nel backend mock;
- mapping tra **service task** BPMN e **REST endpoint**;
- gestione del gateway tramite dato di business (`approved`);
- punto di ingresso naturale per logging, audit e security assessment.

## Possibili estensioni

- aggiungere timer event e retry;
- introdurre autenticazione API;
- simulare compensazione e gestione errori;
- evidenziare i trust boundary per la lezione di security assessment.
