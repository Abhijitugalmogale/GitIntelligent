import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, CheckCircle2, GitMerge, XCircle, ThumbsUp, GitPullRequest,
  Eye, BellRing, BellOff, Info, Sliders
} from "lucide-react";
import { loadEmailConfig, saveEmailConfig, PRStageKey } from "@/services/emailService";

const STAGE_META: { key: PRStageKey; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "open", label: "PR Opened", icon: GitPullRequest, color: "text-primary", bg: "bg-primary/10 border-primary/25" },
  { key: "in_review", label: "Under Review", icon: Eye, color: "text-warning", bg: "bg-warning/10 border-warning/25" },
  { key: "approved", label: "PR Approved", icon: ThumbsUp, color: "text-success", bg: "bg-success/10 border-success/25" },
  { key: "merged", label: "PR Merged 🎉", icon: GitMerge, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/25" },
  { key: "closed", label: "PR Closed without Merge", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/25" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30
        ${checked ? "bg-primary shadow-sm shadow-primary/40" : "bg-secondary border border-border"}`}
      style={{ height: "22px" }}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function PermissionBadge() {
  const [perm, setPerm] = useState<NotificationPermission>("default");
  useEffect(() => { if ("Notification" in window) setPerm(Notification.permission); }, []);
  const request = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPerm(result);
  };

  if (perm === "granted") return (
    <div className="badge-success px-2.5 py-1">
      <CheckCircle2 className="w-3 h-3" /> Enabled
    </div>
  );
  if (perm === "denied") return (
    <div className="badge-destructive px-2.5 py-1">
      <XCircle className="w-3 h-3" /> Blocked in browser
    </div>
  );
  return (
    <button onClick={request} className="btn-secondary text-xs py-1.5 px-3">
      <BellRing className="w-3.5 h-3.5 text-primary" /> Enable
    </button>
  );
}

const SettingsPage = () => {
  const [cfg, setCfg] = useState(loadEmailConfig);
  const [saved, setSaved] = useState(false);

  const toggleStage = (key: PRStageKey) => {
    const updated = {
      ...cfg,
      notifyOn: cfg.notifyOn.includes(key)
        ? cfg.notifyOn.filter(k => k !== key)
        : [...cfg.notifyOn, key],
    };
    setCfg(updated);
    saveEmailConfig(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleEnabled = (v: boolean) => {
    const updated = { ...cfg, enabled: v };
    setCfg(updated);
    saveEmailConfig(updated);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure notifications and preferences</p>
      </motion.div>

      {/* ── Notification Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-card-solid overflow-hidden card-top-accent"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">PR Status Notifications</h3>
              <p className="text-xs text-muted-foreground">Instant alerts — no extra setup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="badge-success text-[11px] px-2 py-0.5"
              >
                <CheckCircle2 className="w-3 h-3" /> Saved
              </motion.span>
            )}
            <Toggle checked={cfg.enabled} onChange={toggleEnabled} />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Info banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Fully automated. </span>
              The app polls GitHub every 5 minutes in the background. When any PR status changes,
              you'll get an instant in-app toast and OS browser notification automatically.
            </p>
          </div>

          {/* Rows */}
          <div className="space-y-0 divide-y divide-border">
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">Browser Popup Notifications</p>
                <p className="text-xs text-muted-foreground">OS-level alerts even when the tab is in background</p>
              </div>
              <PermissionBadge />
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">In-App Toast Alerts</p>
                <p className="text-xs text-muted-foreground">Sonner toasts while the tab is active</p>
              </div>
              <div className="badge-success px-2.5 py-1">
                <CheckCircle2 className="w-3 h-3" /> Always on
              </div>
            </div>
          </div>

          {/* Stage selector */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Notify me when PR status becomes…
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STAGE_META.map((s) => {
                const checked = cfg.notifyOn.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleStage(s.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${checked
                        ? `${s.bg} text-foreground`
                        : "bg-secondary/30 border-border text-muted-foreground hover:border-border/80"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"
                      }`}>
                      {checked && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                    <span className="text-[13px] font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disabled banner */}
          {!cfg.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground"
            >
              <BellOff className="w-4 h-4" />
              All notifications are currently disabled. Toggle on above to re-enable.
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Preferences Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="glass-card-solid overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
            <Sliders className="w-4.5 h-4.5 text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Other Preferences</h3>
            <p className="text-xs text-muted-foreground">Data sync and digest settings</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {[
            { label: "Auto-sync Repositories", sub: "Automatically detect new repos on load" },
            { label: "Weekly Digest", sub: "Contribution summary every Monday" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
              <Toggle checked={false} onChange={() => { }} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
