import { useState, useCallback } from "react";
import {
    Search,
    GitFork,
    Star,
    Eye,
    AlertCircle,
    Users,
    Code2,
    ExternalLink,
    Calendar,
    Scale,
    Package,
    Loader2,
    ChevronDown,
    Link2,
    Trophy,
    MessageSquare,
    CircleDot,
    CheckCircle2,
    BookOpen,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseRepoInput } from "@/services/githubApi";
import { useRepoDetails, useRepoIssues, useRepoContributors } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";
import StatusBadge from "@/components/StatusBadge";

const langColors: Record<string, string> = {
    TypeScript: "#3178C6",
    JavaScript: "#F7DF1E",
    Python: "#3572A5",
    Go: "#00ADD8",
    Rust: "#dea584",
    Java: "#B07219",
    Ruby: "#701516",
    "C++": "#F34B7D",
    Swift: "#FA7343",
    Kotlin: "#A97BFF",
    PHP: "#4F5D95",
    "C#": "#239120",
    Dart: "#00B4AB",
    Scala: "#DC322F",
    Shell: "#89E051",
};

function StatPill({
    icon: Icon,
    label,
    value,
    color = "text-muted-foreground",
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: string;
}) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50">
            <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-semibold text-foreground ml-auto">{value}</span>
        </div>
    );
}

// ─── Repo Header Card ──────────────────────────────────────────────────────────
function RepoInfoCard({ owner, repo }: { owner: string; repo: string }) {
    const { data, isLoading, error } = useRepoDetails(owner, repo);

    if (isLoading)
        return (
            <div className="glass-card-solid card-top-accent p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Fetching repository info…</span>
            </div>
        );

    if (error)
        return (
            <div className="glass-card-solid p-6 flex items-center gap-3 border-destructive/30">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{(error as Error).message}</p>
            </div>
        );

    if (!data) return null;

    const lang = data.language;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-solid card-top-accent overflow-hidden"
        >
            {/* Top section */}
            <div className="p-6 border-b border-border">
                <div className="flex items-start gap-4 flex-wrap">
                    <img
                        src={data.owner.avatar_url}
                        alt={data.owner.login}
                        className="w-12 h-12 rounded-xl border border-border shadow"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <a
                                href={data.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-lg font-bold text-foreground hover:text-primary transition-colors font-mono flex items-center gap-1.5"
                            >
                                {data.full_name}
                                <ExternalLink className="w-4 h-4 opacity-60" />
                            </a>
                            {data.private && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                                    Private
                                </span>
                            )}
                            {data.archived && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                    Archived
                                </span>
                            )}
                            {data.fork && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                                    Fork
                                </span>
                            )}
                        </div>
                        {data.description && (
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{data.description}</p>
                        )}
                        {data.topics && data.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {data.topics.slice(0, 8).map((t) => (
                                    <span
                                        key={t}
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-6">
                <StatPill icon={Star} label="Stars" value={data.stargazers_count.toLocaleString()} color="text-warning" />
                <StatPill icon={GitFork} label="Forks" value={data.forks_count.toLocaleString()} />
                <StatPill icon={Eye} label="Watchers" value={data.watchers_count.toLocaleString()} />
                <StatPill icon={AlertCircle} label="Open Issues" value={data.open_issues_count.toLocaleString()} color="text-destructive" />
                <StatPill icon={Code2} label="Language"
                    value={lang || "—"}
                    color={lang ? undefined : undefined}
                />
                <StatPill icon={Scale} label="License" value={data.license?.spdx_id || "—"} />
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created {timeAgo(data.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Default branch: <code className="ml-1 bg-secondary px-1.5 py-0.5 rounded-md text-foreground">{data.default_branch}</code>
                </span>
                {data.homepage && (
                    <a href={data.homepage} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Link2 className="w-3.5 h-3.5" />
                        {data.homepage}
                    </a>
                )}
                {lang && (
                    <span className="flex items-center gap-1.5">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: langColors[lang] || "#8b949e" }}
                        />
                        {lang}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ─── Issues Panel ─────────────────────────────────────────────────────────────
function IssuesPanel({ owner, repo }: { owner: string; repo: string }) {
    const [state, setState] = useState<"open" | "closed" | "all">("open");
    const { data: issues, isLoading, error } = useRepoIssues(owner, repo, state);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-solid overflow-hidden"
        >
            <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Issues</h3>
                    {issues && (
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {issues.length}{state !== "all" ? ` ${state}` : ""}
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5">
                    {(["open", "closed", "all"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setState(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${state === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading issues…
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-sm text-destructive">{(error as Error).message}</div>
                ) : !issues || issues.length === 0 ? (
                    <div className="p-8 text-center">
                        <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2 opacity-60" />
                        <p className="text-sm text-muted-foreground">No {state === "all" ? "" : state} issues found.</p>
                    </div>
                ) : (
                    issues.map((issue, i) => (
                        <motion.a
                            key={issue.id}
                            href={issue.html_url}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 p-4 table-row-hover group"
                        >
                            <div className="mt-0.5 shrink-0">
                                {issue.state === "open"
                                    ? <CircleDot className="w-3.5 h-3.5 text-success" />
                                    : <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {issue.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-xs text-muted-foreground">
                                        #{issue.number} · {timeAgo(issue.updated_at)}
                                    </span>
                                    {issue.labels.slice(0, 3).map((l) => (
                                        <span
                                            key={l.name}
                                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                                            style={{
                                                color: `#${l.color}`,
                                                borderColor: `#${l.color}40`,
                                                background: `#${l.color}18`,
                                            }}
                                        >
                                            {l.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                <MessageSquare className="w-3 h-3" />
                                {issue.comments}
                            </div>
                        </motion.a>
                    ))
                )}
            </div>
        </motion.div>
    );
}

// ─── Contributors Panel ────────────────────────────────────────────────────────
function ContributorsPanel({ owner, repo }: { owner: string; repo: string }) {
    const { data: contributors, isLoading, error } = useRepoContributors(owner, repo);
    const topContrib = contributors?.[0];
    const maxContribs = topContrib?.contributions ?? 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-solid overflow-hidden"
        >
            <div className="p-5 border-b border-border flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Contributors</h3>
                {contributors && (
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full ml-1">
                        {contributors.length}
                    </span>
                )}
            </div>

            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading contributors…
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-sm text-destructive">{(error as Error).message}</div>
                ) : !contributors || contributors.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No contributors found.</div>
                ) : (
                    contributors.map((c, i) => (
                        <motion.a
                            key={c.login}
                            href={c.html_url}
                            target="_blank"
                            rel="noreferrer"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-4 table-row-hover group"
                        >
                            {/* Rank */}
                            <div className="w-6 text-xs font-bold text-muted-foreground text-center shrink-0">
                                {i === 0 ? (
                                    <Trophy className="w-4 h-4 text-warning mx-auto" />
                                ) : (
                                    `#${i + 1}`
                                )}
                            </div>
                            <img
                                src={c.avatar_url}
                                alt={c.login}
                                className="w-8 h-8 rounded-lg shrink-0 border border-border"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {c.login}
                                </p>
                                {/* Contribution bar */}
                                <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.round((c.contributions / maxContribs) * 100)}%` }}
                                        transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ background: "hsl(var(--primary))" }}
                                    />
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-xs font-bold text-foreground">{c.contributions.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground">commits</p>
                            </div>
                        </motion.a>
                    ))
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const RepoExplorer = () => {
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [target, setTarget] = useState<{ owner: string; repo: string } | null>(null);

    const handleSearch = useCallback(() => {
        setError(null);
        if (!input.trim()) return;
        try {
            const parsed = parseRepoInput(input);
            setTarget(parsed);
        } catch (e) {
            setError((e as Error).message);
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const clear = () => {
        setInput("");
        setTarget(null);
        setError(null);
    };

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold section-heading gradient-accent-static">Repo Explorer</h1>
                <p className="text-muted-foreground text-sm mt-2 ml-4">
                    Paste any GitHub repository URL or <span className="font-mono text-foreground">owner/repo</span> to explore issues and contributors
                </p>
            </motion.div>

            {/* Search input */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-3"
            >
                <div className="relative flex-1">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setError(null); }}
                        onKeyDown={handleKeyDown}
                        placeholder="https://github.com/facebook/react  or  facebook/react"
                        className="w-full bg-card border border-border rounded-xl py-3.5 pl-11 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all input-glow"
                    />
                    {input && (
                        <button
                            onClick={clear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <motion.button
                    onClick={handleSearch}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!input.trim()}
                    className="btn-gradient text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    <Search className="w-4 h-4" />
                    Explore
                </motion.button>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm"
                >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </motion.div>
            )}

            {/* Empty state */}
            {!target && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card-solid p-12 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-primary opacity-60" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Explore any repository</h3>
                    <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                        Paste a GitHub URL or type <span className="font-mono text-foreground bg-secondary px-1.5 rounded">owner/repo</span> to see detailed info, issues, and top contributors.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center text-xs text-muted-foreground">
                        {["vercel/next.js", "facebook/react", "microsoft/vscode"].map((example) => (
                            <button
                                key={example}
                                onClick={() => { setInput(example); setError(null); }}
                                className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 font-mono transition-colors hover:text-foreground"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {target && (
                    <motion.div
                        key={`${target.owner}/${target.repo}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* Repo info card */}
                        <RepoInfoCard owner={target.owner} repo={target.repo} />

                        {/* Issues + Contributors side-by-side on large screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <IssuesPanel owner={target.owner} repo={target.repo} />
                            <ContributorsPanel owner={target.owner} repo={target.repo} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RepoExplorer;
