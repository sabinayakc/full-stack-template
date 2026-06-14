// ─── Job Map ─────────────────────────────────────────────────────────────────
// Single source of truth for all async job names and their typed payloads.
// Add new jobs here as the system grows.

export interface JobMap {
  "notifications.deliver": { notificationId: string; organizationId: string };
  "workflows.start": {
    workflowRunId: string;
    workflowName: WorkflowName;
    params: Record<string, unknown>;
  };
}

export type JobName = keyof JobMap;

// ─── Workflow Map ────────────────────────────────────────────────────────────
// Maps workflow names to their typed params. Each workflow has a corresponding
// binding in wrangler.toml and a WorkflowEntrypoint class.

export interface WorkflowMap {
  example: { message?: string };
}

export type WorkflowName = keyof WorkflowMap;

// ─── Queue Message Envelope ──────────────────────────────────────────────────

export interface QueueMessage<J extends JobName = JobName> {
  job: J;
  payload: JobMap[J];
  timestamp: string;
}

// ─── Dispatch Options ────────────────────────────────────────────────────────

export interface DispatchOptions {
  /** Delay message delivery by N seconds */
  delaySeconds?: number;
}

// ─── Job Queue Interface ─────────────────────────────────────────────────────
// Provider-agnostic interface for dispatching async jobs.

export interface JobQueue {
  dispatch<J extends JobName>(job: J, payload: JobMap[J], opts?: DispatchOptions): Promise<void>;
}

// ─── Workflow Service Interface ───────────────────────────────────────────────
// Provider-agnostic interface for starting durable workflows.

export interface WorkflowInstanceStatus {
  status: string;
  output?: unknown[];
  error?: string;
}

export interface WorkflowService {
  start<W extends WorkflowName>(
    workflow: W,
    params: WorkflowMap[W],
    opts?: { id?: string },
  ): Promise<{ id: string }>;
  pause(workflow: WorkflowName, instanceId: string): Promise<void>;
  resume(workflow: WorkflowName, instanceId: string): Promise<void>;
  terminate(workflow: WorkflowName, instanceId: string): Promise<void>;
  restart(workflow: WorkflowName, instanceId: string): Promise<void>;
  getStatus(workflow: WorkflowName, instanceId: string): Promise<WorkflowInstanceStatus | null>;
}

// ─── Job Handler ─────────────────────────────────────────────────────────────

export type JobHandler<J extends JobName = JobName> = (payload: JobMap[J]) => Promise<void>;
