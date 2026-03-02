import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, PieChart as PieIcon, BarChart2, Clock,
  GitPullRequest, CircleDot, GitMerge, Loader2, AlertCircle,
  Calendar, Code2, Activity, Zap,
} from "lucide-react";
import { usePullRequests, useIssues, useRepositories } from "@/hooks/useGitHub";
import { GitHubPR, GitHubIssue } from "@/services/githubApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Group PRs by week (relative to oldest item) → last N weeks */
function prsByWeek(prs: GitHubPR[], weeks = 8) {
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Array.from({ length: weeks }, (_, i) => {
    const weekLabel = `W-${weeks - i}`;
    const end = now - i * msPerWeek;
    const start = end - msPerWeek;
    const count = prs.filter((pr) => {
      const t = new Date(pr.created_at).getTime();
      return t >= start && t < end;
    }).length;
    return { week: weekLabel, prs: count };
  }).reverse();
}

/** Group issues by week */
function issuesByWeek(issues: GitHubIssue[], weeks = 8) {
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Array.from({ length: weeks }, (_, i) => {
    const weekLabel = `W-${weeks - i}`;
    const end = now - i * msPerWeek;
    const start = end - msPerWeek;
    const count = issues.filter((issue) => {
      const t = new Date(issue.created_at).getTime();
      return t >= start && t < end;
    }).length;
    return { week: weekLabel, issues: count };
  }).reverse();
}

/** Merge prsByWeek + issuesByWeek into combined activity data */
function activityByWeek(prs: GitHubPR[], issues: GitHubIssue[], weeks = 8) {
  const prData = prsByWeek(prs, weeks);
  const issueData = issuesByWeek(issues, weeks);
  return prData.map((d, i) => ({
    week: d.week,
    prs: d.prs,
    issues: issueData[i]?.issues ?? 0,
  }));
}

/** Count repos by language */
function languageBreakdown(repos: { language: string | null }[]) {
  const counts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

// ─── Chart colours ────────────────────────────────────────────────────────────
const PALETTE = [
  "hsl(243 88% 66%)",
  "hsl(152 72% 47%)",
  "hsl(38 96% 56%)",
  "hsl(4 90% 63%)",
  "hsl(285 70% 63%)",
  "hsl(189 100% 60%)",
];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(222 40% 10%)",
    border: "1px solid hsl(222 30% 22%)",
    borderRadius: "0.75rem",
    color: "hsl(213 40% 97%)",
    fontSize: "0.75rem",
    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
  },
  cursor: { fill: "hsl(222 35% 18% / 0.5)" },
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const ChartSkeleton = () => (
  <div className="h-52 rounded-xl bg-secondary/40 animate-pulse" />
);

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/40 border border-border/50 gap-1">
      <Icon className={`w-5 h-5 ${color} mb-1`} />
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const Analytics = () => {
  const { data: prs, isLoading: loadingPRs, isError: errorPRs } = usePullRequests();
  const { data: issues, isLoading: loadingIssues, isError: errorIssues } = useIssues();
  const { data: repos, isLoading: loadingRepos, isError: errorRepos } = useRepositories();

  const isLoading = loadingPRs || loadingIssues || loadingRepos;
  const isError = errorPRs || errorIssues || errorRepos;

  // ── Derived data ──────────────────────────────────────────────────────────
  const allPRs = prs ?? [];
  const allIssues = issues ?? [];
  const allRepos = repos ?? [];

  const openPRs = allPRs.filter((p) => p.prStatus === "open").length;
  const mergedPRs = allPRs.filter((p) => p.prStatus === "merged").length;
  const closedPRs = allPRs.filter((p) => p.prStatus === "closed").length;
  const openIssues = allIssues.filter((i) => i.state === "open").length;
  const closedIssues = allIssues.filter((i) => i.state === "closed").length;

  const mergeRate = allPRs.length > 0
    ? Math.round((mergedPRs / allPRs.length) * 100)
    : 0;

  const prWeeklyData = prsByWeek(allPRs, 8);
  const activityData = activityByWeek(allPRs, allIssues, 8);
  const langData = languageBreakdown(allRepos);

  const mergeBreakdown = [
    { name: "Merged", value: mergedPRs },
    { name: "Open", value: openPRs },
    { name: "Closed", value: closedPRs },
  ].filter((d) => d.value > 0);

  const issueBreakdown = [
    { name: "Open", value: openIssues },
    { name: "Closed", value: closedIssues },
  ].filter((d) => d.value > 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-destructive opacity-60" />
        <p className="text-sm text-destructive font-medium">Failed to load analytics data.</p>
        <p className="text-xs text-muted-foreground">Check your GitHub token scopes (repo + read:user).</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold section-heading gradient-accent-static">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-2 ml-4">
          Live contribution metrics derived from your real GitHub data
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-primary"><Loader2 className="w-3 h-3 animate-spin" />Loading…</span>}
        </p>
      </motion.div>

      {/* KPI Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary/40 animate-pulse" />
          ))
          : [
            { icon: GitPullRequest, label: "Total PRs", value: allPRs.length, color: "text-primary" },
            { icon: GitMerge, label: "Merged PRs", value: mergedPRs, color: "text-success" },
            { icon: GitPullRequest, label: "Open PRs", value: openPRs, color: "text-warning" },
            { icon: CircleDot, label: "Open Issues", value: openIssues, color: "text-destructive" },
            { icon: Zap, label: "Merge Rate", value: `${mergeRate}%`, color: "text-primary" },
            { icon: Code2, label: "Repositories", value: allRepos.length, color: "text-muted-foreground" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.06 }}
            >
              <StatBadge {...s} />
            </motion.div>
          ))}
      </motion.div>

      {/* Charts grid — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. PR Trend */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">PR Activity Trend</h3>
              <p className="text-xs text-muted-foreground mt-0.5">New PRs opened — last 8 weeks</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={prWeeklyData}>
                <defs>
                  <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(243 88% 66%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(243 88% 66%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" />
                <XAxis dataKey="week" stroke="hsl(217 22% 35%)" fontSize={11} />
                <YAxis stroke="hsl(217 22% 35%)" fontSize={11} width={28} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="prs" name="PRs opened"
                  stroke="hsl(243 88% 66%)" fill="url(#prGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* 2. PR Merge Rate (Donut) */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">PR Status Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Merged · Open · Closed</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <PieIcon className="w-4 h-4 text-success" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : mergeBreakdown.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No PR data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={mergeBreakdown} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                    strokeWidth={2} stroke="hsl(222 40% 10%)">
                    {mergeBreakdown.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-1">
                {mergeBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: PALETTE[i] }} />
                    {d.name}
                    <span className="font-bold text-foreground">({d.value})</span>
                  </div>
                ))}
              </div>
              {allPRs.length > 0 && (
                <p className="text-center text-sm font-semibold mt-3">
                  <span className="text-success">{mergeRate}%</span>
                  <span className="text-muted-foreground text-xs ml-1.5">merge rate</span>
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* 3. Combined Activity Bar Chart */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Weekly Contribution Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">PRs opened vs issues created per week</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-warning" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" />
                <XAxis dataKey="week" stroke="hsl(217 22% 35%)" fontSize={11} />
                <YAxis stroke="hsl(217 22% 35%)" fontSize={11} width={28} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Legend formatter={(v) => <span style={{ color: "hsl(217 22% 58%)", fontSize: "11px" }}>{v}</span>} />
                <Bar dataKey="prs" name="PRs" fill="hsl(243 88% 66%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="issues" name="Issues" fill="hsl(38 96% 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* 4. Issue Status Donut */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Issue Status Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Open vs Closed issues</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-destructive" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : issueBreakdown.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No issue data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={issueBreakdown} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                    strokeWidth={2} stroke="hsl(222 40% 10%)">
                    <Cell fill="hsl(4 90% 63%)" />
                    <Cell fill="hsl(152 72% 47%)" />
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-1">
                {issueBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "hsl(4 90% 63%)" : "hsl(152 72% 47%)" }} />
                    {d.name}
                    <span className="font-bold text-foreground">({d.value})</span>
                  </div>
                ))}
              </div>
              {allIssues.length > 0 && (
                <p className="text-center text-sm font-semibold mt-3">
                  <span className="text-success">{Math.round((closedIssues / allIssues.length) * 100)}%</span>
                  <span className="text-muted-foreground text-xs ml-1.5">resolution rate</span>
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* 5. Repositories by Language */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Top Languages</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Repos by primary language</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[hsl(189_100%_60%/0.15)] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-[hsl(189_100%_60%)]" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : langData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No repo language data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={langData} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" horizontal={false} />
                <XAxis type="number" stroke="hsl(217 22% 35%)" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(217 22% 35%)" fontSize={11} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Repos" radius={[0, 4, 4, 0]}>
                  {langData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* 6. PRs per Repo (top 8) */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card-solid p-6 card-top-accent group">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">PRs per Repository</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Top 8 most-active repos</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </div>
          {isLoading ? <ChartSkeleton /> : allPRs.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No PR data yet</div>
          ) : (() => {
            const repoCounts: Record<string, number> = {};
            allPRs.forEach((pr) => {
              const r = pr.repo.split("/")[1] ?? pr.repo;
              repoCounts[r] = (repoCounts[r] ?? 0) + 1;
            });
            const repoData = Object.entries(repoCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([name, value]) => ({ name, value }));
            return (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={repoData} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 20%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(217 22% 35%)" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(217 22% 35%)" fontSize={11} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" name="PRs" radius={[0, 4, 4, 0]}>
                    {repoData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </motion.div>

      </div>

      {/* PR timeline table — most recent 10 */}
      <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
        className="glass-card-solid overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recent Pull Request Timeline</h3>
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-auto" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Repo</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4"><div className="w-48 h-3 bg-secondary rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-28 h-3 bg-secondary rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-16 h-5 bg-secondary rounded animate-pulse" /></td>
                    <td className="p-4"><div className="w-14 h-3 bg-secondary rounded animate-pulse" /></td>
                  </tr>
                ))
                : (allPRs).slice(0, 10).map((pr) => (
                  <tr key={pr.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <a href={pr.html_url} target="_blank" rel="noreferrer"
                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-xs block">
                        {pr.title}
                      </a>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground truncate max-w-[150px]">{pr.repo}</td>
                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${pr.prStatus === "merged"
                        ? "bg-success/10 text-success border-success/25"
                        : pr.prStatus === "open"
                          ? "bg-primary/10 text-primary border-primary/25"
                          : "bg-muted text-muted-foreground border-border"
                        }`}>
                        {pr.prStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(pr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              {!isLoading && allPRs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                    No pull requests found. Your PRs will appear here once fetched.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
