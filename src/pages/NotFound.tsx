import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center app-bg">
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)", filter: "blur(80px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-8"
        style={{ background: "radial-gradient(circle, hsl(280 70% 65%), transparent)", filter: "blur(80px)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md px-6 relative"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-primary" />
        </div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-7xl font-black gradient-accent mb-4"
        >
          404
        </motion.p>

        <h1 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary mx-auto"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
