const { Observable, from } = require('rxjs');
const Ajv = require('ajv'); // Import AJV for JSON schema validation
const fs = require('fs');
const path = require('path');

// Schema Interfaces
class SchemaValidatorResult {
  constructor(success, errors) {
    this.success = success;
    this.errors = errors || [];
  }
}

class SchemaValidator {
  constructor(validatorFn) {
    return (data) => from(validatorFn(data));
  }
}

class SchemaFormatter {
  constructor(async, validateFn) {
    this.async = async;
    this.validate = validateFn;
  }
}

class SchemaRegistry {
  constructor() {
    this.ajv = new Ajv(); // Initialize AJV
  }

  compile(schema) {
    return new Observable((subscriber) => {
      const validator = (data) => {
        const isValid = this.ajv.validate(schema, data);
        subscriber.next(new SchemaValidatorResult(isValid, this.ajv.errors));
        subscriber.complete();
      };
      subscriber.next(new SchemaValidator(validator));
      subscriber.complete();
    });
  }

  addFormat(name, formatter) {
    this.ajv.addFormat(name, formatter);
  }
}

class CoreSchemaRegistry extends SchemaRegistry {
  constructor(formats = {}) {
    super();
    Object.entries(formats).forEach(([name, formatter]) => this.addFormat(name, formatter));
  }
}

// Workspaces
class ProjectDefinition {
  constructor(root, extensions = {}, targets = new Map()) {
    this.root = root;
    this.extensions = extensions;
    this.targets = targets;
  }
}

class WorkspaceDefinition {
  constructor(extensions = {}, projects = new Map()) {
    this.extensions = extensions;
    this.projects = projects;
  }
}

const WorkspaceFormat = {
  JSON: 'json',
};

async function readWorkspace(directoryPath, host, format = WorkspaceFormat.JSON) {
  const content = await host.readFile(path.join(directoryPath, 'workspace.json'));
  return { workspace: JSON.parse(content) };
}

async function writeWorkspace(workspace, host, workspacePath, format = WorkspaceFormat.JSON) {
  const data = JSON.stringify(workspace, null, 2);
  await host.writeFile(workspacePath || 'workspace.json', data);
}

class WorkspaceHost {
  constructor(fileSystem) {
    this.fileSystem = fileSystem;
  }
  async readFile(filePath) {
    return fs.promises.readFile(filePath, 'utf8');
  }
  async writeFile(filePath, data) {
    return fs.promises.writeFile(filePath, data, 'utf8');
  }
  async isDirectory(directoryPath) {
    const stats = await fs.promises.stat(directoryPath);
    return stats.isDirectory();
  }
  async isFile(filePath) {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile();
  }
}

function createWorkspaceHost(host) {
  return new WorkspaceHost(host);
}

// Usage Example
async function demonstrate() {
  const host = new WorkspaceHost(fs);
  const { workspace } = await readWorkspace('path/to/workspace/directory', host);

  const project = workspace.projects.get('my-app');
  if (!project) {
    throw new Error('my-app does not exist');
  }

  const buildTarget = project.targets.get('build');
  if (!buildTarget) {
    throw new Error('build target does not exist');
  }

  buildTarget.options = { ...buildTarget.options, optimization: true };

  await writeWorkspace(workspace, host, 'path/to/workspace.json');
}

demonstrate().catch(console.error);
