import SecureBpmnPropertiesProvider from './SecureBpmnPropertiesProvider.js';
import SecureBpmnRenderer from './SecureBPMNrenderer.js';

export default {
  __init__: [
    'secureBpmnPropertiesProvider',
    'secureBpmnRenderer'
  ],
  secureBpmnPropertiesProvider: [ 'type', SecureBpmnPropertiesProvider ],
  secureBpmnRenderer: [ 'type', SecureBpmnRenderer ]
};