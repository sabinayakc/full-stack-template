import type { WorkflowInstanceStatus, WorkflowMap, WorkflowName, WorkflowService } from "./types";

// ─── Cloudflare Workflow Service ─────────────────────────────────────────────
// Maps workflow names to CF Workflow bindings via globalThis.__cfEnv.
// Server code calls workflowService.start("example", {...}) without
// knowing about Cloudflare.

// Binding name convention: WORKFLOW_NAME in SCREAMING_SNAKE_CASE + _WORKFLOW suffix
// e.g. "example" → "EXAMPLE_WORKFLOW"
function getBindingName(workflow: WorkflowName): string {
  return `${workflow.replaceAll("-", "_").toUpperCase()}_WORKFLOW`;
}

interface WorkflowBinding {
  create(opts?: { id?: string; params?: unknown }): Promise<{ id: string }>;
  get(id: string): Promise<WorkflowInstance>;
}

interface WorkflowInstance {
  id: string;
  pause(): Promise<void>;
  resume(): Promise<void>;
  terminate(): Promise<void>;
  restart(): Promise<void>;
  status(): Promise<WorkflowInstanceStatus>;
}

export class CloudflareWorkflowService implements WorkflowService {
  private getBinding(workflow: WorkflowName): WorkflowBinding {
    const env = (globalThis as Record<string, unknown>).__cfEnv as Record<string, unknown>;
    if (!env) {
      throw new Error("[WorkflowService] CF env not available — setupBindings() not called?");
    }

    const bindingName = getBindingName(workflow);
    const binding = env[bindingName] as WorkflowBinding | undefined;

    if (!binding) {
      throw new Error(
        `[WorkflowService] No binding "${bindingName}" found for workflow "${workflow}"`,
      );
    }

    return binding;
  }

  async start<W extends WorkflowName>(
    workflow: W,
    params: WorkflowMap[W],
    opts?: { id?: string },
  ): Promise<{ id: string }> {
    const binding = this.getBinding(workflow);
    const instance = await binding.create({ id: opts?.id, params });
    return { id: instance.id };
  }

  async pause(workflow: WorkflowName, instanceId: string): Promise<void> {
    const binding = this.getBinding(workflow);
    const instance = await binding.get(instanceId);
    await instance.pause();
  }

  async resume(workflow: WorkflowName, instanceId: string): Promise<void> {
    const binding = this.getBinding(workflow);
    const instance = await binding.get(instanceId);
    await instance.resume();
  }

  async terminate(workflow: WorkflowName, instanceId: string): Promise<void> {
    const binding = this.getBinding(workflow);
    const instance = await binding.get(instanceId);
    await instance.terminate();
  }

  async restart(workflow: WorkflowName, instanceId: string): Promise<void> {
    const binding = this.getBinding(workflow);
    const instance = await binding.get(instanceId);
    await instance.restart();
  }

  async getStatus(
    workflow: WorkflowName,
    instanceId: string,
  ): Promise<WorkflowInstanceStatus | null> {
    try {
      const binding = this.getBinding(workflow);
      const instance = await binding.get(instanceId);
      return await instance.status();
    } catch {
      return null;
    }
  }

  async findInstanceStatus(
    instanceId: string,
    workflowNames: WorkflowName[],
  ): Promise<{ workflow: WorkflowName; status: WorkflowInstanceStatus } | null> {
    for (const name of workflowNames) {
      const status = await this.getStatus(name, instanceId);
      if (status) return { workflow: name, status };
    }
    return null;
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

let _instance: WorkflowService | null = null;

export function getWorkflowService(): WorkflowService {
  if (!_instance) {
    _instance = new CloudflareWorkflowService();
  }
  return _instance;
}
