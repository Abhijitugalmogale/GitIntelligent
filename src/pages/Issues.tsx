import { CircleDot, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";
import { useIssues } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";

const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 rounded-full bg-secondary animate-pulse" />
      <div className="space-y-1.5">
        <div className="w-52 h-3 rounded bg-secondary animate-pulse" />
        <div className="flex gap-2">
          <div className="w-24 h-2.5 rounded bg-secondary animate-pulse" />
          <div className="w-14 h-2.5 rounded bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-16 h-5 rounded bg-secondary animate-pulse" />
      <div className="w-10 h-3 rounded bg-secondary animate-pulse" />
    </div>
  </div>
);

const Issues = () => {
  const { data: issues, isLoading, isError } = useIssues();

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issues</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Issues you've created
            {issues && ` · ${issues.length} total`}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      <div className="glass-card-solid overflow-hidden divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : isError ? (
          <div className="p-6 text-center text-sm text-destructive">
            Failed to load issues.
          </div>
        ) : (issues ?? []).length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No issues found.
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
              className="flex items-center justify-between p-4 table-row-hover block"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CircleDot
                  className={`w-4 h-4 shrink-0 ${issue.state === "open" ? "text-success" : "text-muted-foreground"
                    }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {issue.repo}
                    </span>
                    {issue.labels.map((l) => (
                      <span
                        key={l.name}
                        className="text-xs px-1.5 py-0.5 rounded"
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
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={issue.state} />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {timeAgo(issue.updated_at)}
                </span>
              </div>
            </motion.a>
          ))
        )}
      </div>
    </div>
  );
};

export default Issues;
