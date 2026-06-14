import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudflareJobQueue, getJobHandler, registerJobHandler } from "./queue";

// ─── CloudflareJobQueue ─────────────────────────────────────────────────────

describe("CloudflareJobQueue", () => {
  it("sends a typed message envelope to the queue", async () => {
    const send = vi.fn();
    const queue = new CloudflareJobQueue(() => ({ send }) as unknown as Queue);

    await queue.dispatch("notifications.deliver", {
      notificationId: "n-1",
      organizationId: "org-1",
    });

    expect(send).toHaveBeenCalledOnce();
    const [message, opts] = send.mock.calls[0];
    expect(message).toMatchObject({
      job: "notifications.deliver",
      payload: { notificationId: "n-1", organizationId: "org-1" },
    });
    expect(message.timestamp).toBeDefined();
    expect(opts).toBeUndefined();
  });

  it("sends a payload for jobs that require one", async () => {
    const send = vi.fn();
    const queue = new CloudflareJobQueue(() => ({ send }) as unknown as Queue);

    await queue.dispatch("notifications.deliver", {
      notificationId: "n-2",
      organizationId: "org-123",
    });

    const [message] = send.mock.calls[0];
    expect(message.payload).toEqual({ notificationId: "n-2", organizationId: "org-123" });
  });

  it("passes delaySeconds option when provided", async () => {
    const send = vi.fn();
    const queue = new CloudflareJobQueue(() => ({ send }) as unknown as Queue);

    await queue.dispatch(
      "notifications.deliver",
      { notificationId: "n-3", organizationId: "org-1" },
      { delaySeconds: 30 },
    );

    const [, opts] = send.mock.calls[0];
    expect(opts).toEqual({ delaySeconds: 30 });
  });

  it("does not pass options when delaySeconds is not set", async () => {
    const send = vi.fn();
    const queue = new CloudflareJobQueue(() => ({ send }) as unknown as Queue);

    await queue.dispatch(
      "notifications.deliver",
      { notificationId: "n-4", organizationId: "org-1" },
      {},
    );

    const [, opts] = send.mock.calls[0];
    expect(opts).toBeUndefined();
  });

  it("includes an ISO timestamp in the message", async () => {
    const send = vi.fn();
    const queue = new CloudflareJobQueue(() => ({ send }) as unknown as Queue);

    const before = new Date().toISOString();
    await queue.dispatch("notifications.deliver", {
      notificationId: "n-5",
      organizationId: "org-1",
    });
    const after = new Date().toISOString();

    const [message] = send.mock.calls[0];
    expect(message.timestamp >= before).toBe(true);
    expect(message.timestamp <= after).toBe(true);
  });
});

// ─── Job Handler Registry ───────────────────────────────────────────────────

describe("Job Handler Registry", () => {
  afterEach(() => {
    // Registry is module-level state; we can't fully reset it, but tests
    // below use unique assertions so they don't conflict.
  });

  it("registers and retrieves a handler", () => {
    const handler = vi.fn();
    registerJobHandler("notifications.deliver", handler);

    const retrieved = getJobHandler("notifications.deliver");
    expect(retrieved).toBe(handler);
  });

  it("calls the handler with the correct payload", async () => {
    const handler = vi.fn();
    registerJobHandler("notifications.deliver", handler);

    const retrieved = getJobHandler("notifications.deliver")!;
    await retrieved({ notificationId: "n-6", organizationId: "org-456" });

    expect(handler).toHaveBeenCalledWith({ notificationId: "n-6", organizationId: "org-456" });
  });

  it("overwrites a previously registered handler for the same job", () => {
    const first = vi.fn();
    const second = vi.fn();

    registerJobHandler("notifications.deliver", first);
    registerJobHandler("notifications.deliver", second);

    expect(getJobHandler("notifications.deliver")).toBe(second);
  });
});
