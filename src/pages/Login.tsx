import { motion } from "framer-motion";
import {
  GitPullRequest, Star, GitFork, Eye, Lock,
  CheckCircle2, Globe, Shield, Zap, Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ── Animated GitHub stat ticker ───────────────────────────────────────────────
const STATS = [
  { icon: GitPullRequest, label: "PRs Tracked", value: "2.4M+", color: "#7c3aed" },
  { icon: Star, label: "Stars Indexed", value: "18M+", color: "#f59e0b" },
  { icon: GitFork, label: "Repos", value: "820K+", color: "#10b981" },
  { icon: Activity, label: "Live Events", value: "99.9%", color: "#6366f1" },
];

// ── Feature bullets on left panel ─────────────────────────────────────────────
const FEATURES = [
  { icon: GitPullRequest, text: "Track all your PRs across every repo" },
  { icon: Eye, text: "Flipkart-style status tracker — open to merged" },
  { icon: Zap, text: "Automated browser notifications on status change" },
  { icon: Globe, text: "Live analytics dashboard with real GitHub data" },
  { icon: Shield, text: "All tokens stored securely — never sent to a server" },
];

// ── Floating code card (decorative) ──────────────────────────────────────────
function CodeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl overflow-hidden shadow-2xl max-w-sm mb-6 pointer-events-none"
      style={{ background: "rgba(13,17,23,0.7)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[10px] text-white/30 font-mono">pr-tracker.ts</span>
      </div>
      <div className="px-4 py-3 font-mono text-[11px] leading-relaxed">
        <p><span className="text-purple-400">const</span> <span className="text-blue-300">status</span> <span className="text-white/50">=</span> <span className="text-green-300">"merged"</span> 🎉</p>
        <p><span className="text-purple-400">await</span> <span className="text-yellow-300">notify</span><span className="text-white/50">(</span>pr<span className="text-white/50">,</span> status<span className="text-white/50">)</span></p>
        <p className="text-white/20 mt-1">// ✅ Email + Toast + Browser popup</p>
      </div>
    </motion.div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────────
const Login = () => {
  const { loginWithGitHub } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "#0d1117" }}>

      {/* ── LEFT — GitHub-themed panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 60%, #1a1f2e 100%)" }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#58a6ff 1px, transparent 1px), linear-gradient(90deg, #58a6ff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Gradient blob */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #1f6feb 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #1f6feb)" }}>
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">ContributorIntel</p>
              <p className="text-[11px]" style={{ color: "#58a6ff" }}>GitHub Intelligence Dashboard</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mb-10">
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Your GitHub activity,<br />
              <span style={{ background: "linear-gradient(90deg, #7c3aed, #58a6ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                beautifully tracked.
              </span>
            </h1>
            <p style={{ color: "#8b949e" }} className="text-sm leading-relaxed max-w-sm">
              Track PRs across all repos, get automated notifications on status changes, and analyze your contribution patterns — all from one dashboard.
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-3 mb-10">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(88,166,255,0.1)", border: "1px solid rgba(88,166,255,0.15)" }}>
                  <f.icon className="w-3.5 h-3.5" style={{ color: "#58a6ff" }} />
                </div>
                <span className="text-sm" style={{ color: "#c9d1d9" }}>{f.text}</span>
              </motion.div>
            ))}
          </div>

          <CodeCard />

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="grid grid-cols-4 gap-3 mt-auto pt-4">
            {STATS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.06 }}
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                <p className="text-white font-bold text-sm">{s.value}</p>
                <p className="text-[10px]" style={{ color: "#8b949e" }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── RIGHT — Login form ── */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#0d1117" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #1f6feb)" }}>
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-bold text-lg">ContributorIntel</p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Sign in</h2>
            <p style={{ color: "#8b949e" }} className="text-sm">
              Connect your GitHub account to get started
            </p>
          </div>

          <div className="space-y-4">
            <motion.button
              type="button"
              onClick={loginWithGitHub}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity shadow-lg"
              style={{ background: "#2ea043", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <GitFork className="w-5 h-5" /> Sign in with GitHub
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 flex flex-col gap-3" style={{ borderTop: "1px solid #21262d" }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#8b949e" }}>
              <Lock className="w-3.5 h-3.5" style={{ color: "#3fb950" }} />
              Secure OAuth authentication
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#8b949e" }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#3fb950" }} />
              Automated notifications — zero setup required
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
