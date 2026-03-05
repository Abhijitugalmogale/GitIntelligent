import { useState } from "react";
import {
  GitPullRequest, Filter, ChevronDown, ChevronUp, Loader2,
  ExternalLink, GitMerge, MessageSquare, Calendar,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
import PRProgressBar from "@/components/PRProgressBar";
import { usePullRequests } from "@/hooks/useGitHub";
import { timeAgo, GitHubPR } from "@/services/githubApi";

type FilterStatus = "all" | "open" | "merged" | "closed";
type PRStage = "open" | "in_review" | "approved" | "merged" | "closed";

function deriveStage(pr: GitHubPR): PRStage {
  if (pr.prStatus === "merged") return "merged";
  if (pr.prStatus === "closed") return "closed";
  // open PRs: if draft heuristic — treat as in_review for now
  return "in_review";
}

const SkeletonRow = () => (
  <tr>
    <td className="p-4"><div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-secondary animate-pulse shrink-0" /><div className="w-48 h-3 rounded bg-secondary animate-pulse" /></div></td>
    <td className="p-4"><div className="w-28 h-3 rounded bg-secondary animate-pulse" /></td>
    <td className="p-4"><div className="w-16 h-5 rounded bg-secondary animate-pulse" /></td>
    <td className="p-4"><div className="w-12 h-3 rounded bg-secondary animate-pulse" /></td>
    <td className="p-4" /><td className="p-4" />
  </tr>
);

const PullRequests = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: prs, isLoading, isError } = usePullRequests();

  const filtered =
    filter === "all"
      ? (prs ?? [])
      : (prs ?? []).filter((pr) => pr.prStatus === filter);

  const counts = {
    open: (prs ?? []).filter((p) => p.prStatus === "open").length,
    merged: (prs ?? []).filter((p) => p.prStatus === "merged").length,
    closed: (prs ?? []).filter((p) => p.prStatus === "closed").length,
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold section-heading gradient-accent-static">Pull Requests</h1>
          <p className="text-muted-foreground text-sm mt-1 ml-4">
            Track and manage your contributions
            {prs && ` · ${prs.length} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "open", "merged", "closed"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && prs && (
                <span className={`ml-1.5 px-1.5 rounded-full text-[10px] font-bold ${filter === f ? "bg-white/20" : "bg-background/60"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">PR Title</th>
                <th className="text-left p-4 font-medium">Repository</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Activity</th>
                <th className="text-left p-4 font-medium">Link</th>
                <th className="w-10" />
              </tr>
            </thead>
            <LayoutGroup>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr><td colSpan={6} className="p-6 text-center text-sm text-destructive">Failed to load pull requests.</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No pull requests found.</td></tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((pr) => (
                      <>
                        {/* Main row */}
                        <motion.tr
                          key={pr.id}
                          layout
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.2 }}
                          className={`table-row-hover group cursor-pointer ${expandedId === pr.id ? "bg-secondary/30" : ""}`}
                          onClick={() => setExpandedId(expandedId === pr.id ? null : pr.id)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <GitPullRequest className={`w-4 h-4 shrink-0 ${pr.prStatus === "merged" ? "text-[hsl(285_70%_63%)]"
                                : pr.prStatus === "open" ? "text-primary"
                                  : "text-muted-foreground"
                                }`} />
                              <span className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                {pr.title}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-muted-foreground max-w-[160px] truncate">
                            {pr.repo}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={pr.prStatus} />
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">{timeAgo(pr.updated_at)}</td>
                          <td className="p-4">
                            <a
                              href={pr.html_url} target="_blank" rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                          <td className="p-4">
                            {expandedId === pr.id
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                          </td>
                        </motion.tr>

                        {/* ── Expanded Flipkart Tracker Panel ── */}
                        <AnimatePresence>
                          {expandedId === pr.id && (
                            <motion.tr
                              key={`detail-${pr.id}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan={6} className="px-6 py-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="py-6 space-y-5">
                                    {/* PR Meta info row */}
                                    <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <GitMerge className="w-3.5 h-3.5" />
                                        <span className="font-mono text-foreground">{pr.repo}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Opened {timeAgo(pr.created_at)}
                                      </div>
                                    </div>

                                    {/* Flipkart-style tracker — full width */}
                                    <div
                                      className="rounded-2xl border border-border p-6"
                                      style={{ background: "hsl(var(--secondary) / 0.25)" }}
                                    >
                                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">
                                        PR Lifecycle Tracker
                                      </p>
                                      <PRProgressBar
                                        currentStage={deriveStage(pr)}
                                        stageDates={{
                                          open: pr.created_at,
                                          merged: pr.merged_at ?? undefined,
                                        }}
                                        size="lg"
                                      />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2">
                                      <a
                                        href={pr.html_url} target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 btn-gradient text-white text-xs font-semibold px-4 py-2 rounded-xl"
                                      >
                                        View on GitHub <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </LayoutGroup>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PullRequests;
