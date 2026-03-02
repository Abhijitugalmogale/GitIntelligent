import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { usePullRequests } from "@/hooks/useGitHub";
import {
    loadEmailConfig,
    loadPRSnapshot,
    savePRSnapshot,
    sendPRStatusEmail,
    PRStageKey,
} from "@/services/emailService";
import { GitHubPR } from "@/services/githubApi";

// ── Stage display config ──────────────────────────────────────────────────────
const STAGE_DISPLAY: Record<PRStageKey, {
    emoji: string;
    label: string;
    description: string;
    toastType: "success" | "error" | "warning" | "info";
}> = {
    open: { emoji: "🟢", label: "PR Opened", description: "Your PR is now open", toastType: "info" },
    in_review: { emoji: "👀", label: "Under Review", description: "Reviewers are looking at your PR", toastType: "warning" },
    approved: { emoji: "✅", label: "PR Approved", description: "Your PR has been approved!", toastType: "success" },
    merged: { emoji: "🎉", label: "PR Merged!", description: "Your changes are now in the codebase", toastType: "success" },
    closed: { emoji: "❌", label: "PR Closed", description: "This PR was closed without merging", toastType: "error" },
};

function deriveStage(pr: GitHubPR): PRStageKey {
    if (pr.prStatus === "merged") return "merged";
    if (pr.prStatus === "closed") return "closed";
    return "in_review";
}

// ── Browser Web Notification ─────────────────────────────────────────────────
async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const result = await Notification.requestPermission();
    return result === "granted";
}

function fireBrowserNotification(pr: GitHubPR, stage: PRStageKey) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const { emoji, label } = STAGE_DISPLAY[stage];
    const n = new Notification(`${emoji} ${label} — ContributorIntel`, {
        body: `${pr.title}\n${pr.repo}`,
        icon: "https://github.githubassets.com/favicons/favicon.svg",
        tag: `pr-${pr.id}-${stage}`,  // prevents duplicate notifications for same event
    });
    n.onclick = () => { window.focus(); n.close(); };
}

// ── In-app toast ──────────────────────────────────────────────────────────────
function fireToast(pr: GitHubPR, stage: PRStageKey) {
    const { emoji, label, description, toastType } = STAGE_DISPLAY[stage];
    const shortTitle = pr.title.length > 55 ? pr.title.slice(0, 55) + "…" : pr.title;
    const repo = pr.repo.split("/")[1] ?? pr.repo;

    const toastFn = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
    }[toastType];

    toastFn(`${emoji} ${label}`, {
        description: `${shortTitle} · ${repo}`,
        duration: 6000,
        action: {
            label: "View PR",
            onClick: () => window.open(pr.html_url, "_blank"),
        },
    });
}

// ── Main hook ─────────────────────────────────────────────────────────────────
/**
 * AUTOMATED PR notification watcher.
 * - Fires on every React Query refresh (every 5 min + window focus)
 * - Shows an in-app sonner toast for each status change
 * - Shows a browser Web Notification if permission is granted
 * - Sends an EmailJS email if configured in Settings
 */
export function usePRNotifications() {
    const { data: prs, dataUpdatedAt } = usePullRequests();
    const lastProcessed = useRef<number>(0);
    const isProcessing = useRef(false);
    const permRequested = useRef(false);

    // Request browser notification permission once
    useEffect(() => {
        if (!permRequested.current) {
            permRequested.current = true;
            requestNotificationPermission();
        }
    }, []);

    const checkAndNotify = useCallback(async (prs: GitHubPR[]) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        try {
            const cfg = loadEmailConfig();
            const snapshot = loadPRSnapshot();
            const newSnapshot: Record<string, PRStageKey> = {};
            const changed: { pr: GitHubPR; stage: PRStageKey }[] = [];

            for (const pr of prs) {
                const key = String(pr.id);
                const currentStage = deriveStage(pr);
                newSnapshot[key] = currentStage;

                const prevStage = snapshot[key] as PRStageKey | undefined;
                if (prevStage && prevStage !== currentStage) {
                    changed.push({ pr, stage: currentStage });
                }
                // First-time seen: record snapshot but don't notify (avoids spam on setup)
            }

            // Persist updated snapshot
            savePRSnapshot(newSnapshot);

            for (const { pr, stage } of changed) {
                // 1️⃣ In-app sonner toast — always
                fireToast(pr, stage);

                // 2️⃣ Browser Web Notification — if permission granted
                fireBrowserNotification(pr, stage);

                // 3️⃣ Email — only if configured and this stage is in notifyOn list
                if (cfg.enabled && cfg.serviceId && cfg.templateId && cfg.publicKey && cfg.recipientEmail) {
                    if (cfg.notifyOn.includes(stage)) {
                        sendPRStatusEmail(cfg, {
                            prTitle: pr.title,
                            prRepo: pr.repo,
                            prUrl: pr.html_url,
                            prNumber: pr.number,
                            stage,
                        }).then((result) => {
                            if (!result.success) {
                                toast.error("Email send failed", { description: result.error });
                            } else {
                                toast.success("Email sent!", { description: `Notification sent to ${cfg.recipientEmail}`, duration: 3000 });
                            }
                        });
                        await new Promise((r) => setTimeout(r, 400));
                    }
                }
            }

            if (changed.length > 0) {
                console.log(
                    `[ContributorIntel] ${changed.length} PR status change(s) detected:`,
                    changed.map((c) => `"${c.pr.title}" → ${c.stage}`)
                );
            }
        } finally {
            isProcessing.current = false;
        }
    }, []);

    useEffect(() => {
        if (!prs || prs.length === 0) return;
        if (dataUpdatedAt <= lastProcessed.current) return;
        lastProcessed.current = dataUpdatedAt;
        checkAndNotify(prs);
    }, [prs, dataUpdatedAt, checkAndNotify]);
}
