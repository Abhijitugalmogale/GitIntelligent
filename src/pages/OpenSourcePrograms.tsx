import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Calendar,
    DollarSign,
    Users,
    ExternalLink,
    Clock,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Globe,
    Newspaper,
    Flame,
    Sparkles,
    Star,
    GraduationCap,
    Building2,
    X,
    ArrowRight,
    ChevronRight,
    Trophy,
    Target,
    Zap,
    Bitcoin,
    Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ProgramStatus = "active" | "applications_open" | "upcoming" | "closed" | "announced";

interface Phase { name: string; date: string; done?: boolean }

interface Program {
    id: string;
    name: string;
    shortName: string;
    org: string;
    description: string;
    status: ProgramStatus;
    stipend: string;
    stipendRaw: string;        // short badge version
    duration: string;
    eligibility: string[];
    tags: string[];
    phases: Phase[];
    link: string;
    applyLink?: string;
    gradient: string;          // CSS gradient string
    glowColor: string;         // rgba glow
    icon: React.ElementType;
    news: string;
    highlight: string;         // one-liner for card front
}

// ─── Programs data ────────────────────────────────────────────────────────────
const PROGRAMS: Program[] = [
    {
        id: "gsoc",
        name: "Google Summer of Code",
        shortName: "GSoC 2026",
        org: "Google",
        description: "GSoC is a global program focused on bringing new contributors into open source. Participants work on a 3-month coding project with a mentoring organization.",
        status: "upcoming",
        stipend: "$1,500 – $6,600 USD",
        stipendRaw: "up to $6,600",
        duration: "~12 weeks · May – Aug",
        eligibility: ["18+ years old", "Student or recent grad", "Any nationality", "Submit a proposal", "Not employed by Google"],
        tags: ["Students", "Remote", "Global"],
        phases: [
            { name: "Org applications open", date: "Jan 27, 2026", done: true },
            { name: "Accepted orgs announced", date: "Feb 19, 2026", done: true },
            { name: "Contributor apps open", date: "Mar 18, 2026" },
            { name: "Contributor app deadline", date: "Apr 2, 2026" },
            { name: "Accepted contributors", date: "May 1, 2026" },
            { name: "Community bonding", date: "May 1–26, 2026" },
            { name: "Coding begins", date: "May 26, 2026" },
            { name: "Midterm evaluations", date: "Jul 14, 2026" },
            { name: "Final deadline", date: "Sep 1, 2026" },
        ],
        link: "https://summerofcode.withgoogle.com",
        applyLink: "https://summerofcode.withgoogle.com/how-it-works",
        gradient: "linear-gradient(135deg, #4285F4 0%, #34A853 100%)",
        glowColor: "rgba(66,133,244,0.35)",
        icon: GraduationCap,
        news: "Contributor applications open March 18 — start finding your org now!",
        highlight: "The world's largest open source internship program",
    },
    {
        id: "sob",
        name: "Summer of Bitcoin",
        shortName: "SoB 2026",
        org: "Summer of Bitcoin",
        description: "A global summer internship focused on Bitcoin open-source development and design. Connect with Bitcoin projects and earn real BTC while contributing.",
        status: "applications_open",
        stipend: "$3,000 in Bitcoin",
        stipendRaw: "$3,000 in BTC",
        duration: "~12 weeks · Jun – Aug",
        eligibility: ["University student (any year)", "18+ years old", "Passion for Bitcoin", "No prior Bitcoin XP needed", "Global applicants"],
        tags: ["Bitcoin", "Blockchain", "Remote"],
        phases: [
            { name: "Applications open", date: "Jan 15, 2026", done: true },
            { name: "Application deadline", date: "Mar 15, 2026" },
            { name: "Selection & interviews", date: "Mar–Apr 2026" },
            { name: "Accepted students", date: "Apr 30, 2026" },
            { name: "Community bonding", date: "May 1–31, 2026" },
            { name: "Coding begins", date: "Jun 1, 2026" },
            { name: "Midterm evaluation", date: "Jul 15, 2026" },
            { name: "Program ends", date: "Aug 31, 2026" },
        ],
        link: "https://www.summerofbitcoin.org",
        applyLink: "https://www.summerofbitcoin.org/apply",
        gradient: "linear-gradient(135deg, #F7931A 0%, #FF6B35 100%)",
        glowColor: "rgba(247,147,26,0.35)",
        icon: Bitcoin,
        news: "Applications OPEN — deadline March 15, 2026. Don't miss it!",
        highlight: "Contribute to Bitcoin protocol and earn $3,000 in BTC",
    },
    {
        id: "outreachy",
        name: "Outreachy",
        shortName: "Outreachy May 2026",
        org: "Software Freedom Conservancy",
        description: "Outreachy provides paid, remote internships in open source to people subject to systemic bias and underrepresentation in tech.",
        status: "applications_open",
        stipend: "$7,000 + $500 travel",
        stipendRaw: "$7,500 total",
        duration: "3 months · May – Aug",
        eligibility: ["Systemically underrepresented in tech", "Not in coding bootcamp", "40 hrs/week available", "No previous Outreachy intern"],
        tags: ["Diversity", "Inclusion", "Open Science"],
        phases: [
            { name: "Initial apps open", date: "Jan 17, 2026", done: true },
            { name: "Initial app deadline", date: "Feb 7, 2026", done: true },
            { name: "Contribution period", date: "Feb 22 – Mar 20, 2026" },
            { name: "Intern selection", date: "Mar–Apr 2026" },
            { name: "Interns announced", date: "Apr 30, 2026" },
            { name: "Internship begins", date: "May 27, 2026" },
            { name: "Internship ends", date: "Aug 22, 2026" },
        ],
        link: "https://www.outreachy.org",
        applyLink: "https://www.outreachy.org/apply",
        gradient: "linear-gradient(135deg, #E91E8C 0%, #9C27B0 100%)",
        glowColor: "rgba(233,30,140,0.35)",
        icon: Users,
        news: "Contribution period LIVE until Mar 20 — make your contributions now!",
        highlight: "The highest paid open source internship for underrepresented folks",
    },
    {
        id: "lfx",
        name: "LFX Mentorship",
        shortName: "LFX 2026",
        org: "Linux Foundation",
        description: "LFX Mentorship pairs mentees with open source experts on Linux Foundation projects — cloud native, blockchain, AI/ML, networking and more.",
        status: "applications_open",
        stipend: "$3,000 – $6,000 USD",
        stipendRaw: "up to $6,000",
        duration: "3 months · 3 terms/year",
        eligibility: ["Students or early-career devs", "No prior OSS XP needed", "Half-time or full-time", "18+ · Global"],
        tags: ["CNCF", "Linux Foundation", "Cloud Native"],
        phases: [
            { name: "Term 1 apps (Jan–Mar)", date: "Dec 2025", done: true },
            { name: "Term 1 starts", date: "Mar 1, 2026", done: true },
            { name: "Term 2 apps (Jun–Aug)", date: "Apr 14, 2026" },
            { name: "Term 2 starts", date: "Jun 1, 2026" },
            { name: "Term 3 apps (Sep–Nov)", date: "Jul 14, 2026" },
            { name: "Term 3 starts", date: "Sep 1, 2026" },
        ],
        link: "https://lfx.linuxfoundation.org/tools/mentorship",
        applyLink: "https://mentorship.lfx.linuxfoundation.org",
        gradient: "linear-gradient(135deg, #00ADD8 0%, #0080A0 100%)",
        glowColor: "rgba(0,173,216,0.35)",
        icon: Building2,
        news: "Term 1 is ACTIVE! Term 2 applications open April 14.",
        highlight: "Work on 50+ Linux Foundation projects across 3 annual terms",
    },
    {
        id: "mlh",
        name: "MLH Fellowship",
        shortName: "MLH Fellowship 2026",
        org: "Major League Hacking",
        description: "A remote internship alternative for software engineers. Fellows contribute to open source projects used by companies worldwide across 3 specialized tracks.",
        status: "applications_open",
        stipend: "$5,000 USD",
        stipendRaw: "$5,000",
        duration: "12 weeks · Multiple cohorts",
        eligibility: ["18+ · Enrolled or recent grad", "Intermediate coding skills", "Passion for open source", "Available for cohort schedule"],
        tags: ["Fellowship", "Networking", "Open Source"],
        phases: [
            { name: "Spring 2026 cohort", date: "Jan 12, 2026", done: true },
            { name: "Summer apps open", date: "Mar 1, 2026" },
            { name: "Summer cohort starts", date: "May 25, 2026" },
            { name: "Fall apps open", date: "Jul 1, 2026" },
            { name: "Fall cohort starts", date: "Sep 7, 2026" },
        ],
        link: "https://fellowship.mlh.io",
        applyLink: "https://fellowship.mlh.io/programs/open-source",
        gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
        glowColor: "rgba(139,92,246,0.35)",
        icon: Flame,
        news: "Summer 2026 applications open March 1 — 3 tracks available!",
        highlight: "3 tracks: Open Source · Explorer · OSS Creator",
    },
    {
        id: "seasonofdocs",
        name: "Season of Docs",
        shortName: "Season of Docs 2026",
        org: "Google",
        description: "Season of Docs supports open source projects in improving their documentation and gives technical writers experience in open source collaboration.",
        status: "announced",
        stipend: "$5,000 – $15,000",
        stipendRaw: "up to $15,000",
        duration: "~6 months",
        eligibility: ["Technical writer (pro or aspiring)", "Not a Google employee", "18+", "10–20 hrs/week available"],
        tags: ["Docs", "Technical Writing", "Google"],
        phases: [
            { name: "Program announced", date: "Feb 2026", done: true },
            { name: "Organizations apply", date: "Mar–Apr 2026" },
            { name: "Writers apply to orgs", date: "Apr–May 2026" },
            { name: "Doc development phase", date: "May–Nov 2026" },
            { name: "Case study submissions", date: "Dec 2026" },
        ],
        link: "https://developers.google.com/season-of-docs",
        applyLink: "https://developers.google.com/season-of-docs/docs/tech-writer-guide",
        gradient: "linear-gradient(135deg, #34A853 0%, #0F9D58 100%)",
        glowColor: "rgba(52,168,83,0.35)",
        icon: BookOpen,
        news: "Announced for 2026! Organization applications open in March.",
        highlight: "Highest-paying technical writing open source opportunity",
    },
    {
        id: "hacktoberfest",
        name: "Hacktoberfest",
        shortName: "Hacktoberfest 2026",
        org: "DigitalOcean",
        description: "Month-long celebration of open source. Submit 4 valid PRs during October and earn a digital badge. Zero experience required — perfect for first contributors.",
        status: "upcoming",
        stipend: "Free digital rewards",
        stipendRaw: "Swag + badge",
        duration: "1 month · All of October",
        eligibility: ["Anyone worldwide", "Any skill level", "Register on hacktoberfest.com", "4 valid PRs in October"],
        tags: ["Beginner", "Community", "No Stipend"],
        phases: [
            { name: "Registration opens", date: "Sep 1, 2026" },
            { name: "Hacktoberfest begins", date: "Oct 1, 2026" },
            { name: "PR deadline", date: "Oct 31, 2026" },
            { name: "Badge awarded", date: "Nov 2026" },
        ],
        link: "https://hacktoberfest.com",
        applyLink: "https://hacktoberfest.com",
        gradient: "linear-gradient(135deg, #FF6B35 0%, #E91E8C 100%)",
        glowColor: "rgba(255,107,53,0.35)",
        icon: Flame,
        news: "Kicks off October 2026 — the best entry point for first-time contributors.",
        highlight: "The world's most beginner-friendly open source event",
    },
    {
        id: "gssoc",
        name: "GirlScript Summer of Code",
        shortName: "GSSoC 2026",
        org: "GirlScript Foundation",
        description: "3-month open source program by GirlScript Foundation, focusing on beginner contributors. Projects span web dev, mobile, AI, data science and more.",
        status: "upcoming",
        stipend: "Swag + Certificates",
        stipendRaw: "Swag + certs",
        duration: "~3 months · May – Jul",
        eligibility: ["Open to everyone", "Students preferred", "Any experience level", "Indian participants prioritized"],
        tags: ["India", "Beginner", "Web Dev"],
        phases: [
            { name: "Program announced", date: "Mar 2026" },
            { name: "Contributor registration", date: "Mar–Apr 2026" },
            { name: "Coding phase begins", date: "May 1, 2026" },
            { name: "Midpoint review", date: "Jun 15, 2026" },
            { name: "Program ends", date: "Jul 31, 2026" },
            { name: "GSSoC Extended", date: "Sep–Oct 2026" },
        ],
        link: "https://gssoc.girlscript.tech",
        applyLink: "https://gssoc.girlscript.tech",
        gradient: "linear-gradient(135deg, #FF4088 0%, #FF6B35 100%)",
        glowColor: "rgba(255,64,136,0.35)",
        icon: Sparkles,
        news: "Announcement coming in March 2026 — perfect for Indian beginners!",
        highlight: "India's most popular beginner open source program",
    },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<ProgramStatus, { label: string; cls: string }> = {
    applications_open: { label: "Apply Now", cls: "bg-success/15 text-success border-success/30" },
    active: { label: "Active", cls: "bg-primary/15 text-primary border-primary/30" },
    upcoming: { label: "Coming Soon", cls: "bg-warning/15 text-warning border-warning/30" },
    announced: { label: "Announced", cls: "bg-purple-400/15 text-purple-300 border-purple-400/30" },
    closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ program, onClick }: { program: Program; onClick: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current!.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleLeave = () => { x.set(0); y.set(0); };

    const Icon = program.icon;
    const status = STATUS[program.status];
    const doneCount = program.phases.filter((p) => p.done).length;
    const progress = Math.round((doneCount / program.phases.length) * 100);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            onClick={onClick}
            style={{ rotateX, rotateY, transformPerspective: 1000, boxShadow: `0 0 0 0 ${program.glowColor}` }}
            whileHover={{ scale: 1.03, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            className="relative cursor-pointer rounded-2xl overflow-hidden group transition-shadow"
        >
            {/* Glow on hover */}
            <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 40px 10px ${program.glowColor}` }}
            />

            {/* Card body */}
            <div
                className="relative h-full flex flex-col p-5 rounded-2xl border border-white/10"
                style={{ background: "hsl(var(--card))" }}
            >
                {/* Gradient strip top */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: program.gradient }} />

                {/* Ambient gradient bg */}
                <div
                    className="absolute inset-0 opacity-[0.04] rounded-2xl pointer-events-none"
                    style={{ background: program.gradient }}
                />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    {/* Icon with gradient ring */}
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: program.gradient, boxShadow: `0 4px 20px ${program.glowColor}` }}
                    >
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>
                        {status.label}
                    </span>
                </div>

                {/* Name + org */}
                <h3 className="text-sm font-bold text-foreground leading-tight">{program.shortName}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">{program.org}</p>

                {/* Highlight */}
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{program.highlight}</p>

                {/* Stipend pill */}
                <div
                    className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full self-start"
                    style={{ background: `${program.glowColor.replace("0.35", "0.12")}`, color: "inherit", border: `1px solid ${program.glowColor}` }}
                >
                    <DollarSign className="w-3 h-3" />
                    {program.stipendRaw}
                </div>

                {/* Timeline progress */}
                <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Timeline progress</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: program.gradient }}
                        />
                    </div>
                </div>

                {/* Duration + CTA */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {program.duration}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                        View details <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ program, onClose }: { program: Program; onClose: () => void }) {
    const Icon = program.icon;
    const status = STATUS[program.status];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl"
                    style={{ background: "hsl(var(--card))" }}
                >
                    {/* Gradient header */}
                    <div className="relative p-6 pb-4" style={{ background: `${program.gradient}20`, borderBottom: "1px solid hsl(var(--border))" }}>
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: program.gradient }} />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: program.gradient, boxShadow: `0 8px 30px ${program.glowColor}` }}
                            >
                                <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg font-bold text-foreground">{program.shortName}</h2>
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{program.org}</p>
                            </div>
                        </div>

                        {/* News banner */}
                        <div
                            className="mt-4 flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-sm"
                            style={{ background: `${program.glowColor.replace("0.35", "0.1")}`, border: `1px solid ${program.glowColor.replace("0.35", "0.3")}` }}
                        >
                            <Zap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--warning))" }} />
                            <span className="text-foreground font-medium leading-relaxed">{program.news}</span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 grid md:grid-cols-2 gap-8">

                        {/* Left */}
                        <div className="space-y-6">
                            {/* About */}
                            <div>
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">About</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>
                            </div>

                            {/* Quick stats */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: DollarSign, label: "Stipend", value: program.stipend, color: "text-success" },
                                    { icon: Clock, label: "Duration", value: program.duration, color: "text-primary" },
                                    { icon: Globe, label: "Format", value: "Remote · Global", color: "text-muted-foreground" },
                                    { icon: Star, label: "Org", value: program.org, color: "text-muted-foreground" },
                                ].map((s) => (
                                    <div key={s.label} className="bg-secondary/50 border border-border/50 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <s.icon className={`w-3 h-3 ${s.color}`} />
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{s.label}</span>
                                        </div>
                                        <p className="text-xs font-semibold text-foreground leading-tight">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Eligibility */}
                            <div>
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Eligibility</h4>
                                <ul className="space-y-2">
                                    {program.eligibility.map((e, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-start gap-2 text-sm text-foreground"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                            {e}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                                {program.tags.map((t) => (
                                    <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right — Timeline */}
                        <div>
                            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">2026 Timeline</h4>
                            <div className="relative pl-5 space-y-4">
                                <div className="absolute left-[9px] top-1 bottom-1 w-px" style={{ background: program.gradient, opacity: 0.3 }} />
                                {program.phases.map((phase, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="relative flex items-start gap-3"
                                    >
                                        {/* Dot */}
                                        <div
                                            className="absolute -left-[14px] top-[5px] w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                            style={{
                                                background: phase.done ? program.gradient : "hsl(var(--card))",
                                                borderColor: phase.done ? "transparent" : "hsl(var(--border))",
                                            }}
                                        >
                                            {phase.done && <CheckCircle2 className="w-2 h-2 text-white" />}
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-[13px] font-medium ${phase.done ? "text-muted-foreground/60 line-through" : "text-foreground"}`}>
                                                {phase.name}
                                            </p>
                                            <p className={`text-xs mt-0.5 font-semibold ${phase.done ? "text-muted-foreground/50" : ""}`}
                                                style={!phase.done ? { color: program.glowColor.replace("0.35", "0.9").replace("rgba", "rgb").replace(/,\s*[\d.]+\)/, ")") } : {}}>
                                                {phase.date}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Apply CTA */}
                            {program.applyLink && (
                                <motion.a
                                    href={program.applyLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
                                    style={{ background: program.gradient, boxShadow: `0 4px 20px ${program.glowColor}` }}
                                >
                                    Apply Now <ExternalLink className="w-4 h-4" />
                                </motion.a>
                            )}
                            <a
                                href={program.link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Official website <ChevronRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const OpenSourcePrograms = () => {
    const [selected, setSelected] = useState<Program | null>(null);
    const [filter, setFilter] = useState<ProgramStatus | "all">("all");
    const [search, setSearch] = useState("");

    const filtered = PROGRAMS.filter((p) => {
        const matchStatus = filter === "all" || p.status === filter;
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.org.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
        return matchStatus && matchSearch;
    });

    const counts: Record<string, number> = { all: PROGRAMS.length };
    PROGRAMS.forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });

    const openNow = PROGRAMS.filter((p) => p.status === "applications_open");

    const filterOptions: { value: ProgramStatus | "all"; label: string }[] = [
        { value: "all", label: "All" },
        { value: "applications_open", label: "Apply Now 🔥" },
        { value: "upcoming", label: "Upcoming" },
        { value: "announced", label: "Announced" },
        { value: "closed", label: "Closed" },
    ];

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold section-heading gradient-accent-static">Open Source Programs</h1>
                <p className="text-muted-foreground text-sm mt-2 ml-4">
                    Interactive dashboard of 2026 open source internship programs — click any card for full details
                </p>
            </motion.div>

            {/* Hero stats row */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {[
                    { icon: Globe, label: "Programs Listed", value: PROGRAMS.length, color: "text-primary", gradient: "from-primary/20 to-primary/5" },
                    { icon: Target, label: "Apply Now", value: counts.applications_open ?? 0, color: "text-success", gradient: "from-success/20 to-success/5" },
                    { icon: Clock, label: "Coming Soon", value: counts.upcoming ?? 0, color: "text-warning", gradient: "from-warning/20 to-warning/5" },
                    { icon: Trophy, label: "Total Stipend Pool", value: "~$50K+", color: "text-amber-400", gradient: "from-amber-400/20 to-amber-400/5" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className={`stat-card bg-gradient-to-br ${stat.gradient}`}
                    >
                        <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Apply Now banner */}
            {openNow.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-success/25 overflow-hidden"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)), rgba(var(--success),0.05))" }}
                >
                    <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Applications Open Right Now</p>
                                <p className="text-xs text-muted-foreground">{openNow.map((p) => p.shortName).join(" · ")}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setFilter("applications_open")}
                            className="flex items-center gap-2 bg-success text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Show only open <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Filter + Search */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === opt.value
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {opt.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === opt.value ? "bg-white/20" : "bg-background/60"}`}>
                                {counts[opt.value] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative sm:w-52 shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search programs…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-secondary/40 border border-border rounded-xl py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none input-glow"
                    />
                </div>
            </motion.div>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 border border-border rounded-xl px-4 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                Dates are estimated from 2025 patterns. Always verify on the official website before applying.
            </div>

            {/* Card grid */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
                <AnimatePresence mode="popLayout">
                    {filtered.map((program, i) => (
                        <motion.div
                            key={program.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <TiltCard program={program} onClick={() => setSelected(program)} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
                        No programs match your filters.
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selected && <DetailModal program={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default OpenSourcePrograms;
