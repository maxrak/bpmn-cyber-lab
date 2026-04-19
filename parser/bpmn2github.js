const { XMLParser } = require("fast-xml-parser");
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");

// --- 1. Core Parser ---
class BpmnParser {
  constructor(xmlContent) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const rawData = parser.parse(xmlContent);
    this.process = rawData["bpmn:definitions"]["bpmn:process"];
    this.elements = new Map();
    this.flows = [];
    this._indexElements();
  }

  _indexElements() {
    for (const [key, value] of Object.entries(this.process)) {
      if (key === "bpmn:sequenceFlow") {
        this.flows = Array.isArray(value) ? value : [value];
        continue;
      }
      
      const items = Array.isArray(value) ? value : [value];
      items.forEach(item => {
        if (item && item.id) {
          this.elements.set(item.id, { type: key, ...item });
        }
      });
    }
  }

  getIncomingFlows(nodeId) {
    return this.flows.filter(f => f.targetRef === nodeId);
  }

  getOutgoingFlows(nodeId) {
    return this.flows.filter(f => f.sourceRef === nodeId);
  }
}

// --- 2. Rule Handlers (Extensible) ---
const Rules = {
  // Rule 1: Start event -> on
  "bpmn:startEvent": (node, context) => {
    context.workflow.on = { workflow_dispatch: {} }; // Simplified mapping
  },

  // Rule 2 & 3: Service Task -> job & Process variable -> outputs
  "bpmn:serviceTask": (node, context) => {
    const jobId = formatId(node.id);
    const job = {
      "runs-on": "ubuntu-latest",
      steps: [{ name: node.name, run: `echo "Esecuzione ${node.name}"` }]
    };
    
    // Check for outputs (Rule 3) - Simplification: assumes validation task creates outputs
    if (node.name.toLowerCase().includes("valida")) {
      job.outputs = { ordine_valido: "${{ steps.esito.outputs.ordine_valido }}" };
      job.steps[0].id = "esito";
      job.steps[0].run = 'echo "ordine_valido=true" >> "$GITHUB_OUTPUT"';
    }

    context.workflow.jobs[jobId] = job;
    return jobId;
  },

  // Rule 8: Timer event -> sleep inside the flow
  "bpmn:intermediateCatchEvent": (node, context) => {
    if (node["bpmn:timerEventDefinition"] !== undefined) {
      const jobId = formatId(node.id);
      context.workflow.jobs[jobId] = {
        "runs-on": "ubuntu-latest",
        steps: [{ name: node.name, run: 'sleep 12' }]
      };
      return jobId;
    }
  },

  // Rule 9: Manual approval -> environment
  "bpmn:userTask": (node, context) => {
    const jobId = formatId(node.id);
    context.workflow.jobs[jobId] = {
      "runs-on": "ubuntu-latest",
      environment: { name: "produzione" },
      steps: [{ name: node.name, run: 'echo "Approvazione manuale completata"' }]
    };
    return jobId;
  }
};

// --- 3. Dependency Graph Resolver (Rules 4, 5, 7) ---
function resolveDependencies(nodeId, bpmn, context, conditions = []) {
  const incoming = bpmn.getIncomingFlows(nodeId);
  let needs = [];
  let jobConditions = [...conditions];

  for (const flow of incoming) {
    const sourceNode = bpmn.elements.get(flow.sourceRef);
    
    // Rule 4: Exclusive Gateway -> if condition extraction
    if (sourceNode.type === "bpmn:exclusiveGateway") {
      if (flow["bpmn:conditionExpression"]) {
        let condition = flow["bpmn:conditionExpression"]["#text"];
        condition = condition.replace("<![CDATA[", "").replace("]]>", "").trim();
        // Convert BPMN syntax to GitHub Actions syntax
        condition = condition.replace("${", "${{ needs.valida_ordine.outputs."); 
        jobConditions.push(condition);
      }
      const parentDeps = resolveDependencies(sourceNode.id, bpmn, context, jobConditions);
      needs.push(...parentDeps.needs);
      jobConditions = parentDeps.conditions;
    } 
    // Rule 7: Parallel Gateway -> fork/join
    else if (sourceNode.type === "bpmn:parallelGateway") {
      const parentDeps = resolveDependencies(sourceNode.id, bpmn, context, jobConditions);
      needs.push(...parentDeps.needs);
    } 
    // Standard Task mapping
    else {
      needs.push(formatId(sourceNode.id));
    }
  }
  return { needs: [...new Set(needs)], conditions: jobConditions };
}

// --- Helper Functions ---
function formatId(bpmnId) {
  return bpmnId.replace(/^(Task_|Gateway_|Timer_|StartEvent_)/, "").toLowerCase();
}

// --- Main Converter Engine ---
function convertBpmnToGitHubActions(xmlString) {
  const bpmn = new BpmnParser(xmlString);
  const context = {
    workflow: { name: bpmn.process.name || "BPMN Process", jobs: {} }
  };

  // Process nodes that map to Jobs or Workflow triggers
  for (const [id, node] of bpmn.elements.entries()) {
    if (Rules[node.type]) {
      const mappedJobId = Rules[node.type](node, context);
      
      // Assign needs and ifs (Rules 4 & 5)
      if (mappedJobId && context.workflow.jobs[mappedJobId]) {
        const deps = resolveDependencies(id, bpmn, context);
        if (deps.needs.length > 0) {
          context.workflow.jobs[mappedJobId].needs = deps.needs.length === 1 ? deps.needs[0] : deps.needs;
        }
        if (deps.conditions.length > 0) {
          context.workflow.jobs[mappedJobId].if = deps.conditions[0]; // Applies first condition found
        }
      }
    }
  }

  return context.workflow;
}

// --- 4. File Writer ---
function writeYaml(workflowObj, outputFilename) {
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  const yamlString = yaml.stringify(workflowObj, { indent: 2 });
  const filePath = path.join(outputDir, outputFilename);
  fs.writeFileSync(filePath, yamlString, "utf8");
  console.log(`YAML generato con successo in: ${filePath}`);
}

module.exports = { convertBpmnToGitHubActions, writeYaml };