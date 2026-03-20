import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { TextFieldEntry, SelectEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;

class CyberPropertiesProvider {
  constructor(propertiesPanel, injector, bpmnFactory, modeling) {
    this._bpmnFactory = bpmnFactory;
    this._modeling = modeling;
    
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {
      if (!isAny(element, [ 'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask' ])) {
        return groups;
      }

      groups.push({
        id: 'cyber',
        label: 'Cybersecurity',
        entries: this._createCyberEntries(element)
      });

      return groups;
    };
  }

  _createCyberEntries(element) {
    const bpmnFactory = this._bpmnFactory;
    const modeling = this._modeling;

    // Helper per ottenere una proprietà camunda
    const getProperty = (name) => {
      const bo = element.businessObject;
      if (!bo.extensionElements) return '';
      
      const properties = bo.extensionElements.values?.find(v => v.$type === 'camunda:Properties');
      if (!properties || !properties.values) return '';
      
      const prop = properties.values.find(p => p.name === name);
      return prop ? prop.value : '';
    };

    // Helper per impostare una proprietà camunda
    const setProperty = (name, value) => {
      const bo = element.businessObject;
      
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = bpmnFactory.create('bpmn:ExtensionElements');
        extensionElements.values = [];
        modeling.updateModdleProperties(element, bo, { extensionElements });
      }

      let properties = extensionElements.values.find(v => v.$type === 'camunda:Properties');
      if (!properties) {
        properties = bpmnFactory.create('camunda:Properties');
        properties.values = [];
        extensionElements.values.push(properties);
      }

      let prop = properties.values.find(p => p.name === name);
      if (!prop) {
        prop = bpmnFactory.create('camunda:Property', { name, value });
        properties.values.push(prop);
      } else {
        prop.value = value;
      }

      modeling.updateModdleProperties(element, bo, {});
    };

    return [
      {
        id: 'cyber-stride',
        element,
        component: TextFieldEntry,
        label: 'STRIDE',
        getValue: () => getProperty('cyber.stride'),
        setValue: (value) => setProperty('cyber.stride', value),
        debounce: isTextFieldEntryEdited
      },
      {
        id: 'cyber-mitre',
        element,
        component: TextFieldEntry,
        label: 'MITRE ATT&CK',
        getValue: () => getProperty('cyber.mitre'),
        setValue: (value) => setProperty('cyber.mitre', value),
        debounce: isTextFieldEntryEdited
      },
      {
        id: 'cyber-risk',
        element,
        component: TextFieldEntry,
        label: 'Risk Score',
        getValue: () => getProperty('cyber.risk'),
        setValue: (value) => setProperty('cyber.risk', value),
        debounce: isTextFieldEntryEdited
      },
      {
        id: 'cyber-audit',
        element,
        component: SelectEntry,
        label: 'Audit Level',
        getValue: () => getProperty('cyber.audit') || 'NONE',
        setValue: (value) => setProperty('cyber.audit', value),
        getOptions: () => [
          { label: 'None', value: 'NONE' },
          { label: 'Basic', value: 'BASIC' },
          { label: 'Detailed', value: 'DETAILED' }
        ]
      },
      {
        id: 'cyber-spof',
        element,
        component: SelectEntry,
        label: 'Single Point of Failure',
        getValue: () => getProperty('cyber.is_spof') || 'false',
        setValue: (value) => setProperty('cyber.is_spof', value),
        getOptions: () => [
          { label: 'No', value: 'false' },
          { label: 'Yes', value: 'true' }
        ]
      }
    ];
  }
}

CyberPropertiesProvider.$inject = [ 'propertiesPanel', 'injector', 'bpmnFactory', 'modeling' ];

export default {
  __init__: [ 'cyberPropertiesProvider' ],
  cyberPropertiesProvider: [ 'type', CyberPropertiesProvider ]
};