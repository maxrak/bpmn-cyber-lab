import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

const LOW_PRIORITY = 500;

export default {
  __init__: [ 'cyberPropertiesProvider' ],
  cyberPropertiesProvider: [ 'type', function(propertiesPanel, bpmnFactory, elementRegistry, translate) {

    this.getGroups = function(element) {
      return function(groups) {

        if (!isAny(element, [ 'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask' ])) {
          return groups;
        }

        const cyberGroup = {
          id: 'cyber',
          label: 'Cybersecurity',
          entries: []
        };

        function getOrCreateCamundaProperties() {
          const bo = element.businessObject;
          let extensionElements = bo.extensionElements;

          if (!extensionElements) {
            extensionElements = bpmnFactory.create('bpmn:ExtensionElements');
            extensionElements.values = [];
            bo.extensionElements = extensionElements;
          }

          let properties = extensionElements.values.find(v => v.$type === 'camunda:Properties');

          if (!properties) {
            properties = bpmnFactory.create('camunda:Properties');
            extensionElements.values.push(properties);
          }

          return properties;
        }

        function getProperty(name) {
          const props = getOrCreateCamundaProperties();
          const prop = props.values.find(p => p.name === name);
          return prop ? prop.value : '';
        }

        function setProperty(name, value) {
          const props = getOrCreateCamundaProperties();
          let prop = props.values.find(p => p.name === name);

          if (!prop) {
            prop = bpmnFactory.create('camunda:Property', { name, value });
            props.values.push(prop);
          } else {
            prop.value = value;
          }
        }

        function textField(id, label, propertyName) {
          return {
            id,
            label,
            modelProperty: propertyName,
            get: function() {
              const value = getProperty(propertyName);
              return { [propertyName]: value };
            },
            set: function(element, values) {
              setProperty(propertyName, values[propertyName] || '');
              return element;
            }
          };
        }

        function selectField(id, label, propertyName, options) {
          return {
            id,
            label,
            modelProperty: propertyName,
            selectOptions: options.map(o => ({ name: o.label, value: o.value })),
            get: function() {
              const value = getProperty(propertyName);
              return { [propertyName]: value || options[0].value };
            },
            set: function(element, values) {
              setProperty(propertyName, values[propertyName]);
              return element;
            }
          };
        }

        cyberGroup.entries.push(
          textField('cyber-stride', 'STRIDE (es. S,T,E)', 'cyber.stride'),
          textField('cyber-mitre', 'MITRE (es. T1078,T1552)', 'cyber.mitre'),
          textField('cyber-risk', 'Risk Score (P×I)', 'cyber.risk'),
          selectField('cyber-audit', 'Audit level', 'cyber.audit', [
            { label: 'None', value: 'NONE' },
            { label: 'Basic', value: 'BASIC' },
            { label: 'Detailed', value: 'DETAILED' }
          ]),
          selectField('cyber-spof', 'Single Point of Failure', 'cyber.is_spof', [
            { label: 'No', value: 'false' },
            { label: 'Yes', value: 'true' }
          ])
        );

        groups.push(cyberGroup);

        return groups;
      };
    };

    propertiesPanel.registerProvider(LOW_PRIORITY, this);

  }]
};