import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSearch } from "@/hooks/useGitHub";
import { usePRNotifications } from "@/hooks/usePRNotifications";
import { timeAgo } from "@/services/githubApi";
import StatusBadge from "@/components/StatusBadge";

import {
  LayoutDashboard, GitPullRequest, CircleDot, BarChart3, FolderGit2,
  Telescope, Newspaper, Settings, Github, Bell, Search,
  LogOut, ExternalLink, X, GitMerge, CircleDot as IssueIcon, ChevronDown
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: GitPullRequest, label: "Pull Requests", path: "/pull-requests" },
  { icon: CircleDot, label: "Issues", path: "/issues" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FolderGit2, label: "Repos", path: "/repositories" },
  { icon: Telescope, label: "Explorer", path: "/repo-explorer" },
  { icon: Newspaper, label: "OSS Programs", path: "/programs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// ── Debounce ─────────────────────────────────────────────────────────────────
function useDebounce(v: string, ms = 400) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

// ── Search dropdown ───────────────────────────────────────────────────────────
function SearchBar() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dq = useDebounce(input, 400);
  const { data, isFetching } = useSearch(dq);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const hasResults = data && (data.prs.length > 0 || data.issues.length > 0);

  return (
    <div ref={ref} className="relative w-64">
      <div className="relative">
        {isFetching
          ? <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        }
        <input
          type="text" value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search PRs & issues…"
          className="w-full bg-secondary/40 border border-border rounded-xl py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none input-glow"
        />
        {input && (
          <button onClick={() => { setInput(""); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && dq.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-xl border border-border shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
            style={{ background: "hsl(var(--card))" }}
          >
            {!hasResults && !isFetching && (
              <p className="p-4 text-center text-sm text-muted-foreground">No results for "{dq}"</p>
            )}
            {data?.prs && data.prs.length > 0 && (
              <div>
                <div className="px-3 py-2 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pull Requests</div>
                {data.prs.map((pr) => (
                  <a key={pr.id} href={pr.html_url} target="_blank" rel="noreferrer" onClick={() => { setInput(""); setOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/60 transition-colors">
                    <GitMerge className="w-3.5 h-3.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{pr.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{pr.repo} · {timeAgo(pr.updated_at)}</p>
                    </div>
                    <StatusBadge status={pr.prStatus} />
                  </a>
                ))}
              </div>
            )}
            {data?.issues && data.issues.length > 0 && (
              <div>
                <div className="px-3 py-2 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Issues</div>
                {data.issues.map((issue) => (
                  <a key={issue.id} href={issue.html_url} target="_blank" rel="noreferrer" onClick={() => { setInput(""); setOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/60 transition-colors">
                    <IssueIcon className="w-3.5 h-3.5 text-success shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{issue.title}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{issue.repo} · {timeAgo(issue.updated_at)}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Top Navigation Bar ────────────────────────────────────────────────────────
function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-border"
      style={{ background: "hsla(var(--card) / 0.75)", backdropFilter: "blur(20px)" }}
    >
      {/* Row 1: Logo + Search + Actions */}
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[hsl(285_70%_63%)] flex items-center justify-center shadow-lg shadow-primary/30">
            <Github className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight hidden sm:block">
            Contributor<span className="text-primary">Intel</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 flex justify-center max-w-sm">
          <SearchBar />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />

          {/* Bell */}
          <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenu(!userMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="relative">
                <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-lg object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border border-background" />
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:block">{user?.name}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>

            <AnimatePresence>
              {userMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 w-52 rounded-xl border border-border shadow-2xl py-1.5 z-50"
                  style={{ background: "hsl(var(--card))" }}
                >
                  <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-xl" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">@{user?.login}</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <a href={`https://github.com/${user?.login}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
                      onClick={() => setUserMenu(false)}>
                      <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
                    </a>
                    <button onClick={() => { logout(); navigate("/"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Row 2: Nav tabs */}
      <div className="flex items-center gap-0.5 px-4 overflow-x-auto scrollbar-none border-t border-border/50">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.6)" }}
                className={`relative flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors rounded-t-lg cursor-pointer ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
                {/* Active underline tab indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-1 right-1 h-0.5 rounded-t-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -6, filter: "blur(2px)", transition: { duration: 0.18 } },
};

/** Registers the automated PR email watcher globally */
function AutoNotificationWatcher() {
  usePRNotifications();
  return null;
}

const DashboardLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col w-full mesh-bg">
      <AutoNotificationWatcher />
      <TopNav />
      <main className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
