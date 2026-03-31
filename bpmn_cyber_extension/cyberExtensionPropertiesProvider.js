import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import {
  TextFieldEntry,
  SelectEntry,
  CheckboxEntry,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;
const SUPPORTED_TYPES = [ 'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask' ];

class CyberExtensionPropertiesProvider {
  constructor(propertiesPanel, bpmnFactory, moddle, modeling) {
    this._bpmnFactory = bpmnFactory;
    this._moddle = moddle;
    this._modeling = modeling;

    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {
      if (!isAny(element, SUPPORTED_TYPES)) {
        return groups;
      }

      groups.push({
        id: 'cyber-extension',
        label: 'Cyber Extension',
        entries: this._createEntries(element)
      });

      return groups;
    };
  }

  _createEntries(element) {
    return [
      this._textEntry(element, 'cyber-stride', 'STRIDE', 'stride'),
      this._textEntry(element, 'cyber-mitre', 'MITRE ATT&CK', 'mitre'),
      this._textEntry(element, 'cyber-risk-score', 'Risk Score', 'riskScore'),
      this._selectEntry(element, 'cyber-audit-level', 'Audit Level', 'auditLevel', [
        { label: 'None', value: 'NONE' },
        { label: 'Basic', value: 'BASIC' },
        { label: 'Detailed', value: 'DETAILED' }
      ]),
      this._checkboxEntry(
        element,
        'cyber-spof',
        'Single Point of Failure',
        'singlePointOfFailure'
      )
    ];
  }

  _textEntry(element, id, label, propertyName) {
    return {
      id,
      element,
      component: TextFieldEntry,
      label,
      getValue: () => this._getAssessmentProperty(element, propertyName),
      setValue: (value) => this._setAssessmentProperty(element, propertyName, value),
      debounce: isTextFieldEntryEdited
    };
  }

  _selectEntry(element, id, label, propertyName, options) {
    return {
      id,
      element,
      component: SelectEntry,
      label,
      getValue: () => this._getAssessmentProperty(element, propertyName) || options[0].value,
      setValue: (value) => this._setAssessmentProperty(element, propertyName, value),
      getOptions: () => options
    };
  }

  _checkboxEntry(element, id, label, propertyName) {
    return {
      id,
      element,
      component: CheckboxEntry,
      label,
      getValue: () => Boolean(this._getAssessmentProperty(element, propertyName)),
      setValue: (value) => this._setAssessmentProperty(element, propertyName, value)
    };
  }

  _getExtensionElements(businessObject) {
    return businessObject.get('extensionElements');
  }

  _getAssessment(element) {
    const businessObject = element.businessObject;
    const extensionElements = this._getExtensionElements(businessObject);
    const values = extensionElements?.get('values') || [];

    return values.find((value) => value.$type === 'cyber:TaskAssessment') || null;
  }

  _getAssessmentProperty(element, propertyName) {
    const assessment = this._getAssessment(element);

    if (!assessment) {
      return propertyName === 'singlePointOfFailure' ? false : '';
    }

    const value = assessment.get(propertyName);

    if (value === undefined || value === null) {
      return propertyName === 'singlePointOfFailure' ? false : '';
    }

    return value;
  }

  _ensureAssessment(element) {
    const businessObject = element.businessObject;
    let extensionElements = this._getExtensionElements(businessObject);

    if (!extensionElements) {
      extensionElements = this._bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      this._modeling.updateModdleProperties(element, businessObject, {
        extensionElements
      });
    }

    let assessment = this._getAssessment(element);

    if (!assessment) {
      assessment = this._moddle.create('cyber:TaskAssessment', {
        auditLevel: 'NONE',
        singlePointOfFailure: false
      });

      const values = [ ...extensionElements.get('values'), assessment ];

      this._modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }

    return assessment;
  }

  _setAssessmentProperty(element, propertyName, value) {
    const assessment = this._ensureAssessment(element);

    this._modeling.updateModdleProperties(element, assessment, {
      [propertyName]: propertyName === 'riskScore' && value !== '' ? Number(value) : value
    });
  }
}

CyberExtensionPropertiesProvider.$inject = [
  'propertiesPanel',
  'bpmnFactory',
  'moddle',
  'modeling'
];

export default {
  __init__: [ 'cyberExtensionPropertiesProvider' ],
  cyberExtensionPropertiesProvider: [ 'type', CyberExtensionPropertiesProvider ]
};
