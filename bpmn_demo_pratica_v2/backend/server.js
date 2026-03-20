const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET = "demo-secret";
let instances = {};
let auditLog = [];

function log(event) {
  auditLog.push({ timestamp: new Date(), event });
}

app.post('/login', (req, res) => {
  const { user } = req.body;
  const token = jwt.sign({ user, role: user === 'admin' ? 'admin' : 'user' }, SECRET);
  res.json({ token });
});

app.post('/start', (req, res) => {
  const id = Date.now().toString();
  instances[id] = { state: 'start' };
  log(`Process ${id} started`);
  res.json({ id });
});

app.post('/task/:id/:action', (req, res) => {
  const { id, action } = req.params;
  if (!instances[id]) return res.status(404).send();

  if (action === 'pay') {
    instances[id].state = 'paid';
    log(`Payment done for ${id}`);
  } else if (action === 'fail') {
    instances[id].state = 'failed';
    log(`Payment failed for ${id}`);
  }
  res.json(instances[id]);
});

app.get('/audit', (req, res) => {
  res.json(auditLog);
});

app.listen(3000, () => console.log("Backend running on 3000"));
