export default {
  __init__: [ 'riskColorBehavior' ],
  riskColorBehavior: [ 'type', function(eventBus, elementRegistry, modeling) {

    // function getRisk(element) {
    //   const bo = element.businessObject;
    //   const ext = bo && bo.extensionElements && bo.extensionElements.values || [];
    //   const props = ext.find(v => v.$type === 'camunda:Properties');

    //   if (!props) return null;

    //   const prop = props.values.find(p => p.name === 'cyber.risk');
    //   if (!prop || prop.value === undefined || prop.value === '') return null;

    //   const val = parseInt(prop.value, 10);
    //   return isNaN(val) ? null : val;
    // }

    function getRisk(element) {
  const bo = element.businessObject;
  const ext = (bo && bo.extensionElements && bo.extensionElements.values) || [];

  const assessment = ext.find(v => v.$type === 'cyber:TaskAssessment');
  if (assessment && assessment.riskScore !== undefined && assessment.riskScore !== null && assessment.riskScore !== '') {
    const val = parseInt(assessment.riskScore, 10);
    return isNaN(val) ? null : val;
  }

  // fallback legacy, se vuoi mantenere compatibilità con i file già esistenti
  const props = ext.find(v => v.$type === 'camunda:Properties');
  if (!props) return null;

  const prop = props.values.find(p => p.name === 'cyber.risk');
  if (!prop || prop.value === undefined || prop.value === '') return null;

  const val = parseInt(prop.value, 10);
  return isNaN(val) ? null : val;
}
    function colorForRisk(risk) {
      if (risk === null) return '#bdc3c7';      // grigio default
      if (risk <= 5) return '#2ecc71';         // verde
      if (risk <= 14) return '#f1c40f';        // giallo
      return '#e74c3c';                        // rosso
    }

    function updateAll() {
      const elements = elementRegistry.filter(e =>
        e.businessObject &&
        e.businessObject.$type &&
        e.businessObject.$type.indexOf('Task') !== -1
      );

      elements.forEach(element => {
        const risk = getRisk(element);
        const color = colorForRisk(risk);
        modeling.setColor(element, {
          stroke: color,
          fill: null
        });
      });
    }

    function onCommandStackChanged() {
      // prevent recursion: temporarily remove listener while applying colors
      eventBus.off('commandStack.changed', onCommandStackChanged);
      try {
        updateAll();
      } finally {
        // re-register asynchronously to avoid immediate retrigger during same stack
        setTimeout(() => eventBus.on('commandStack.changed', onCommandStackChanged), 0);
      }
    }

    eventBus.on('commandStack.changed', onCommandStackChanged);

  }]
};