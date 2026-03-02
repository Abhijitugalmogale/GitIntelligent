/**
 * Email Notification Service using EmailJS
 * https://www.emailjs.com — free tier: 200 emails/month
 *
 * Setup steps (one-time, in Settings page):
 * 1. Create a free account at emailjs.com
 * 2. Add an Email Service (Gmail, Outlook, etc.)
 * 3. Create an Email Template with these variables:
 *      {{to_email}}, {{to_name}}, {{pr_title}}, {{pr_repo}},
 *      {{pr_status}}, {{pr_url}}, {{stage_label}}, {{stage_description}}, {{app_name}}
 * 4. Copy your Service ID, Template ID, and Public Key into Settings.
 */

import emailjs from "@emailjs/browser";

// ── Config stored in localStorage ──────────────────────────────────────────
const STORAGE_KEY = "contributor_intel_email_cfg";

export interface EmailConfig {
    serviceId: string;
    templateId: string;
    publicKey: string;
    recipientEmail: string;
    recipientName: string;
    enabled: boolean;
    /** Which stage transitions trigger an email */
    notifyOn: PRStageKey[];
}

export type PRStageKey = "open" | "in_review" | "approved" | "merged" | "closed";

export const DEFAULT_CONFIG: EmailConfig = {
    serviceId: "",
    templateId: "",
    publicKey: "",
    recipientEmail: "",
    recipientName: "",
    enabled: false,
    notifyOn: ["merged", "closed", "approved"],
};

export function loadEmailConfig(): EmailConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_CONFIG;
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_CONFIG;
    }
}

export function saveEmailConfig(cfg: EmailConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

// ── Stage info ───────────────────────────────────────────────────────────────
const STAGE_INFO: Record<PRStageKey, { label: string; emoji: string; description: string; color: string }> = {
    open: {
        label: "Opened",
        emoji: "🟢",
        description: "Your pull request has been submitted and is waiting for review.",
        color: "#6366f1",
    },
    in_review: {
        label: "Under Review",
        emoji: "👀",
        description: "Reviewers are actively looking at your pull request.",
        color: "#f59e0b",
    },
    approved: {
        label: "Approved ✅",
        emoji: "✅",
        description: "Your pull request has been approved and is ready to merge.",
        color: "#22c55e",
    },
    merged: {
        label: "Merged 🎉",
        emoji: "🎉",
        description: "Congratulations! Your changes have been merged into the codebase.",
        color: "#a855f7",
    },
    closed: {
        label: "Closed ❌",
        emoji: "❌",
        description: "This pull request was closed without merging.",
        color: "#ef4444",
    },
};

// ── Send a single PR status email ────────────────────────────────────────────
export interface PREmailPayload {
    prTitle: string;
    prRepo: string;
    prUrl: string;
    prNumber?: number;
    stage: PRStageKey;
}

export async function sendPRStatusEmail(
    cfg: EmailConfig,
    payload: PREmailPayload
): Promise<{ success: boolean; error?: string }> {
    if (!cfg.enabled) return { success: false, error: "Email notifications are disabled." };
    if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
        return { success: false, error: "EmailJS is not configured. Please fill in Settings → Email Notifications." };
    }
    if (!cfg.recipientEmail) {
        return { success: false, error: "No recipient email configured." };
    }

    const info = STAGE_INFO[payload.stage];

    const templateParams = {
        to_email: cfg.recipientEmail,
        to_name: cfg.recipientName || "Contributor",
        pr_title: payload.prTitle,
        pr_repo: payload.prRepo,
        pr_url: payload.prUrl,
        pr_number: payload.prNumber ? `#${payload.prNumber}` : "",
        pr_status: info.label,
        stage_emoji: info.emoji,
        stage_description: info.description,
        stage_color: info.color,
        app_name: "ContributorIntel",
    };

    try {
        await emailjs.send(cfg.serviceId, cfg.templateId, templateParams, cfg.publicKey);
        return { success: true };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: msg };
    }
}

// ── PR status snapshot (localStorage) for change detection ─────────────────
const SNAPSHOT_KEY = "contributor_intel_pr_snapshot";

export function loadPRSnapshot(): Record<string, PRStageKey> {
    try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function savePRSnapshot(snapshot: Record<string, PRStageKey>) {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}
