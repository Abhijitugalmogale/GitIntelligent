import { motion } from "framer-motion";
import {
  GitPullRequest, Eye, CheckCircle, GitMerge, XCircle, FileEdit,
} from "lucide-react";

type PRStage = "open" | "in_review" | "approved" | "merged" | "closed";

interface PRProgressBarProps {
  currentStage: PRStage;
  /** ISO date strings per stage if available */
  stageDates?: Partial<Record<PRStage, string>>;
  prTitle?: string;
  size?: "sm" | "lg";
}

interface StepConfig {
  key: PRStage;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;         // text / ring color (Tailwind class)
  bgActive: string;      // filled bg when reached
  bgInactive: string;
}

const STEPS: StepConfig[] = [
  {
    key: "open",
    label: "Opened",
    sublabel: "PR submitted",
    icon: GitPullRequest,
    color: "text-primary",
    bgActive: "bg-primary",
    bgInactive: "bg-secondary",
  },
  {
    key: "in_review",
    label: "In Review",
    sublabel: "Under review",
    icon: Eye,
    color: "text-warning",
    bgActive: "bg-warning",
    bgInactive: "bg-secondary",
  },
  {
    key: "approved",
    label: "Approved",
    sublabel: "LGTM ✓",
    icon: CheckCircle,
    color: "text-success",
    bgActive: "bg-success",
    bgInactive: "bg-secondary",
  },
  {
    key: "merged",
    label: "Merged",
    sublabel: "Changes merged",
    icon: GitMerge,
    color: "text-[hsl(285_70%_63%)]",
    bgActive: "bg-[hsl(285_70%_63%)]",
    bgInactive: "bg-secondary",
  },
];

// If PR is closed (not merged) we show a diverging closed state
const CLOSED_STEP: StepConfig = {
  key: "closed",
  label: "Closed",
  sublabel: "Not merged",
  icon: XCircle,
  color: "text-destructive",
  bgActive: "bg-destructive",
  bgInactive: "bg-secondary",
};

const STAGE_ORDER: Record<PRStage, number> = {
  open: 0,
  in_review: 1,
  approved: 2,
  merged: 3,
  closed: 1, // treated as ended at in_review position
};

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PRProgressBar = ({
  currentStage,
  stageDates,
  size = "lg",
}: PRProgressBarProps) => {
  const isClosed = currentStage === "closed";
  const activeSteps = isClosed
    ? [...STEPS.slice(0, 1), CLOSED_STEP]   // open → closed
    : STEPS;

  const activeIdx = isClosed ? 1 : STAGE_ORDER[currentStage];
  const isSmall = size === "sm";

  return (
    <div className={`w-full ${isSmall ? "px-0" : "px-2"}`}>
      {/* ── Stepper row ── */}
      <div className="relative flex items-start justify-between">

        {/* Connecting track behind dots */}
        <div
          className={`absolute top-[18px] left-0 right-0 h-0.5 bg-border`}
          style={{ zIndex: 0 }}
        />
        {/* Animated filled track */}
        <motion.div
          className="absolute top-[18px] left-0 h-0.5 rounded-full"
          style={{
            background: isClosed
              ? "hsl(var(--destructive))"
              : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--success)))",
            zIndex: 1,
          }}
          initial={{ width: "0%" }}
          animate={{
            width: activeIdx === 0
              ? "0%"
              : `${(activeIdx / (activeSteps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Steps */}
        {activeSteps.map((step, i) => {
          const reached = i <= activeIdx;
          const isCurrent = i === activeIdx;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className="relative flex flex-col items-center"
              style={{ zIndex: 2, flex: 1 }}
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.12, duration: 0.3 }}
                className={`
                  relative flex items-center justify-center rounded-full border-2 transition-all duration-500
                  ${isSmall ? "w-9 h-9" : "w-10 h-10"}
                  ${reached
                    ? `${step.bgActive} border-transparent text-white shadow-lg`
                    : "bg-card border-border text-muted-foreground"
                  }
                `}
                style={reached ? { boxShadow: `0 0 16px 0 ${step.color.replace("text-", "").replace("[", "").replace("]", "")}40` } : {}}
              >
                {/* Pulsing ring on current active step */}
                {isCurrent && (
                  <motion.span
                    className={`absolute inset-0 rounded-full ${step.bgActive} opacity-30`}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <Icon className={isSmall ? "w-4 h-4" : "w-4.5 h-4.5"} style={{ width: 17, height: 17 }} />
              </motion.div>

              {/* Label + date */}
              {!isSmall && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 + 0.1 }}
                  className="mt-2 text-center min-w-0"
                >
                  <p className={`text-[12px] font-semibold leading-tight ${reached ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {step.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${reached ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                    {stageDates?.[step.key] ? fmt(stageDates[step.key]) : step.sublabel}
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Status chips ── */}
      {!isSmall && (
        <div className="flex items-center justify-center mt-5 gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${isClosed
                ? "bg-destructive/10 text-destructive border-destructive/25"
                : currentStage === "merged"
                  ? "bg-[hsl(285_70%_63%/0.12)] text-[hsl(285_70%_63%)] border-[hsl(285_70%_63%/0.3)]"
                  : currentStage === "approved"
                    ? "bg-success/10 text-success border-success/25"
                    : currentStage === "in_review"
                      ? "bg-warning/10 text-warning border-warning/25"
                      : "bg-primary/10 text-primary border-primary/25"
              }`}
          >
            {currentStage === "open" && <GitPullRequest className="w-3 h-3" />}
            {currentStage === "in_review" && <Eye className="w-3 h-3" />}
            {currentStage === "approved" && <CheckCircle className="w-3 h-3" />}
            {currentStage === "merged" && <GitMerge className="w-3 h-3" />}
            {currentStage === "closed" && <XCircle className="w-3 h-3" />}
            {{
              open: "Waiting for review",
              in_review: "Currently under review",
              approved: "Approved — ready to merge",
              merged: "Successfully merged 🎉",
              closed: "Closed without merging",
            }[currentStage]}
          </span>
        </div>
      )}
    </div>
  );
};

export default PRProgressBar;
