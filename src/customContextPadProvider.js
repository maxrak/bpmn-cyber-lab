/**
 * Custom Context Pad Provider per BPMN Cyber Lab
 * Aggiunge opzioni estese per gateway e task
 */

export default class CustomContextPadProvider {
  constructor(contextPad, create, elementFactory, injector, translate, modeling, connect) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    this.modeling = modeling;
    this.connect = connect;
    
    // Ottieni autoPlace se disponibile
    this.autoPlace = injector.get('autoPlace', false);

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate,
      modeling,
      connect
    } = this;

    const actions = {};

    if (element.type === 'label') {
      return actions;
    }

    function appendAction(type, className, title, options) {
      if (typeof title !== 'string') {
        options = title;
        title = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
      }

      function appendStart(event, element) {
        const shape = elementFactory.createShape(Object.assign({ type: type }, options));

        if (autoPlace) {
          const position = autoPlace.append(element, shape);
          return position;
        } else {
          create.start(event, shape, {
            source: element
          });
        }
      }

      const append = autoPlace ? function(event, element) {
        const shape = elementFactory.createShape(Object.assign({ type: type }, options));
        autoPlace.append(element, shape);
      } : appendStart;

      return {
        group: 'model',
        className: className,
        title: title,
        action: {
          dragstart: appendStart,
          click: append
        }
      };
    }

    function startConnect(event, element) {
      connect.start(event, element);
    }

    // Elementi context pad standard
    if (element.type !== 'bpmn:SequenceFlow') {
      // Connect
      actions['connect'] = {
        group: 'connect',
        className: 'bpmn-icon-connection-multi',
        title: translate('Connect using Sequence Flow'),
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      };

      // Tasks
      actions['append.user-task'] = appendAction(
        'bpmn:UserTask',
        'bpmn-icon-user-task',
        translate('Append User Task')
      );

      actions['append.service-task'] = appendAction(
        'bpmn:ServiceTask',
        'bpmn-icon-service-task',
        translate('Append Service Task')
      );

      // Gateways
      actions['append.gateway-xor'] = appendAction(
        'bpmn:ExclusiveGateway',
        'bpmn-icon-gateway-xor',
        translate('Append Exclusive Gateway')
      );

      actions['append.gateway-parallel'] = appendAction(
        'bpmn:ParallelGateway',
        'bpmn-icon-gateway-parallel',
        translate('Append Parallel Gateway')
      );

      // Events
      actions['append.intermediate-event'] = appendAction(
        'bpmn:IntermediateThrowEvent',
        'bpmn-icon-intermediate-event-none',
        translate('Append Intermediate Event')
      );

      actions['append.end-event'] = appendAction(
        'bpmn:EndEvent',
        'bpmn-icon-end-event-none',
        translate('Append EndEvent')
      );
    }

    // Delete
    actions['delete'] = {
      group: 'edit',
      className: 'bpmn-icon-trash',
      title: translate('Remove'),
      action: {
        click: function(event, element) {
          modeling.removeElements([element]);
        }
      }
    };

    return actions;
  }
}

CustomContextPadProvider.$inject = [
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate',
  'modeling',
  'connect'
];