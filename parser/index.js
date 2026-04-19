const fs = require("fs");
const path = require("path");
const { convertBpmnToGitHubActions, writeYaml } = require("./bpmn2github");

// Retrieve command line arguments (excluding 'node' and the script path)
const inputFiles = process.argv.slice(2);

if (inputFiles.length === 0) {
  console.error("Error: Please provide at least one XML/BPMN file path as an argument.");
  console.log("Usage: node index.js <path/to/file1.bpmn> [path/to/file2.bpmn ...]");
  process.exit(1);
}

inputFiles.forEach(inputFile => {
  if (fs.existsSync(inputFile)) {
    try {
      const xml = fs.readFileSync(inputFile, "utf8");
      const workflowObject = convertBpmnToGitHubActions(xml);
      
      // Generate output filename based on input filename (e.g., example.bpmn -> example.yml)
      const baseName = path.basename(inputFile, path.extname(inputFile));
      const outputFile = `${baseName}.yml`;
      
      writeYaml(workflowObject, outputFile);
    } catch (error) {
      console.error(`Error processing ${inputFile}:`, error.message);
    }
  } else {
    console.error(`Error: File not found - ${inputFile}`);
  }
});