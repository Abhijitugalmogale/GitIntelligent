import {
  GitPullRequest,
  GitMerge,
  Clock,
  AlertCircle,
  CircleDot,
  Trophy,
  Loader2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { useStats, usePullRequests } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";
import { motion } from "framer-motion";

// Loading skeleton row
const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded bg-secondary animate-pulse" />
      <div className="space-y-1.5">
        <div className="w-52 h-3 rounded bg-secondary animate-pulse" />
        <div className="w-28 h-2.5 rounded bg-secondary animate-pulse" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-16 h-5 rounded-full bg-secondary animate-pulse" />
      <div className="w-12 h-3 rounded bg-secondary animate-pulse" />
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
  const { stats, isLoading: statsLoading } = useStats();
  const { data: prs, isLoading: prsLoading, isError } = usePullRequests();

  const recentPRs = (prs ?? []).slice(0, 8);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold section-heading gradient-accent-static">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-2 ml-4">
              Your live contribution overview — updated in real time
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-success/10 border border-success/20 text-success px-3 py-1.5 rounded-full"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Live data
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
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

      {/* Recent PRs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-solid overflow-hidden card-top-accent"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent Pull Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest activity across all repos</p>
          </div>
          <div className="flex items-center gap-2">
            {prsLoading && (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            )}
            <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-border">
          {prsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-sm text-destructive font-medium">Failed to load pull requests.</p>
              <p className="text-xs text-muted-foreground mt-1">Check your connection and token.</p>
            </div>
          ) : recentPRs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No pull requests found.
            </div>
          ) : (
            recentPRs.map((pr, i) => (
              <motion.a
                key={pr.id}
                href={pr.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                className="flex items-center justify-between p-4 table-row-hover group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <GitPullRequest className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {pr.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{pr.repo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={pr.prStatus} />
                  <span className="text-xs text-muted-foreground w-16 text-right">{timeAgo(pr.updated_at)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
