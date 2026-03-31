/**
 * Custom Palette Provider per BPMN Cyber Lab
 * Estende la palette di default con tutti i tipi di gateway e task BPMN 2.0
 */

export default class CustomPaletteProvider {
  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
    this.palette = palette;
    this.create = create;
    this.elementFactory = elementFactory;
    this.spaceTool = spaceTool;
    this.lassoTool = lassoTool;
    this.handTool = handTool;
    this.globalConnect = globalConnect;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      create,
      elementFactory,
      spaceTool,
      lassoTool,
      handTool,
      globalConnect,
      translate
    } = this;

    function createAction(type, group, className, title, options) {
      function createListener(event) {
        const shape = elementFactory.createShape(Object.assign({ type: type }, options));
        create.start(event, shape);
      }

      const shortType = type.replace(/^bpmn:/, '');

      return {
        group: group,
        className: className,
        title: title || translate('Create {type}', { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    }

    return {
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: translate('Activate the hand tool'),
        action: {
          click: function(event) {
            handTool.activateHand(event);
          }
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: translate('Activate the lasso tool'),
        action: {
          click: function(event) {
            lassoTool.activateSelection(event);
          }
        }
      },
      'space-tool': {
        group: 'tools',
        className: 'bpmn-icon-space-tool',
        title: translate('Activate the create/remove space tool'),
        action: {
          click: function(event) {
            spaceTool.activateSelection(event);
          }
        }
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: translate('Activate the global connect tool'),
        action: {
          click: function(event) {
            globalConnect.start(event);
          }
        }
      },
      'tool-separator': {
        group: 'tools',
        separator: true
      },
      'create.start-event': createAction(
        'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none',
        translate('Create StartEvent')
      ),
      'create.start-event-timer': createAction(
        'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-timer',
        translate('Create Timer Start Event'),
        { eventDefinitionType: 'bpmn:TimerEventDefinition' }
      ),
      'create.intermediate-event': createAction(
        'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none',
        translate('Create Intermediate/Boundary Event')
      ),
      'create.intermediate-event-catch-timer': createAction(
        'bpmn:IntermediateCatchEvent', 'event', 'bpmn-icon-intermediate-event-catch-timer',
        translate('Create Timer Intermediate Catch Event'),
        { eventDefinitionType: 'bpmn:TimerEventDefinition' }
      ),
      'create.end-event': createAction(
        'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none',
        translate('Create EndEvent')
      ),
      'create.start-event-error': createAction(
        'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-error',
        translate('Create Error Start Event'),
        { eventDefinitionType: 'bpmn:ErrorEventDefinition' }
      ),
      'create.intermediate-event-catch-error': createAction(
        'bpmn:BoundaryEvent', 'event', 'bpmn-icon-intermediate-event-catch-error',
        translate('Create Error Boundary Event'),
        { eventDefinitionType: 'bpmn:ErrorEventDefinition' }
      ),
      'create.end-event-error': createAction(
        'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-error',
        translate('Create Error End Event'),
        { eventDefinitionType: 'bpmn:ErrorEventDefinition' }
      ),
      'event-separator': {
        group: 'event',
        separator: true
      },
      'create.exclusive-gateway': createAction(
        'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor',
        translate('Create Exclusive Gateway')
      ),
      'create.parallel-gateway': createAction(
        'bpmn:ParallelGateway', 'gateway', 'bpmn-icon-gateway-parallel',
        translate('Create Parallel Gateway')
      ),
      'create.inclusive-gateway': createAction(
        'bpmn:InclusiveGateway', 'gateway', 'bpmn-icon-gateway-or',
        translate('Create Inclusive Gateway')
      ),
      'create.event-based-gateway': createAction(
        'bpmn:EventBasedGateway', 'gateway', 'bpmn-icon-gateway-eventbased',
        translate('Create Event-based Gateway')
      ),
      'create.complex-gateway': createAction(
        'bpmn:ComplexGateway', 'gateway', 'bpmn-icon-gateway-complex',
        translate('Create Complex Gateway')
      ),
      'gateway-separator': {
        group: 'gateway',
        separator: true
      },
      'create.task': createAction(
        'bpmn:Task', 'activity', 'bpmn-icon-task',
        translate('Create Task')
      ),
      'create.user-task': createAction(
        'bpmn:UserTask', 'activity', 'bpmn-icon-user-task',
        translate('Create User Task')
      ),
      'create.service-task': createAction(
        'bpmn:ServiceTask', 'activity', 'bpmn-icon-service-task',
        translate('Create Service Task')
      ),
      'create.manual-task': createAction(
        'bpmn:ManualTask', 'activity', 'bpmn-icon-manual-task',
        translate('Create Manual Task')
      ),
      'create.script-task': createAction(
        'bpmn:ScriptTask', 'activity', 'bpmn-icon-script-task',
        translate('Create Script Task')
      ),
      'create.business-rule-task': createAction(
        'bpmn:BusinessRuleTask', 'activity', 'bpmn-icon-business-rule-task',
        translate('Create Business Rule Task')
      ),
      'create.send-task': createAction(
        'bpmn:SendTask', 'activity', 'bpmn-icon-send-task',
        translate('Create Send Task')
      ),
      'create.receive-task': createAction(
        'bpmn:ReceiveTask', 'activity', 'bpmn-icon-receive-task',
        translate('Create Receive Task')
      ),
      'create.call-activity': createAction(
        'bpmn:CallActivity', 'activity', 'bpmn-icon-call-activity',
        translate('Create Call Activity')
      ),
      'create.subprocess-expanded': createAction(
        'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded',
        translate('Create expanded SubProcess'),
        { isExpanded: true }
      ),
      'activity-separator': {
        group: 'activity',
        separator: true
      },
      'create.data-object': createAction(
        'bpmn:DataObjectReference', 'data', 'bpmn-icon-data-object',
        translate('Create DataObjectReference')
      ),
      'create.data-store': createAction(
        'bpmn:DataStoreReference', 'data', 'bpmn-icon-data-store',
        translate('Create DataStoreReference')
      ),
      'data-separator': {
        group: 'data',
        separator: true
      },
      'create.participant-expanded': {
        group: 'collaboration',
        className: 'bpmn-icon-participant',
        title: translate('Create Pool/Participant'),
        action: {
          dragstart: function(event) {
            create.start(event, elementFactory.createParticipantShape());
          },
          click: function(event) {
            create.start(event, elementFactory.createParticipantShape());
          }
        }
      },
      'create.group': createAction(
        'bpmn:Group', 'artifact', 'bpmn-icon-group',
        translate('Create Group')
      )
    };
  }
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate'
];
