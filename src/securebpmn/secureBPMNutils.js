const SECURE_REQ_TYPE = 'sb:SecurityRequirement';
const SECURE_ROLE_TYPE = 'sb:SecurityRole';
const SECURE_PERMISSION_TYPE = 'sb:SecurityPermission';

export const REQUIREMENT_TYPES = {
  NON_REPUDIATION: 'NonRepudiation',
  ATTACK_HARM_DETECTION: 'AttackHarmDetection',
  INTEGRITY: 'Integrity',
  PRIVACY: 'Privacy',
  ACCESS_CONTROL: 'AccessControl'
};

export const PRIVACY_TYPES = {
  ANONYMITY: 'anonymity',
  CONFIDENTIALITY: 'confidentiality',
  BOTH: 'both'
};

export const PROTECT_DEGREES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export function getBusinessObject(element) {
  return element && element.businessObject;
}

export function getExtensionElements(element) {
  return getBusinessObject(element)?.get('extensionElements') || null;
}

export function ensureExtensionElements(element, moddle, modeling) {
  const bo = getBusinessObject(element);
  let extensionElements = bo.get('extensionElements');

  if (!extensionElements) {
    extensionElements = moddle.create('bpmn:ExtensionElements', {
      values: []
    });

    modeling.updateProperties(element, {
      extensionElements
    });
  }

  return extensionElements;
}

export function getSecurityRequirements(element) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements || !Array.isArray(extensionElements.values)) {
    return [];
  }

  return extensionElements.values.filter((v) => v.$type === SECURE_REQ_TYPE);
}

export function getPrimarySecurityRequirement(element) {
  return getSecurityRequirements(element)[0] || null;
}

export function removeAllSecurityRequirements(element, modeling) {
  const bo = getBusinessObject(element);
  const extensionElements = bo?.get('extensionElements');

  if (!extensionElements || !Array.isArray(extensionElements.values)) {
    return;
  }

  extensionElements.values = extensionElements.values.filter(
    (v) => v.$type !== SECURE_REQ_TYPE
  );

  modeling.updateProperties(element, {
    extensionElements
  });
}

export function upsertPrimarySecurityRequirement(element, values, moddle, modeling) {
  const extensionElements = ensureExtensionElements(element, moddle, modeling);

  let req = extensionElements.values.find((v) => v.$type === SECURE_REQ_TYPE);

  if (!req) {
    req = moddle.create(SECURE_REQ_TYPE, {
      roles: [],
      permissions: [],
      ...values
    });
    extensionElements.values.push(req);
  } else {
    Object.assign(req, values);
  }

  modeling.updateProperties(element, {
    extensionElements
  });

  return req;
}

export function setRolesOnRequirement(requirement, roles, moddle) {
  requirement.roles = roles.map((r) =>
    moddle.create(SECURE_ROLE_TYPE, {
      roleName: r.roleName || '',
      description: r.description || ''
    })
  );
}

export function setPermissionsOnRequirement(requirement, permissions, moddle) {
  requirement.permissions = permissions.map((p) =>
    moddle.create(SECURE_PERMISSION_TYPE, {
      objectRef: p.objectRef || '',
      operations: p.operations || '',
      description: p.description || ''
    })
  );
}

export function getRequirementAbbreviation(requirementType, requirement) {
  switch (requirementType) {
    case REQUIREMENT_TYPES.NON_REPUDIATION:
      return 'NR';
    case REQUIREMENT_TYPES.ATTACK_HARM_DETECTION:
      return 'AD';
    case REQUIREMENT_TYPES.INTEGRITY: {
      const degree = requirement?.protectDegree || '';
      if (degree === 'low') return 'Il';
      if (degree === 'medium') return 'Im';
      if (degree === 'high') return 'Ih';
      return 'I';
    }
    case REQUIREMENT_TYPES.PRIVACY: {
      const privacyType = requirement?.privacyType || '';
      if (privacyType === 'anonymity') return 'Pa';
      if (privacyType === 'confidentiality') return 'Pc';
      return 'P';
    }
    case REQUIREMENT_TYPES.ACCESS_CONTROL:
      return 'AC';
    default:
      return '';
  }
}

export function isAllowedRequirementForElement(element, requirementType) {
  const type = getBusinessObject(element)?.$type;

  const isPool = type === 'bpmn:Participant';
  const isLane = type === 'bpmn:Lane';
  const isGroup = type === 'bpmn:Group';
  const isActivity = /^bpmn:(Task|UserTask|ManualTask|ServiceTask|ScriptTask|BusinessRuleTask|SendTask|ReceiveTask|SubProcess|CallActivity|Activity)$/.test(type);
  const isMessageFlow = type === 'bpmn:MessageFlow';
  const isDataObject = type === 'bpmn:DataObjectReference' || type === 'bpmn:DataObject';

  switch (requirementType) {
    case REQUIREMENT_TYPES.NON_REPUDIATION:
      return isMessageFlow;

    case REQUIREMENT_TYPES.ATTACK_HARM_DETECTION:
      return isPool || isLane || isGroup || isActivity || isMessageFlow || isDataObject;

    case REQUIREMENT_TYPES.INTEGRITY:
      return isMessageFlow || isDataObject;

    case REQUIREMENT_TYPES.PRIVACY:
      return isPool || isLane || isGroup;

    case REQUIREMENT_TYPES.ACCESS_CONTROL:
      return isPool || isLane || isGroup || isActivity;

    default:
      return false;
  }
}

export function isSecureBpmnTarget(element) {
  const type = getBusinessObject(element)?.$type;

  return [
    'bpmn:Participant',
    'bpmn:Lane',
    'bpmn:Group',
    'bpmn:MessageFlow',
    'bpmn:DataObject',
    'bpmn:DataObjectReference'
  ].includes(type) || /^bpmn:(Task|UserTask|ManualTask|ServiceTask|ScriptTask|BusinessRuleTask|SendTask|ReceiveTask|SubProcess|CallActivity|Activity)$/.test(type);
}