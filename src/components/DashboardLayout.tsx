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
  LogOut, ExternalLink, X, GitMerge, CircleDot as IssueIcon,
  ChevronDown, Menu, Zap
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

function useDebounce(v: string, ms = 400) {
  const [d, setD] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setD(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return d;
}

/* ── Global Search ──────────────────────────────────────────────────────────── */
function SearchBar() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dq = useDebounce(input, 400);
  const { data, isFetching } = useSearch(dq);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const hasResults = data && (data.prs.length > 0 || data.issues.length > 0);

  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <div className="relative">
        {isFetching
          ? <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />}
        <input
          type="text" value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search PRs & issues…"
          className="input-field pl-9 pr-8 py-2 h-9"
        />
        {input && (
          <button onClick={() => { setInput(""); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
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
            className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-xl border border-border shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
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

/* ── Top Bar ─────────────────────────────────────────────────────────────────── */
function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="topbar gap-3 justify-between">
      {/* Left: hamburger (mobile) + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <div className="hidden sm:block flex-1 max-w-xs">
          <SearchBar />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle />

        <button
          onClick={() => navigate("/settings")}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full dot-pulse-active" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/60"
          >
            <div className="relative">
              <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-lg object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-success rounded-full border-2 border-background" />
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:block max-w-[100px] truncate">{user?.name}</span>
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
                style={{ background: "hsl(var(--popover))" }}
              >
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-xl" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user?.login}</p>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <a href={`https://github.com/${user?.login}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
                    onClick={() => setUserMenu(false)}>
                    <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
                  </a>
                  <button
                    onClick={() => { logout(); navigate("/"); setUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col sidebar-bg w-60 shrink-0 transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[hsl(280_70%_65%)] flex items-center justify-center shadow-lg shadow-primary/30">
            <Github className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground tracking-tight leading-none">
              Contributor<span className="gradient-accent">Intel</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-primary" /> GitHub Dashboard
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pt-2 pb-2">
            Navigation
          </p>
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => window.innerWidth < 1024 && onClose()}>
              {({ isActive }) => (
                <div className={`nav-item ${isActive ? "nav-item-active" : ""}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 pt-4 pb-2">
            Explore
          </p>
          {NAV_ITEMS.slice(5).map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => window.innerWidth < 1024 && onClose()}>
              {({ isActive }) => (
                <div className={`nav-item ${isActive ? "nav-item-active" : ""}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Current page indicator at bottom */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="rounded-lg bg-primary/8 border border-primary/15 p-3">
            <p className="text-xs font-medium text-foreground leading-none mb-0.5">
              {NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label ?? "Dashboard"}
            </p>
            <p className="text-[10px] text-muted-foreground">{location.pathname}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Page transition variants ─────────────────────────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  },
  exit: { opacity: 0, y: -6, filter: "blur(2px)", transition: { duration: 0.17 } },
};

function AutoNotificationWatcher() {
  usePRNotifications();
  return null;
}

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full app-bg">
      <AutoNotificationWatcher />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
