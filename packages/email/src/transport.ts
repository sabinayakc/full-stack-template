import nodemailer from "nodemailer";

// ── Transport interface ─────────────────────────────────────────────────────

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailTransport {
  name: string;
  sendMail(options: Required<SendMailOptions>): Promise<void>;
}

// ── Cloudflare Email Service transport ──────────────────────────────────────

function getCloudflareTransport(): EmailTransport | null {
  const env = (globalThis as Record<string, unknown>).__cfEnv as
    | { EMAIL?: { send: (msg: Record<string, unknown>) => Promise<unknown> } }
    | undefined;

  if (!env?.EMAIL) return null;

  const binding = env.EMAIL;
  return {
    name: "cloudflare",
    async sendMail({ to, subject, html, from }) {
      await binding.send({ to, from, subject, html });
    },
  };
}

// ── Nodemailer SMTP transport (fallback) ────────────────────────────────────

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransport(): EmailTransport | null {
  if (!process.env.SMTP_HOST) return null;

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return {
    name: "smtp",
    async sendMail({ to, subject, html, from }) {
      await smtpTransporter!.sendMail({ from, to, subject, html });
    },
  };
}

// ── Resolve transport: CF Email → SMTP → error ─────────────────────────────

function getTransport(): EmailTransport {
  const cf = getCloudflareTransport();
  if (cf) return cf;

  const smtp = getSmtpTransport();
  if (smtp) return smtp;

  throw new Error(
    "No email transport available. Configure Cloudflare Email binding or SMTP_HOST env var.",
  );
}

// ── Worker lifecycle ────────────────────────────────────────────────────────

function cfWaitUntil(promise: Promise<unknown>) {
  const fn = (globalThis as Record<string, unknown>).__cfWaitUntil as
    | ((p: Promise<unknown>) => void)
    | undefined;
  if (fn) fn(promise);
}

// ── Public API ──────────────────────────────────────────────────────────────

const DEFAULT_FROM = process.env.SMTP_EMAIL_FROM || "App <noreply@example.com>";
const SANDBOX_MODE = process.env.SMTP_SANDBOX_MODE === "1";
const SANDBOX_EMAIL = process.env.SMTP_SANDBOX_EMAIL;

if (SANDBOX_MODE) {
  console.warn(`[email] Sandbox mode enabled — all outbound emails redirected to ${SANDBOX_EMAIL}`);
}

function resolveRecipient(to: string): string {
  if (SANDBOX_MODE && SANDBOX_EMAIL) return SANDBOX_EMAIL;
  return to;
}

export type { SendMailOptions };

/**
 * Send an email and await the result. Use when you need to know whether
 * the send succeeded (e.g. notification service updating DB status).
 */
export async function sendMail({ to, subject, html, from }: SendMailOptions) {
  const resolvedFrom = from || DEFAULT_FROM;
  const resolvedTo = resolveRecipient(to);
  const transport = getTransport();
  await transport.sendMail({ to: resolvedTo, subject, html, from: resolvedFrom });
}

/**
 * Fire-and-forget email send. The Worker stays alive via `waitUntil` but
 * the caller returns immediately. Errors are logged, never thrown.
 * Use for auth emails (verification, reset, invites).
 */
export function sendMailBackground({ to, subject, html, from }: SendMailOptions) {
  const promise = sendMail({ to, subject, html, from }).catch((err) =>
    console.error(`[email] Background send failed to ${to}:`, err),
  );
  cfWaitUntil(promise);
}
