import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — render only after mount
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-9 h-9" />;
    }

    const isDark = resolvedTheme === "dark";

    const cycleTheme = () => {
        if (theme === "dark") setTheme("light");
        else if (theme === "light") setTheme("system");
        else setTheme("dark");
    };

    const icon = theme === "system"
        ? <Monitor className="w-[17px] h-[17px]" />
        : isDark
            ? <Moon className="w-[17px] h-[17px]" />
            : <Sun className="w-[17px] h-[17px]" />;

    const label = theme === "system" ? "System" : isDark ? "Dark" : "Light";

    return (
        <motion.button
            onClick={cycleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            title={`Theme: ${label} — click to cycle`}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label={`Switch theme, current: ${label}`}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={theme + resolvedTheme}
                    initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center justify-center"
                >
                    {icon}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
};
