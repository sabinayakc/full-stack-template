import type { DeletePreflightResult } from "@repo/shared";
import { confirm } from "@/components/ui/confirm-dialog";

/**
 * Shows a dialog listing the blockers that prevent a delete operation.
 * Used by account/organization deletion flows when preflight fails.
 */
export async function showPreflightBlockers(
  title: string,
  preflight: DeletePreflightResult,
): Promise<void> {
  const lines = preflight.blockers.map((b) => `• ${b.label} (${b.count})`).join("\n");
  const message = lines
    ? `The following must be resolved first:\n\n${lines}`
    : "This action cannot be completed at this time.";

  await confirm({
    title,
    message,
    confirmLabel: "OK",
    showCancel: false,
    variant: "warning",
  });
}
