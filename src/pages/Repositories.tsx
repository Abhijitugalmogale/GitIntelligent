import { FolderGit2, Star, GitFork, GitPullRequest, Loader2, ExternalLink, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useRepositories } from "@/hooks/useGitHub";

const langDotColor: Record<string, string> = {
  TypeScript: "#3b82f6",
  JavaScript: "#fbbf24",
  Python: "#f59e0b",
  Go: "#06b6d4",
  Rust: "#f97316",
  Java: "#ef4444",
  Ruby: "#f43f5e",
  "C++": "#3b82f6",
  Swift: "#fb923c",
  Kotlin: "#a855f7",
};

const SkeletonCard = () => (
  <div className="glass-card-solid p-5 space-y-4">
    <div className="flex items-start gap-3">
      <div className="skeleton w-5 h-5 mt-0.5 rounded" />
      <div className="flex-1 space-y-2">
        <div className="skeleton w-36 h-3.5" />
        <div className="skeleton w-52 h-2.5" />
        <div className="flex gap-4 mt-3">
          <div className="skeleton w-16 h-2.5" />
          <div className="skeleton w-10 h-2.5" />
          <div className="skeleton w-10 h-2.5" />
        </div>
      </div>
    </div>
  </div>
);

const Repositories = () => {
  const { data: repos, isLoading, isError } = useRepositories();

  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Repositories</h1>
          <p className="page-subtitle">
            Repos you own or contribute to
            {repos && ` · ${repos.length} repos`}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      {isError && (
        <div className="glass-card-solid p-6 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load repositories.</p>
          <p className="text-xs text-muted-foreground mt-1">Check your connection and token.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : (repos ?? []).map((repo, i) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="glass-card-solid glow-card p-5 cursor-pointer block group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/15 transition-colors">
                  <FolderGit2 className="w-4.5 h-4.5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground font-mono truncate group-hover:text-primary transition-colors">
                        {repo.full_name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {repo.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      {repo.private
                        ? <span className="badge badge-muted"><Lock className="w-2.5 h-2.5" /> Private</span>
                        : <span className="badge badge-success"><Globe className="w-2.5 h-2.5" /> Public</span>
                      }
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{ backgroundColor: langDotColor[repo.language] || "#6b7280" }}
                        />
                        {repo.language}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3" />
                      {repo.stargazers_count.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="w-3 h-3" />
                      {repo.forks_count.toLocaleString()}
                    </div>
                    {repo.open_issues_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitPullRequest className="w-3 h-3" />
                        {repo.open_issues_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
      </div>

      {/* Empty state */}
      {!isLoading && !isError && (repos ?? []).length === 0 && (
        <div className="empty-state">
          <FolderGit2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No repositories found.</p>
        </div>
      )}
    </div>
  );
};

export default Repositories;
