import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudflareWorkflowService } from "./service";

describe("CloudflareWorkflowService", () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).__cfEnv;
  });

  it("throws when __cfEnv is not set", async () => {
    const service = new CloudflareWorkflowService();

    await expect(service.start("example", {})).rejects.toThrow("CF env not available");
  });

  it("throws when the workflow binding is missing", async () => {
    (globalThis as Record<string, unknown>).__cfEnv = {};

    const service = new CloudflareWorkflowService();

    await expect(service.start("example", {})).rejects.toThrow('No binding "EXAMPLE_WORKFLOW"');
  });

  it("calls binding.create with params and returns the instance id", async () => {
    const create = vi.fn().mockResolvedValue({ id: "wf-abc-123" });
    (globalThis as Record<string, unknown>).__cfEnv = {
      EXAMPLE_WORKFLOW: { create },
    };

    const service = new CloudflareWorkflowService();
    const result = await service.start("example", {});

    expect(create).toHaveBeenCalledWith({ params: {} });
    expect(result).toEqual({ id: "wf-abc-123" });
  });

  it("maps workflow name to correct binding (SCREAMING_SNAKE_CASE + _WORKFLOW)", async () => {
    const create = vi.fn().mockResolvedValue({ id: "wf-ex-456" });
    (globalThis as Record<string, unknown>).__cfEnv = {
      EXAMPLE_WORKFLOW: { create },
    };

    const service = new CloudflareWorkflowService();
    const params = { message: "hello" };

    const result = await service.start("example", params);

    expect(create).toHaveBeenCalledWith({ params });
    expect(result).toEqual({ id: "wf-ex-456" });
  });

  describe("pause", () => {
    it("calls instance.pause() on the correct binding", async () => {
      const pause = vi.fn();
      const get = vi.fn().mockResolvedValue({ pause });
      (globalThis as Record<string, unknown>).__cfEnv = {
        EXAMPLE_WORKFLOW: { get },
      };

      const service = new CloudflareWorkflowService();
      await service.pause("example", "wf-abc-123");

      expect(get).toHaveBeenCalledWith("wf-abc-123");
      expect(pause).toHaveBeenCalledOnce();
    });

    it("throws when binding is missing", async () => {
      (globalThis as Record<string, unknown>).__cfEnv = {};

      const service = new CloudflareWorkflowService();
      await expect(service.pause("example", "wf-1")).rejects.toThrow(
        'No binding "EXAMPLE_WORKFLOW"',
      );
    });
  });

  describe("resume", () => {
    it("calls instance.resume() on the correct binding", async () => {
      const resume = vi.fn();
      const get = vi.fn().mockResolvedValue({ resume });
      (globalThis as Record<string, unknown>).__cfEnv = {
        EXAMPLE_WORKFLOW: { get },
      };

      const service = new CloudflareWorkflowService();
      await service.resume("example", "wf-abc-123");

      expect(get).toHaveBeenCalledWith("wf-abc-123");
      expect(resume).toHaveBeenCalledOnce();
    });
  });

  describe("terminate", () => {
    it("calls instance.terminate() on the correct binding", async () => {
      const terminate = vi.fn();
      const get = vi.fn().mockResolvedValue({ terminate });
      (globalThis as Record<string, unknown>).__cfEnv = {
        EXAMPLE_WORKFLOW: { get },
      };

      const service = new CloudflareWorkflowService();
      await service.terminate("example", "wf-abc-123");

      expect(get).toHaveBeenCalledWith("wf-abc-123");
      expect(terminate).toHaveBeenCalledOnce();
    });
  });

  describe("restart", () => {
    it("calls instance.restart() on the correct binding", async () => {
      const restart = vi.fn();
      const get = vi.fn().mockResolvedValue({ restart });
      (globalThis as Record<string, unknown>).__cfEnv = {
        EXAMPLE_WORKFLOW: { get },
      };

      const service = new CloudflareWorkflowService();
      await service.restart("example", "wf-abc-123");

      expect(get).toHaveBeenCalledWith("wf-abc-123");
      expect(restart).toHaveBeenCalledOnce();
    });
  });
});
