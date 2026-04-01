import {
  REQUIREMENT_TYPES,
  isAllowedRequirementForElement
} from './secureBPMNutils.js';

export function validateSecureBpmnRequirement(element, requirement) {
  const errors = [];
  const warnings = [];

  if (!requirement) {
    return { errors, warnings };
  }

  const type = requirement.requirementType;
  const elementType = element?.businessObject?.$type || '';

  if (!type) {
    errors.push('Missing requirementType.');
    return { errors, warnings };
  }

  if (!isAllowedRequirementForElement(element, type)) {
    errors.push(
      `${type} is not allowed on ${elementType}.`
    );
  }

  if (type === REQUIREMENT_TYPES.INTEGRITY) {
    if (!requirement.protectDegree) {
      errors.push('Integrity requires protectDegree: low, medium, or high.');
    } else if (!['low', 'medium', 'high'].includes(requirement.protectDegree)) {
      errors.push('Integrity protectDegree must be one of: low, medium, high.');
    }
  }

  if (type === REQUIREMENT_TYPES.PRIVACY) {
    const roles = requirement.roles || [];
    if (!roles.length) {
      errors.push('Privacy requires at least one SecurityRole.');
    }

    if (
      requirement.privacyType &&
      !['anonymity', 'confidentiality', 'both'].includes(requirement.privacyType)
    ) {
      errors.push('Privacy privacyType must be anonymity, confidentiality, or both.');
    }

    if (!requirement.privacyType) {
      warnings.push('Privacy type not set: the paper treats omission as both anonymity and confidentiality.');
    }
  }

  if (type === REQUIREMENT_TYPES.ACCESS_CONTROL) {
    const roles = requirement.roles || [];
    if (!roles.length) {
      errors.push('AccessControl requires at least one SecurityRole.');
    }
  }

  const permissions = requirement.permissions || [];
  const roles = requirement.roles || [];

  if (permissions.length && !roles.length) {
    warnings.push('SecurityPermission is present without SecurityRole.');
  }

  permissions.forEach((permission, index) => {
    validatePermission(permission, index, errors, warnings);
  });

  if (
    type === REQUIREMENT_TYPES.NON_REPUDIATION &&
    !requirement.audit
  ) {
    warnings.push('NonRepudiation can be complemented with audit values.');
  }

  if (
    type === REQUIREMENT_TYPES.ATTACK_HARM_DETECTION &&
    !requirement.audit
  ) {
    warnings.push('AttackHarmDetection usually benefits from audit values for detection, registration, and notification.');
  }

  if (
    type === REQUIREMENT_TYPES.ACCESS_CONTROL &&
    !requirement.audit
  ) {
    warnings.push('AccessControl often benefits from audit values such as RoleName, Date, Time.');
  }

  return { errors, warnings };
}

function validatePermission(permission, index, errors, warnings) {
  const row = index + 1;
  const objectRef = permission?.objectRef || '';
  const operations = permission?.operations || '';

  if (!objectRef) {
    errors.push(`Permission #${row}: objectRef is required.`);
  }

  if (!operations) {
    errors.push(`Permission #${row}: operations is required.`);
    return;
  }

  const ops = operations
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!ops.length) {
    errors.push(`Permission #${row}: operations is empty.`);
    return;
  }

  const inferred = inferObjectKind(objectRef);

  const allowed = getAllowedOperationsForObjectKind(inferred);

  ops.forEach((op) => {
    if (!allowed.includes(op)) {
      warnings.push(
        `Permission #${row}: operation "${op}" is unusual for inferred object kind "${inferred}". Allowed: ${allowed.join(', ')}.`
      );
    }
  });
}

function inferObjectKind(objectRef) {
  const value = String(objectRef || '').toLowerCase();

  if (
    value.includes('flow') ||
    value.includes('message')
  ) {
    return 'messageFlow';
  }

  if (
    value.includes('data') ||
    value.includes('object') ||
    value.includes('information')
  ) {
    return 'dataObject';
  }

  return 'activity';
}

function getAllowedOperationsForObjectKind(kind) {
  switch (kind) {
    case 'activity':
      return [ 'Execution', 'CheckExecution' ];
    case 'dataObject':
      return [ 'Update', 'Create', 'Read', 'Delete' ];
    case 'messageFlow':
      return [ 'SendReceive', 'CheckSendReceive' ];
    default:
      return [];
  }
}

export function parseRolesCsv(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [ roleName = '', description = '' ] = line.split('|');
      return {
        roleName: roleName.trim(),
        description: description.trim()
      };
    })
    .filter((r) => r.roleName);
}

export function stringifyRoles(roles) {
  return (roles || [])
    .map((r) => `${r.roleName || ''}|${r.description || ''}`)
    .join('\n');
}

export function parsePermissionsCsv(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [ objectRef = '', operations = '', description = '' ] = line.split('|');
      return {
        objectRef: objectRef.trim(),
        operations: operations.trim(),
        description: description.trim()
      };
    })
    .filter((p) => p.objectRef || p.operations);
}

export function stringifyPermissions(permissions) {
  return (permissions || [])
    .map((p) => `${p.objectRef || ''}|${p.operations || ''}|${p.description || ''}`)
    .join('\n');
}