import { FolderGit2, Star, GitFork, GitPullRequest, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useRepositories } from "@/hooks/useGitHub";

const langColors: Record<string, string> = {
  TypeScript: "bg-primary",
  JavaScript: "bg-yellow-400",
  Python: "bg-warning",
  Go: "bg-[hsl(192_70%_50%)]",
  Rust: "bg-orange-500",
  Java: "bg-red-500",
  Ruby: "bg-rose-500",
  "C++": "bg-blue-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-500",
};

const SkeletonCard = () => (
  <div className="glass-card-solid p-5 space-y-3">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded bg-secondary animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-3 rounded bg-secondary animate-pulse" />
        <div className="w-48 h-2.5 rounded bg-secondary animate-pulse" />
        <div className="flex gap-4 mt-3">
          <div className="w-16 h-2.5 rounded bg-secondary animate-pulse" />
          <div className="w-10 h-2.5 rounded bg-secondary animate-pulse" />
          <div className="w-10 h-2.5 rounded bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const Repositories = () => {
  const { data: repos, isLoading, isError } = useRepositories();

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Repositories you own or contribute to
            {repos && ` · ${repos.length}`}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      {isError && (
        <div className="glass-card-solid p-6 text-center text-sm text-destructive">
          Failed to load repositories.
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
              className="glass-card-solid p-5 hover:border-primary/30 transition-colors cursor-pointer block group"
            >
              <div className="flex items-start gap-3">
                <FolderGit2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground font-mono truncate">
                      {repo.full_name}
                    </h3>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {repo.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language] || "bg-muted-foreground"
                            }`}
                        />
                        {repo.language}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5" />
                      {repo.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks_count}
                    </div>
                    {repo.open_issues_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <GitPullRequest className="w-3.5 h-3.5" />
                        {repo.open_issues_count}
                      </div>
                    )}
                    {repo.private && (
                      <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                        private
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
      </div>
    </div>
  );
};

export default Repositories;
