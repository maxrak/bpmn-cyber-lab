const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'BPMNs');
const out = path.join(dir, 'list.json');

try {
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.bpmn'));
  files.sort();
  fs.writeFileSync(out, JSON.stringify(files, null, 2));
  console.log('Wrote', out, 'with', files.length, 'entries');
} catch (err) {
  console.error('Failed to generate BPMN list:', err.message);
  process.exit(1);
}
