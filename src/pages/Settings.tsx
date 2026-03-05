import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, GitMerge, XCircle, ThumbsUp, GitPullRequest, Eye, BellRing, BellOff, Info } from "lucide-react";
import { loadEmailConfig, saveEmailConfig, PRStageKey } from "@/services/emailService";

// ── Stage list ────────────────────────────────────────────────────────────────
const STAGE_META: { key: PRStageKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: "open", label: "PR Opened", icon: GitPullRequest, color: "text-primary" },
  { key: "in_review", label: "Under Review", icon: Eye, color: "text-warning" },
  { key: "approved", label: "PR Approved", icon: ThumbsUp, color: "text-success" },
  { key: "merged", label: "PR Merged 🎉", icon: GitMerge, color: "text-purple-400" },
  { key: "closed", label: "PR Closed Without Merge", icon: XCircle, color: "text-destructive" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-primary" : "bg-secondary border border-border"}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

// ── Permission badge ──────────────────────────────────────────────────────────
function PermissionBadge() {
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  const request = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPerm(result);
  };

  if (perm === "granted") {
    return (
      <div className="flex items-center gap-2 text-success text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" /> Browser notifications enabled
      </div>
    );
  }
  if (perm === "denied") {
    return (
      <div className="flex items-center gap-2 text-destructive text-xs">
        <XCircle className="w-3.5 h-3.5" /> Browser notifications blocked — enable in browser settings
      </div>
    );
  }
  return (
    <button onClick={request}
      className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline underline-offset-2">
      <BellRing className="w-3.5 h-3.5" /> Enable browser popup notifications
    </button>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [cfg, setCfg] = useState(loadEmailConfig);
  const [saved, setSaved] = useState(false);

  const toggleStage = (key: PRStageKey) => {
    const updated = { ...cfg, notifyOn: cfg.notifyOn.includes(key) ? cfg.notifyOn.filter(k => k !== key) : [...cfg.notifyOn, key] };
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
    <div className="space-y-6 w-full max-w-full">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold section-heading gradient-accent-static">Settings</h1>
        <p className="text-muted-foreground text-sm mt-2 ml-4">Configure notifications and preferences</p>
      </motion.div>

      {/* Notification Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
        className="glass-card-solid overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell style={{ width: 18, height: 18 }} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">PR Status Notifications</h3>
              <p className="text-xs text-muted-foreground">Instant alerts — no setup required</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-[11px] text-success font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Saved</span>}
            <Toggle checked={cfg.enabled} onChange={toggleEnabled} />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* How it works */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Fully automated — no configuration needed.</span>{" "}
              The app polls GitHub every 5 minutes in the background. When any PR status changes,
              you'll get an instant in-app toast and an OS browser notification automatically.
            </div>
          </div>

          {/* Browser permission */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Browser Popup Notifications</p>
              <p className="text-xs text-muted-foreground">OS-level alerts even when tab is in background</p>
            </div>
            <PermissionBadge />
          </div>

          {/* In-app toast (always on) */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">In-App Toast Alerts</p>
              <p className="text-xs text-muted-foreground">Sonner toast in bottom-right when tab is active</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Always on
            </div>
          </div>

          {/* Stage selector */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Notify me when PR status becomes…
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STAGE_META.map((s) => {
                const checked = cfg.notifyOn.includes(s.key);
                return (
                  <button key={s.key} type="button" onClick={() => toggleStage(s.key)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${checked ? "bg-primary/10 border-primary/30 text-foreground" : "bg-secondary/30 border-border text-muted-foreground hover:border-border/80"
                      }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}>
                      {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                    <span className="text-xs font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disable all */}
          {!cfg.enabled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
              <BellOff className="w-4 h-4" /> All notifications are currently disabled. Toggle on above to re-enable.
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Other preferences */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
        className="glass-card-solid p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
            <CheckCircle2 style={{ width: 18, height: 18 }} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Other Preferences</h3>
            <p className="text-xs text-muted-foreground">Data sync and digest settings</p>
          </div>
        </div>
        {[
          { label: "Auto-sync Repositories", sub: "Automatically detect new repos on load" },
          { label: "Weekly Digest", sub: "Summary of your contributions every Monday" },
        ].map((item, i) => (
          <div key={item.label} className={`flex items-center justify-between py-3 ${i < 1 ? "border-b border-border" : ""}`}>
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <Toggle checked={false} onChange={() => { }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
