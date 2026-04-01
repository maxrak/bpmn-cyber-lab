import {
  isSecureBpmnTarget,
  getPrimarySecurityRequirement
} from './secure-bpmn-utils.js';

export default function SecureBpmnPropertiesProvider(propertiesPanel, injector) {
  if (!propertiesPanel || typeof propertiesPanel.registerProvider !== 'function') {
    return;
  }

  this._injector = injector;

  propertiesPanel.registerProvider(500, this);

  this.getGroups = function(element) {
    return function(groups) {
      if (!isSecureBpmnTarget(element)) {
        return groups;
      }

      const current = getPrimarySecurityRequirement(element);

      groups.push({
        id: 'secure-bpmn',
        label: 'SecureBPMN',
        entries: [
          {
            id: 'sb-info',
            component: function SecureBpmnInfoEntry() {
              const div = document.createElement('div');
              div.style.padding = '8px 0';
              div.style.fontSize = '12px';
              div.innerHTML = `
                <strong>SecureBPMN extension</strong><br/>
                Requirement: ${current?.requirementType || '-'}<br/>
                Audit: ${current?.audit || '-'}<br/>
                Protect degree: ${current?.protectDegree || '-'}<br/>
                Privacy type: ${current?.privacyType || '-'}
              `;
              return div;
            },
            isEdited: () => false
          }
        ]
      });

      return groups;
    };
  };
}

SecureBpmnPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];