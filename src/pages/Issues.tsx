import { CircleDot, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
import { useIssues } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";

const SkeletonRow = () => (
  <div className="flex items-center justify-between px-5 py-4">
    <div className="flex items-center gap-3">
      <div className="skeleton w-4 h-4 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton w-56 h-3" />
        <div className="flex gap-2">
          <div className="skeleton w-24 h-2.5" />
          <div className="skeleton w-14 h-2.5 rounded-full" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="skeleton w-16 h-5 rounded-full" />
      <div className="skeleton w-10 h-2.5" />
    </div>
  </div>
);

const Issues = () => {
  const { data: issues, isLoading, isError } = useIssues();
  const openCount = (issues ?? []).filter(i => i.state === "open").length;
  const closedCount = (issues ?? []).filter(i => i.state === "closed").length;

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Issues</h1>
          <p className="page-subtitle">
            Issues you've opened or are assigned to
            {issues && ` · ${issues.length} total`}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      {/* Summary Pills */}
      {!isLoading && issues && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2.5 flex-wrap"
        >
          <div className="badge-success px-3 py-1.5 text-sm font-semibold">
            <CircleDot className="w-3.5 h-3.5" />
            {openCount} Open
          </div>
          <div className="badge-muted px-3 py-1.5 text-sm font-semibold">
            <CircleDot className="w-3.5 h-3.5" />
            {closedCount} Closed
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-solid overflow-hidden card-top-accent"
      >
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : isError ? (
            <div className="empty-state">
              <p className="text-sm text-destructive font-medium">Failed to load issues.</p>
              <p className="text-xs text-muted-foreground mt-1">Check your connection and token.</p>
            </div>
          ) : (issues ?? []).length === 0 ? (
            <div className="empty-state">
              <CircleDot className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No issues found.</p>
            </div>
          ) : (
            (issues ?? []).map((issue, i) => (
              <motion.a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="flex items-center justify-between px-5 py-3.5 table-row-hover group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CircleDot
                    className={`w-4 h-4 shrink-0 ${issue.state === "open" ? "text-success" : "text-muted-foreground/50"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{issue.repo}</span>
                      {issue.labels.map((l) => (
                        <span
                          key={l.name}
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `#${l.color}22`,
                            color: `#${l.color}`,
                            border: `1px solid #${l.color}44`,
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <StatusBadge status={issue.state} />
                  <span className="text-xs text-muted-foreground w-14 text-right tabular-nums">{timeAgo(issue.updated_at)}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
              </motion.a>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Issues;
