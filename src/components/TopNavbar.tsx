import { Bell, ChevronDown, LogOut, ExternalLink, Zap, GitPullRequest, CircleDot, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSearch } from "@/hooks/useGitHub";
import { timeAgo } from "@/services/githubApi";
import StatusBadge from "@/components/StatusBadge";

// Debounce hook
function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchInput, 400);
  const { data: searchResults, isFetching } = useSearch(debouncedQuery);

  const hasResults = searchResults && (searchResults.prs.length > 0 || searchResults.issues.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="h-16 border-b border-border sticky top-0 z-20 flex items-center justify-between px-6"
      style={{
        background: "hsla(var(--card) / 0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Left: repo selector */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-sm font-medium text-foreground bg-secondary/60 px-3 py-2 rounded-xl hover:bg-secondary transition-colors border border-border/50 hover:border-primary/30"
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground text-xs">Repo:</span>
          <span className="font-semibold">all-repositories</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Center: search with live dropdown */}
      <div ref={searchRef} className="hidden md:flex items-center max-w-md flex-1 mx-8 relative">
        <div className="relative w-full">
          {/* Search icon / spinner */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none">
            {isFetching ? (
              <svg className="animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={searchOpen ? "text-primary" : "text-muted-foreground"}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            )}
          </div>

          <input
            type="text"
            placeholder="Search PRs, issues…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-secondary/40 border border-border/50 rounded-xl py-2 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-300 input-glow"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchInput && (
              <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="text-[10px] text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded-md border border-border font-mono hidden sm:block">⌘K</kbd>
          </div>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchOpen && debouncedQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-xl border border-border shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto"
              style={{ background: "hsl(var(--card))" }}
            >
              {!hasResults && !isFetching && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No results for "<span className="text-foreground">{debouncedQuery}</span>"
                </div>
              )}

              {/* PRs section */}
              {searchResults && searchResults.prs.length > 0 && (
                <div>
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pull Requests</span>
                    <span className="text-[10px] text-muted-foreground">{searchResults.totalPRs} total</span>
                  </div>
                  {searchResults.prs.map((pr) => (
                    <a
                      key={pr.id}
                      href={pr.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={clearSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors"
                    >
                      <GitPullRequest className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{pr.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{pr.repo} · {timeAgo(pr.updated_at)}</p>
                      </div>
                      <StatusBadge status={pr.prStatus} />
                    </a>
                  ))}
                </div>
              )}

              {/* Issues section */}
              {searchResults && searchResults.issues.length > 0 && (
                <div>
                  <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Issues</span>
                    <span className="text-[10px] text-muted-foreground">{searchResults.totalIssues} total</span>
                  </div>
                  {searchResults.issues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={clearSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors"
                    >
                      <CircleDot className="w-3.5 h-3.5 text-success shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{issue.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{issue.repo} · {timeAgo(issue.updated_at)}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${issue.state === "open" ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border border-border"}`}>
                        {issue.state}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <motion.button
          onClick={() => navigate("/settings")}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full dot-pulse-active" />
        </motion.button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/50"
          >
            <div className="relative">
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-lg object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">@{user?.login}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 rounded-xl border border-border shadow-2xl py-1.5 overflow-hidden z-50"
                style={{ background: "hsl(var(--card))" }}
              >
                <div className="px-4 pt-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-lg" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">@{user?.login}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1.5 px-1.5 space-y-0.5">
                  <a
                    href={`https://github.com/${user?.login}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View GitHub Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
