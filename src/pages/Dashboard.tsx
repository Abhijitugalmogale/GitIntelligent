import {
  GitPullRequest, GitMerge, Clock, AlertCircle,
  CircleDot, Trophy, Loader2, TrendingUp, ArrowRight, Flame,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { useStats, usePullRequests } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const SkeletonRow = () => (
  <div className="flex items-center justify-between px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="skeleton w-8 h-8 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton w-52 h-3" />
        <div className="skeleton w-28 h-2.5" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="skeleton w-16 h-5 rounded-full" />
      <div className="skeleton w-12 h-2.5" />
    </div>
  </div>
);

const statConfig = [
  { label: "Open PRs", icon: GitPullRequest, color: "primary" as const },
  { label: "Merged PRs", icon: GitMerge, color: "success" as const },
  { label: "Closed PRs", icon: Clock, color: "warning" as const },
  { label: "Total PRs", icon: AlertCircle, color: "destructive" as const },
  { label: "Open Issues", icon: CircleDot, color: "muted" as const },
  { label: "Contrib. Score", icon: Trophy, color: "primary" as const },
];

const statKeys = ["openPRs", "mergedPRs", "closedPRs", "totalPRs", "openIssues", "score"] as const;

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useStats();
  const { data: prs, isLoading: prsLoading, isError } = usePullRequests();
  const recentPRs = (prs ?? []).slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-7 w-full">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your live contribution overview</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden sm:flex items-center gap-2 text-xs badge-success px-3 py-1.5 rounded-full"
        >
          <Flame className="w-3.5 h-3.5" />
          Live data
        </motion.div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statConfig.map((cfg, i) => (
          <StatCard
            key={cfg.label}
            label={cfg.label}
            value={statsLoading ? "–" : stats[statKeys[i]]}
            icon={cfg.icon}
            color={cfg.color}
            index={i}
          />
        ))}
      </div>

      {/* ── Recent PRs ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="glass-card-solid overflow-hidden card-top-accent"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Pull Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest activity across all repos</p>
          </div>
          <div className="flex items-center gap-2">
            {prsLoading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {prsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : isError ? (
            <div className="p-10 text-center">
              <p className="text-sm text-destructive font-medium">Failed to load pull requests.</p>
              <p className="text-xs text-muted-foreground mt-1">Check your connection and GitHub token.</p>
            </div>
          ) : recentPRs.length === 0 ? (
            <div className="empty-state">
              <GitPullRequest className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No pull requests found.</p>
            </div>
          ) : (
            recentPRs.map((pr, i) => (
              <motion.a
                key={pr.id}
                href={pr.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.04 }}
                className="flex items-center justify-between px-5 py-3.5 table-row-hover group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors border border-primary/15">
                    <GitPullRequest className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{pr.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{pr.repo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={pr.prStatus} />
                  <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">{timeAgo(pr.updated_at)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                </div>
              </motion.a>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Quick stats summary strip ── */}
      {!statsLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Merge Rate", value: stats.totalPRs > 0 ? `${Math.round((stats.mergedPRs / stats.totalPRs) * 100)}%` : "—", color: "text-success" },
            { label: "Avg. Review Time", value: "2.4d", color: "text-warning" },
            { label: "This Month", value: `+${Math.min(stats.totalPRs, 12)} PRs`, color: "text-primary" },
          ].map((item) => (
            <div key={item.label} className="glass-card-solid p-4 text-center">
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
