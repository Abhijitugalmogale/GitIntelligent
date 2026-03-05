import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: "primary" | "success" | "warning" | "destructive" | "muted";
  index?: number;
}

const colorMap = {
  primary: { icon: "text-primary", bg: "bg-primary/10", border: "border-primary/20", glow: "hsla(var(--primary) / 0.3)", num: "from-primary to-violet-400" },
  success: { icon: "text-success", bg: "bg-success/10", border: "border-success/20", glow: "hsla(var(--success) / 0.3)", num: "from-success to-emerald-400" },
  warning: { icon: "text-warning", bg: "bg-warning/10", border: "border-warning/20", glow: "hsla(var(--warning) / 0.3)", num: "from-warning to-amber-300" },
  destructive: { icon: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", glow: "hsla(var(--destructive) / 0.3)", num: "from-destructive to-orange-400" },
  muted: { icon: "text-muted-foreground", bg: "bg-muted", border: "border-border", glow: "hsla(0 0% 100% / 0.06)", num: "from-foreground to-muted-foreground" },
};

const StatCard = ({ label, value, icon: Icon, trend, trendUp, color, index = 0 }: StatCardProps) => {
  const col = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="stat-card group"
    >
      {/* Hover glow line at top */}
      <div
        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${col.glow}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${col.bg} ${col.icon} border ${col.border} relative overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at center, ${col.glow}, transparent 70%)` }}
          />
          <Icon className="w-4.5 h-4.5 relative z-10" />
        </div>

        {trend && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${trendUp
              ? "text-success bg-success/10 border-success/20"
              : "text-destructive bg-destructive/10 border-destructive/20"
            }`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <p className={`text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${col.num}`}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;
