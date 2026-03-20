import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const processStore = new Map();

function randomId(prefix = 'pi') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bpmn-mock-backend' });
});

app.post('/api/process/start', (req, res) => {
  const id = randomId();
  const processInstance = {
    id,
    definitionKey: req.body.definitionKey || 'order-fulfillment',
    state: 'STARTED',
    variables: req.body.variables || {},
    history: [
      { ts: new Date().toISOString(), event: 'PROCESS_STARTED' }
    ]
  };

  processStore.set(id, processInstance);
  res.json(processInstance);
});

app.get('/api/process/:id', (req, res) => {
  const processInstance = processStore.get(req.params.id);
  if (!processInstance) {
    return res.status(404).json({ error: 'Process instance not found' });
  }
  res.json(processInstance);
});

app.post('/api/payment/check', (req, res) => {
  const { orderId, amount } = req.body;
  const approved = Number(amount || 0) <= 1000;

  res.json({
    service: 'payment',
    orderId,
    approved,
    authorizationCode: approved ? randomId('auth') : null,
    message: approved ? 'Payment approved' : 'Payment rejected by mock policy'
  });
});

app.post('/api/warehouse/reserve', (req, res) => {
  const { orderId, sku, quantity } = req.body;
  res.json({
    service: 'warehouse',
    orderId,
    sku,
    quantity,
    reserved: true,
    reservationId: randomId('resv')
  });
});

app.post('/api/shipping/create', (req, res) => {
  const { orderId, address } = req.body;
  res.json({
    service: 'shipping',
    orderId,
    address,
    shipmentId: randomId('ship'),
    carrier: 'MockExpress',
    estimatedDeliveryDays: 2
  });
});

app.post('/api/process/:id/step/:stepName', (req, res) => {
  const processInstance = processStore.get(req.params.id);
  if (!processInstance) {
    return res.status(404).json({ error: 'Process instance not found' });
  }

  processInstance.history.push({
    ts: new Date().toISOString(),
    event: 'STEP_EXECUTED',
    step: req.params.stepName,
    payload: req.body || {}
  });

  processInstance.state = req.params.stepName.toUpperCase();
  res.json(processInstance);
});

app.listen(port, () => {
  console.log(`Mock backend listening on http://localhost:${port}`);
});
