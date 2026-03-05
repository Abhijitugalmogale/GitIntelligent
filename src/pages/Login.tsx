import { motion } from "framer-motion";
import {
  GitPullRequest, Star, GitFork, Eye, Lock,
  CheckCircle2, Globe, Shield, Zap, Activity, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STATS = [
  { icon: GitPullRequest, label: "PRs Tracked", value: "2.4M+", color: "#818cf8" },
  { icon: Star, label: "Stars Indexed", value: "18M+", color: "#fbbf24" },
  { icon: GitFork, label: "Repos", value: "820K+", color: "#34d399" },
  { icon: Activity, label: "Uptime", value: "99.9%", color: "#a78bfa" },
];

const FEATURES = [
  { icon: GitPullRequest, text: "Track all PRs across every repository" },
  { icon: Eye, text: "Status tracker — open to merged" },
  { icon: Zap, text: "Automated notifications on status change" },
  { icon: Globe, text: "Live analytics with real GitHub data" },
  { icon: Shield, text: "Secure OAuth — no tokens stored" },
];

function FloatingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden shadow-2xl max-w-xs pointer-events-none"
      style={{
        background: "rgba(13,17,27,0.8)",
        border: "1px solid rgba(129,140,248,0.18)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "rgba(129,140,248,0.1)" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-[10px] text-white/30 font-mono">contributor-tracker.ts</span>
      </div>

      {/* Code */}
      <div className="px-5 py-4 font-mono text-[11px] leading-7 space-y-0.5">
        <p><span className="text-violet-400">const</span> <span className="text-blue-300">pr</span> <span className="text-white/40">=</span> <span className="text-white/60">await</span> <span className="text-emerald-400">github</span><span className="text-white/40">.</span><span className="text-yellow-300">getPR</span><span className="text-white/40">(</span><span className="text-orange-300">123</span><span className="text-white/40">)</span></p>
        <p><span className="text-violet-400">const</span> <span className="text-blue-300">status</span> <span className="text-white/40">=</span> <span className="text-emerald-300">"merged"</span> <span className="text-white/50">🎉</span></p>
        <p><span className="text-white/60">await</span> <span className="text-yellow-300">notify</span><span className="text-white/40">(</span><span className="text-blue-300">pr</span><span className="text-white/40">,</span> <span className="text-blue-300">status</span><span className="text-white/40">)</span></p>
        <p className="text-white/25 text-[10px]">// ✅ Toast + Browser popup</p>
      </div>

      {/* Status pill */}
      <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-emerald-300 font-medium">Tracking 12 repositories</span>
      </div>
    </motion.div>
  );
}

const Login = () => {
  const { loginWithGitHub } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "#07090f" }}>

      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-[58%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0d18 0%, #0f1320 50%, #111827 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(#818cf8 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Glowing blobs */}
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(80px)" }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none tracking-tight">ContributorIntel</p>
              <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#818cf8" }}>GitHub Intelligence Dashboard</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>
              <Sparkles className="w-3 h-3" /> Now with smart notifications
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
              Your GitHub activity,<br />
              <span style={{ background: "linear-gradient(90deg, #818cf8, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                beautifully tracked.
              </span>
            </h1>
            <p className="text-[15px] leading-relaxed max-w-md" style={{ color: "#94a3b8" }}>
              Track PRs across all repos, get automated notifications on status changes, and analyze contribution patterns — all from one dashboard.
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-2.5 mb-10">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <f.icon className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
                </div>
                <span className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{f.text}</span>
              </motion.div>
            ))}
          </div>

          <FloatingCard />

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
            className="grid grid-cols-4 gap-3 mt-auto pt-6">
            {STATS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.06 }}
                className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color }} />
                <p className="text-white font-bold text-sm">{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL — Sign In ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative"
        style={{ background: "#07090f" }}>
        {/* subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.04), transparent)" }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[360px] relative"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-bold text-xl tracking-tight">ContributorIntel</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back 👋</h2>
              <p style={{ color: "#64748b" }} className="text-sm leading-relaxed">
                Connect your GitHub account to access your personalized contribution dashboard.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={loginWithGitHub}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 0 30px -8px rgba(99,102,241,0.6)",
                border: "1px solid rgba(129,140,248,0.3)",
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </motion.button>

            <div className="mt-6 space-y-2.5">
              {[
                { icon: Lock, text: "Secure OAuth 2.0 authentication" },
                { icon: CheckCircle2, text: "No password stored, ever" },
                { icon: Globe, text: "Read-only access by default" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs" style={{ color: "#475569" }}>
                  <item.icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#34d399" }} />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#334155" }}>
            By signing in you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "#818cf8" }}>Terms</span>
            {" "}and{" "}
            <span className="underline cursor-pointer" style={{ color: "#818cf8" }}>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
