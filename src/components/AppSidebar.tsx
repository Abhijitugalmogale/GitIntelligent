import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitPullRequest,
  CircleDot,
  BarChart3,
  FolderGit2,
  Settings,
  Github,
  ChevronLeft,
  Sparkles,
  Telescope,
  Newspaper,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Pull Requests", icon: GitPullRequest, path: "/pull-requests" },
  { label: "Issues", icon: CircleDot, path: "/issues" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Repositories", icon: FolderGit2, path: "/repositories" },
  { label: "Repo Explorer", icon: Telescope, path: "/repo-explorer" },
  { label: "OSS Programs", icon: Newspaper, path: "/programs" },
  { label: "Settings", icon: Settings, path: "/settings" },
];
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 252 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="h-screen sticky top-0 flex flex-col overflow-hidden z-30 border-r border-sidebar-border"
      style={{
        background: "hsl(var(--sidebar-background))",
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, hsla(var(--primary) / 0.12), transparent)",
        }}
      />

      {/* Logo */}
      <div className="h-16 flex items-center px-4 gap-3 border-b border-sidebar-border shrink-0 relative">
        <div className="relative shrink-0">
          {/* Spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(285 70% 63%), hsl(var(--primary)))",
              padding: "1.5px",
              borderRadius: "10px",
              animation: "spinSlow 6s linear infinite",
            }}
          >
            <div className="w-full h-full rounded-[8px] bg-sidebar-background" />
          </div>
          <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center z-10">
            <Github className="w-4 h-4 text-primary" />
          </div>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-sm text-foreground whitespace-nowrap tracking-tight">
                Contributor
                <span
                  className="ml-1 gradient-accent-static"
                >
                  Intel
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" /> GitHub Intelligence
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2.5 overflow-y-auto relative z-10">
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0.5"
        >
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <motion.li key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className={`nav-item ${active ? "nav-item-active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-primary" : ""}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="whitespace-nowrap overflow-hidden text-[13px]"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active glow dot */}
                  {active && (
                    <motion.span
                      layoutId="activeNav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dot-pulse-active shrink-0"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* Version badge (only expanded) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-2"
          >
            <div className="card-top-accent rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                GitHub PR & Issue<br />
                <span className="text-primary font-medium">Intelligence Manager</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <div className="p-2.5 border-t border-sidebar-border shrink-0">
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="nav-item w-full justify-center"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
