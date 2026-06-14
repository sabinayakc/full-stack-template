import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { setupBindings } from "@repo/workflows";
import type { Bindings } from "@/types/bindings";

/**
 * Example durable workflow. Replace with real multi-step background work.
 * Each `step.do` is independently retried and its result persisted by the
 * Cloudflare Workflows engine.
 */
export class ExampleWorkflow extends WorkflowEntrypoint<Bindings> {
  async run(event: WorkflowEvent<{ message?: string }>, step: WorkflowStep) {
    const greeting = await step.do("first-step", async () => {
      setupBindings(this.env);
      return `Hello, ${event.payload.message ?? "world"}`;
    });

    await step.sleep("wait", "5 seconds");

    return { greeting };
  }
}
