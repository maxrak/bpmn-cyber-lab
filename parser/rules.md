# BPMN to GitHub Actions Mapping Rules

This document outlines the rules used by the parser to convert BPMN XML elements into GitHub Actions YAML configurations.

## Summary Table

| Rule | BPMN Element | GitHub Actions YAML Equivalent |
| :--- | :--- | :--- |
| **0** | Core Conversion | XML parsing to YAML generation |
| **1** | Start Event | `on: workflow_dispatch` |
| **2** | Service Task | `jobs.<job_id>` |
| **3** | Process Variable | `outputs` |
| **4** | Exclusive Gateway | `if: <condition>` |
| **5** | Sequence Flow | `needs: <job_id>` |
| **6** | End Event | Implicit end of workflow |
| **7** | Parallel Gateway | Fork/Join execution logic via `needs` arrays |
| **8** | Timer Event | `run: sleep <time>` |
| **9** | User Task (Manual Approval) | `environment: <name>` |

---

## Detailed Implementation

### 0. XML to YAML
The architecture relies on parsing standard BPMN 2.0 XML schema into a structured JavaScript object, transforming it based on the rules below, and serializing the final state into a standard GitHub Actions `.yml` file.

### 1. Start Event -> `on`
`bpmn:startEvent` nodes define the workflow triggers.
* **Implementation:** Maps to the `on` block. Currently defaults to `workflow_dispatch` to allow manual execution, mirroring the start of a logical process.

### 2. Service Task -> `job`
`bpmn:serviceTask` nodes represent automated execution units.
* **Implementation:** Converted directly into a job under the `jobs` block. The job ID is sanitized from the BPMN ID (e.g., `Task_Build` becomes `build`). Runs on `ubuntu-latest` by default.

### 3. Process Variable -> `outputs`
Variables generated during a process that dictate downstream routing or data requirements.
* **Implementation:** Maps to the `outputs` property of a job. Values are written to the environment using `echo "<key>=<value>" >> "$GITHUB_OUTPUT"`.

### 4. Exclusive Gateway -> `if`
`bpmn:exclusiveGateway` nodes represent logical XOR branching based on state.
* **Implementation:** The parser traverses backward to extract the `bpmn:conditionExpression` from the relevant outgoing `bpmn:sequenceFlow`. This is translated into GitHub Actions expression syntax (e.g., `${{ needs.<job>.outputs.<var> == 'value' }}`) and applied to the `if` key of the target job.

### 5. Sequence Flow -> `needs`
`bpmn:sequenceFlow` lines establish the dependency graph.
* **Implementation:** Defines the `needs` requirement. If Job B follows Job A, Job B will contain `needs: a`.

### 6. End Event -> Workflow Termination
`bpmn:endEvent` nodes explicitly define the end of a branch.
* **Implementation:** Implicitly handled. GitHub Actions naturally terminates a workflow path when no subsequent jobs declare the current job as a dependency. No direct YAML block is required.

### 7. Parallel Gateway -> Independent Jobs
`bpmn:parallelGateway` nodes define parallel execution (forks) and synchronization points (joins).
* **Implementation:**
  * **Fork:** Jobs immediately following the gateway will share the same `needs` parent, causing GitHub Actions to execute them concurrently.
  * **Join:** The converging job following the parallel tasks will list an array of dependencies (e.g., `needs: [build, test]`), ensuring it waits for all branches to resolve.

### 8. Timer Event -> `sleep`
`bpmn:intermediateCatchEvent` with a `bpmn:timerEventDefinition` introduces forced wait times.
* **Implementation:** Creates an intermediate job containing a `run: sleep <seconds>` bash command before proceeding to the next step.

### 9. Manual Approval -> `environment`
`bpmn:userTask` nodes indicate required human intervention.
* **Implementation:** Maps to a job utilizing the `environment` key targeting a protected environment (e.g., `produzione`). GitHub Actions natively pauses the workflow at this stage until an authorized user grants approval via the UI.