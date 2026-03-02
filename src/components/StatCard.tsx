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
  primary: { icon: "text-primary", bg: "bg-primary/10", glow: "hsla(var(--primary) / 0.35)", grad: "from-primary/20 to-transparent" },
  success: { icon: "text-success", bg: "bg-success/10", glow: "hsla(var(--success) / 0.35)", grad: "from-success/20 to-transparent" },
  warning: { icon: "text-warning", bg: "bg-warning/10", glow: "hsla(var(--warning) / 0.35)", grad: "from-warning/20 to-transparent" },
  destructive: { icon: "text-destructive", bg: "bg-destructive/10", glow: "hsla(var(--destructive) / 0.35)", grad: "from-destructive/20 to-transparent" },
  muted: { icon: "text-muted-foreground", bg: "bg-muted", glow: "hsla(0 0% 100% / 0.08)", grad: "from-muted/40 to-transparent" },
};

const valueGradient = {
  primary: "gradient-accent-static",
  success: "bg-clip-text text-transparent bg-gradient-to-r from-success to-emerald-400",
  warning: "bg-clip-text text-transparent bg-gradient-to-r from-warning to-yellow-300",
  destructive: "bg-clip-text text-transparent bg-gradient-to-r from-destructive to-orange-400",
  muted: "text-foreground",
};

const StatCard = ({ label, value, icon: Icon, trend, trendUp, color, index = 0 }: StatCardProps) => {
  const col = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="stat-card group"
    >
      {/* Inner top highlight line */}
      <div
        className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${col.glow}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between mb-5">
        <motion.div
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${col.bg} ${col.icon} relative`}
        >
          {/* Icon bg glow */}
          <div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at center, ${col.glow}, transparent)` }}
          />
          <Icon className="w-5 h-5 relative z-10" />
        </motion.div>

        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trendUp
              ? "text-success bg-success/10 border border-success/20"
              : "text-destructive bg-destructive/10 border border-destructive/20"
            }`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <p className={`text-3xl font-bold tracking-tight ${valueGradient[color]}`}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
    </motion.div>
  );
};

export default StatCard;
