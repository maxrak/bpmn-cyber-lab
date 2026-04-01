import {
  SelectEntry,
  TextFieldEntry,
  TextAreaEntry
} from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import {
  getPrimarySecurityRequirement,
  upsertPrimarySecurityRequirement,
  removeAllSecurityRequirements,
  setRolesOnRequirement,
  setPermissionsOnRequirement,
  REQUIREMENT_TYPES,
  PRIVACY_TYPES,
  PROTECT_DEGREES,
  isSecureBpmnTarget
} from './secureBPMNutils.js';

import {
  validateSecureBpmnRequirement,
  parseRolesCsv,
  parsePermissionsCsv,
  stringifyRoles,
  stringifyPermissions
} from './securebpmn-validation.js';

const REQUIREMENT_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'NonRepudiation', value: REQUIREMENT_TYPES.NON_REPUDIATION },
  { label: 'AttackHarmDetection', value: REQUIREMENT_TYPES.ATTACK_HARM_DETECTION },
  { label: 'Integrity', value: REQUIREMENT_TYPES.INTEGRITY },
  { label: 'Privacy', value: REQUIREMENT_TYPES.PRIVACY },
  { label: 'AccessControl', value: REQUIREMENT_TYPES.ACCESS_CONTROL }
];

const DEGREE_OPTIONS = [
  { label: 'Not set', value: '' },
  { label: 'low', value: PROTECT_DEGREES.LOW },
  { label: 'medium', value: PROTECT_DEGREES.MEDIUM },
  { label: 'high', value: PROTECT_DEGREES.HIGH }
];

const PRIVACY_OPTIONS = [
  { label: 'Not set / both', value: '' },
  { label: 'anonymity', value: PRIVACY_TYPES.ANONYMITY },
  { label: 'confidentiality', value: PRIVACY_TYPES.CONFIDENTIALITY },
  { label: 'both', value: PRIVACY_TYPES.BOTH }
];

export default class SecureBpmnPropertiesProvider {
  constructor(propertiesPanel, injector) {
    this._injector = injector;

    // Definizione diretta sul'istanza (non sul prototipo) per garantire
    // che typeof this.getGroups === 'function' sia vero prima della
    // registrazione, anche in webpack eval-mode dove la catena del
    // prototipo può non essere ancora risolta.
    const self = this;
    this.getGroups = function getGroups(element) {
      return (groups) => {
        const isTarget = isSecureBpmnTarget(element);
        const hasRequirements = !!getPrimarySecurityRequirement(element);

        if (!isTarget && !hasRequirements) {
          return groups;
        }

        groups.push(createSecureBpmnGroup(element, self._injector, isTarget));

        return groups;
      };
    };

    propertiesPanel.registerProvider(500, this);
  }
}

SecureBpmnPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];

function createSecureBpmnGroup(element, injector, isTarget) {
  const translate = injector.get('translate');
  const hasRequirement = !!getPrimarySecurityRequirement(element);

  // Per elementi non supportati come target ma con requisiti già presenti,
  // mostra un riepilogo read-only invece del form di editing.
  if (!isTarget) {
    return {
      id: 'secure-bpmn',
      label: translate('SecureBPMN'),
      shouldOpen: true,
      entries: [
        {
          id: 'sb-readonly-summary',
          component: ReadOnlyRequirementsSummaryEntry,
          element,
          isEdited: () => false
        }
      ]
    };
  }

  return {
    id: 'secure-bpmn',
    label: translate('SecureBPMN'),
    shouldOpen: hasRequirement,
    entries: [
      {
        id: 'sb-requirement-type',
        component: RequirementTypeEntry,
        element
      },
      {
        id: 'sb-audit',
        component: AuditEntry,
        element
      },
      {
        id: 'sb-protect-degree',
        component: ProtectDegreeEntry,
        element
      },
      {
        id: 'sb-privacy-type',
        component: PrivacyTypeEntry,
        element
      },
      {
        id: 'sb-notes',
        component: NotesEntry,
        element
      },
      {
        id: 'sb-roles',
        component: RolesEntry,
        element
      },
      {
        id: 'sb-permissions',
        component: PermissionsEntry,
        element
      },
      {
        id: 'sb-validation',
        component: ValidationSummaryEntry,
        element
      }
    ]
  };
}

function getRequirementType(element) {
  return getPrimarySecurityRequirement(element)?.requirementType || '';
}

function ReadOnlyRequirementsSummaryEntry(props) {
  const { element } = props;
  const req = getPrimarySecurityRequirement(element);

  const div = document.createElement('div');
  div.style.padding = '8px 4px';
  div.style.fontSize = '12px';
  div.style.lineHeight = '1.6';
  div.style.color = '#444';

  if (!req || !req.requirementType) {
    div.innerHTML = '<em style="color:#888;">Nessun requisito di sicurezza associato.</em>';
    return div;
  }

  const rows = [
    [ 'Tipo',          req.requirementType || '-' ],
    [ 'Audit',         req.audit           || '-' ],
    [ 'Protect degree',req.protectDegree   || '-' ],
    [ 'Privacy type',  req.privacyType     || '-' ],
    [ 'Note',          req.notes           || '-' ]
  ];

  const roles = stringifyRoles(req.roles || []);
  if (roles) rows.push([ 'Ruoli', roles ]);

  const perms = stringifyPermissions(req.permissions || []);
  if (perms) rows.push([ 'Permessi', perms ]);

  div.innerHTML = rows
    .map(([ label, value ]) =>
      `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</div>`
    )
    .join('');

  return div;
}

function RequirementTypeEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  return SelectEntry({
    element,
    id: 'sb-requirement-type',
    label: translate('Requirement type'),
    getValue: () => getRequirementType(element),
    setValue: (value) => {
      if (!value) {
        removeAllSecurityRequirements(element, modeling);
        return;
      }

      const current = getPrimarySecurityRequirement(element);

      const initial = {
        requirementType: value,
        audit: current?.audit || '',
        protectDegree: current?.protectDegree || '',
        privacyType: current?.privacyType || '',
        notes: current?.notes || ''
      };

      const req = upsertPrimarySecurityRequirement(
        element,
        initial,
        moddle,
        modeling
      );

      if (!req.roles) {
        req.roles = [];
      }

      if (!req.permissions) {
        req.permissions = [];
      }

      modeling.updateProperties(element, {
        extensionElements: element.businessObject.extensionElements
      });
    },
    getOptions: () => REQUIREMENT_OPTIONS,
    debounce
  });
}

function AuditEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  if (!getRequirementType(element)) return null;

  return TextFieldEntry({
    element,
    id: 'sb-audit',
    label: translate('Audit values'),
    description: translate('Comma-separated values, e.g. RoleName,Date,Time'),
    getValue: () => getPrimarySecurityRequirement(element)?.audit || '',
    setValue: (value) => {
      upsertPrimarySecurityRequirement(element, { audit: value || '' }, moddle, modeling);
    },
    debounce
  });
}

function ProtectDegreeEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  if (getRequirementType(element) !== REQUIREMENT_TYPES.INTEGRITY) return null;

  return SelectEntry({
    element,
    id: 'sb-protect-degree',
    label: translate('Protect degree'),
    getValue: () => getPrimarySecurityRequirement(element)?.protectDegree || '',
    setValue: (value) => {
      upsertPrimarySecurityRequirement(
        element,
        { protectDegree: value || '' },
        moddle,
        modeling
      );
    },
    getOptions: () => DEGREE_OPTIONS,
    debounce
  });
}

function PrivacyTypeEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  if (getRequirementType(element) !== REQUIREMENT_TYPES.PRIVACY) return null;

  return SelectEntry({
    element,
    id: 'sb-privacy-type',
    label: translate('Privacy type'),
    getValue: () => getPrimarySecurityRequirement(element)?.privacyType || '',
    setValue: (value) => {
      upsertPrimarySecurityRequirement(
        element,
        { privacyType: value || '' },
        moddle,
        modeling
      );
    },
    getOptions: () => PRIVACY_OPTIONS,
    debounce
  });
}

function NotesEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  if (!getRequirementType(element)) return null;

  return TextAreaEntry({
    element,
    id: 'sb-notes',
    label: translate('Notes'),
    getValue: () => getPrimarySecurityRequirement(element)?.notes || '',
    setValue: (value) => {
      upsertPrimarySecurityRequirement(element, { notes: value || '' }, moddle, modeling);
    },
    debounce
  });
}

function RolesEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const t = getRequirementType(element);
  if (!(t === REQUIREMENT_TYPES.PRIVACY || t === REQUIREMENT_TYPES.ACCESS_CONTROL)) return null;

  return TextAreaEntry({
    element,
    id: 'sb-roles',
    label: translate('Roles'),
    description: translate('One role per line: roleName|description'),
    getValue: () => {
      const req = getPrimarySecurityRequirement(element);
      return stringifyRoles(req?.roles || []);
    },
    setValue: (value) => {
      const req = upsertPrimarySecurityRequirement(element, {}, moddle, modeling);
      setRolesOnRequirement(req, parseRolesCsv(value || ''), moddle);

      modeling.updateProperties(element, {
        extensionElements: element.businessObject.extensionElements
      });
    },
    debounce
  });
}

function PermissionsEntry(props) {
  const { element } = props;
  const modeling = useService('modeling');
  const moddle = useService('moddle');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  if (getRequirementType(element) !== REQUIREMENT_TYPES.ACCESS_CONTROL) return null;

  return TextAreaEntry({
    element,
    id: 'sb-permissions',
    label: translate('Permissions'),
    description: translate('One permission per line: objectRef|operations|description'),
    getValue: () => {
      const req = getPrimarySecurityRequirement(element);
      return stringifyPermissions(req?.permissions || []);
    },
    setValue: (value) => {
      const req = upsertPrimarySecurityRequirement(element, {}, moddle, modeling);
      setPermissionsOnRequirement(req, parsePermissionsCsv(value || ''), moddle);

      modeling.updateProperties(element, {
        extensionElements: element.businessObject.extensionElements
      });
    },
    debounce
  });
}

function ValidationSummaryEntry(props) {
  const { element } = props;
  const translate = useService('translate');

  if (!getRequirementType(element)) return null;

  const req = getPrimarySecurityRequirement(element);
  const result = validateSecureBpmnRequirement(element, req);

  const div = document.createElement('div');
  div.style.padding = '8px 0';
  div.style.fontSize = '12px';
  div.style.lineHeight = '1.4';

  const errors = result.errors || [];
  const warnings = result.warnings || [];

  if (!errors.length && !warnings.length) {
    div.innerHTML = `<span style="color:#0a7a2f;">${translate('Validation OK')}</span>`;
  } else {
    const parts = [];

    if (errors.length) {
      parts.push(
        `<div style="color:#b42318;"><strong>${translate('Errors')}</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul></div>`
      );
    }

    if (warnings.length) {
      parts.push(
        `<div style="color:#b54708;"><strong>${translate('Warnings')}</strong><ul>${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul></div>`
      );
    }

    div.innerHTML = parts.join('');
  }

  return div;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}