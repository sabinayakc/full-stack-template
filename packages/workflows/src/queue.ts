import type { DispatchOptions, JobMap, JobName, QueueMessage } from "./types";

// ─── Cloudflare Queue Job Dispatcher ─────────────────────────────────────────
// Sends typed messages to a CF Queue using the envelope pattern.
// The consumer (in the Worker entry point) routes by `job` name.

export class CloudflareJobQueue {
  private getQueue: () => Queue<QueueMessage>;

  constructor(getQueue: () => Queue<QueueMessage>) {
    this.getQueue = getQueue;
  }

  async dispatch<J extends JobName>(
    job: J,
    payload: JobMap[J],
    opts?: DispatchOptions,
  ): Promise<void> {
    const message: QueueMessage<J> = {
      job,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.getQueue().send(
      message,
      opts?.delaySeconds ? { delaySeconds: opts.delaySeconds } : undefined,
    );
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let _instance: CloudflareJobQueue | null = null;

export function getJobQueue(): CloudflareJobQueue {
  if (!_instance) {
    _instance = new CloudflareJobQueue(() => {
      const env = (globalThis as Record<string, unknown>).__cfEnv as Record<string, unknown>;
      if (!env?.JOB_QUEUE) {
        throw new Error("[JobQueue] CF env not available — setupBindings() not called?");
      }
      return env.JOB_QUEUE as Queue<QueueMessage>;
    });
  }
  return _instance;
}

// ─── Job Handler Registry ────────────────────────────────────────────────────
// Maps job names to handler functions. Consumed by the queue consumer.

const handlers = new Map<JobName, (payload: unknown) => Promise<void>>();

export function registerJobHandler<J extends JobName>(
  job: J,
  handler: (payload: JobMap[J]) => Promise<void>,
): void {
  handlers.set(job, handler as (payload: unknown) => Promise<void>);
}

export function getJobHandler(job: JobName): ((payload: unknown) => Promise<void>) | undefined {
  return handlers.get(job);
}
