import { useState } from "react";
import {
  GitPullRequest, Filter, ChevronDown, ChevronUp, Loader2,
  ExternalLink, GitMerge, Calendar,
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
  return "in_review";
}

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="skeleton w-8 h-8 rounded-lg" /><div className="space-y-2"><div className="skeleton w-48 h-3" /><div className="skeleton w-24 h-2.5" /></div></div></td>
    <td className="px-5 py-4"><div className="skeleton w-16 h-5 rounded-full" /></td>
    <td className="px-5 py-4"><div className="skeleton w-12 h-2.5" /></td>
    <td className="px-5 py-4"><div className="skeleton w-4 h-4 rounded" /></td>
    <td className="px-5 py-4" />
  </tr>
);

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "merged", label: "Merged" },
  { key: "closed", label: "Closed" },
];

const PullRequests = () => {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { data: prs, isLoading, isError } = usePullRequests();

  const filtered =
    filter === "all" ? (prs ?? []) : (prs ?? []).filter((pr) => pr.prStatus === filter);

  const counts = {
    open: (prs ?? []).filter((p) => p.prStatus === "open").length,
    merged: (prs ?? []).filter((p) => p.prStatus === "merged").length,
    closed: (prs ?? []).filter((p) => p.prStatus === "closed").length,
  };

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Pull Requests</h1>
          <p className="page-subtitle">
            Track and manage your contributions
            {prs && ` · ${prs.length} total`}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`pill-tab ${filter === tab.key ? "pill-tab-active" : ""}`}
          >
            {tab.label}
            {tab.key !== "all" && prs && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${filter === tab.key ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-solid overflow-hidden card-top-accent"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">PR Title</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Updated</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Link</th>
                <th className="w-10" />
              </tr>
            </thead>
            <LayoutGroup>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-destructive">Failed to load pull requests.</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center">
                    <GitPullRequest className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No pull requests found.</p>
                  </td></tr>
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
                          className={`table-row-hover group cursor-pointer ${expandedId === pr.id ? "bg-secondary/40" : ""}`}
                          onClick={() => setExpandedId(expandedId === pr.id ? null : pr.id)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors
                                ${pr.prStatus === "merged"
                                  ? "bg-violet-500/10 border-violet-500/20"
                                  : pr.prStatus === "open"
                                    ? "bg-primary/10 border-primary/20 group-hover:bg-primary/20"
                                    : "bg-muted border-border"
                                }`}>
                                <GitPullRequest className={`w-3.5 h-3.5 ${pr.prStatus === "merged" ? "text-violet-400"
                                    : pr.prStatus === "open" ? "text-primary"
                                      : "text-muted-foreground"
                                  }`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">{pr.title}</p>
                                <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{pr.repo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={pr.prStatus} /></td>
                          <td className="px-5 py-4 text-xs text-muted-foreground tabular-nums">{timeAgo(pr.updated_at)}</td>
                          <td className="px-5 py-4">
                            <a href={pr.html_url} target="_blank" rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                          <td className="px-5 py-4">
                            {expandedId === pr.id
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </td>
                        </motion.tr>

                        {/* Expanded panel */}
                        <AnimatePresence>
                          {expandedId === pr.id && (
                            <motion.tr key={`detail-${pr.id}`}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <td colSpan={5} className="px-5 py-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="py-5 space-y-4">
                                    {/* Meta */}
                                    <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <GitMerge className="w-3.5 h-3.5" />
                                        <span className="font-mono text-foreground">{pr.repo}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Opened {timeAgo(pr.created_at)}
                                      </div>
                                    </div>

                                    {/* Progress tracker */}
                                    <div className="rounded-xl border border-border p-5" style={{ background: "hsl(var(--secondary) / 0.3)" }}>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5">PR Lifecycle Tracker</p>
                                      <PRProgressBar
                                        currentStage={deriveStage(pr)}
                                        stageDates={{ open: pr.created_at, merged: pr.merged_at ?? undefined }}
                                        size="lg"
                                      />
                                    </div>

                                    {/* Action */}
                                    <div>
                                      <a href={pr.html_url} target="_blank" rel="noreferrer" className="btn-primary text-xs">
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
      </motion.div>
    </div>
  );
};

export default PullRequests;
