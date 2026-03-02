import { motion, AnimatePresence } from "framer-motion";

interface StatusBadgeProps {
  status: "open" | "merged" | "closed" | "approved" | "changes_requested" | "pending" | "low" | "medium" | "high";
}

const styles: Record<string, string> = {
  open: "bg-primary/10 text-primary border border-primary/20",
  merged: "bg-success/10 text-success border border-success/20",
  closed: "bg-destructive/10 text-destructive border border-destructive/15",
  approved: "bg-success/10 text-success border border-success/20",
  changes_requested: "bg-warning/10 text-warning border border-warning/20",
  pending: "bg-muted text-muted-foreground border border-border",
  low: "bg-success/10 text-success border border-success/20",
  medium: "bg-warning/10 text-warning border border-warning/20",
  high: "bg-destructive/10 text-destructive border border-destructive/15",
};

const dotColors: Record<string, string> = {
  open: "bg-primary",
  merged: "bg-success",
  closed: "bg-destructive",
  approved: "bg-success",
  changes_requested: "bg-warning",
  pending: "bg-muted-foreground",
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-destructive",
};

const labels: Record<string, string> = {
  open: "Open",
  merged: "Merged",
  closed: "Closed",
  approved: "Approved",
  changes_requested: "Changes Req.",
  pending: "Pending",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const isPulsing = (s: string) => s === "open" || s === "pending";

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${styles[status]}`}
    >
      <span className="relative flex items-center justify-center">
        {isPulsing(status) && (
          <span
            className={`absolute w-2.5 h-2.5 rounded-full ${dotColors[status]} opacity-40 animate-ping`}
          />
        )}
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]} relative`} />
      </span>
      {labels[status]}
    </motion.span>
  </AnimatePresence>
);

export default StatusBadge;
