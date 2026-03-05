import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, ShieldX } from "lucide-react";
import { getProviderFromEmail } from "@/lib/providerConfig";

interface EmailInputProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  provider: ReturnType<typeof getProviderFromEmail>;
  isDetected: boolean;
  isBlocked: boolean;
  isVerifying: boolean;
  error?: string;
}

export const EmailInput = ({ email, onChange, provider, isDetected, isBlocked, isVerifying, error }: EmailInputProps) => (
  <div className="space-y-1.5">
    <div className="relative">
      <motion.div
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
        animate={{ color: error ? "hsl(0 70% 50%)" : isBlocked ? "hsl(0 70% 50%)" : isVerifying ? "hsl(45 80% 45%)" : isDetected ? `hsl(${provider.primaryColor})` : "hsl(220 14% 55%)" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Mail className="w-4 h-4" />
      </motion.div>
      <input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none backdrop-blur-md"
        style={{
          backgroundColor: error || isBlocked ? "hsl(0 30% 96% / 0.7)" : isDetected ? provider.inputBg.replace(")", " / 0.7)") : "hsl(220 14% 96% / 0.7)",
          border: `2px solid ${error || isBlocked ? "hsl(0 50% 80%)" : isDetected ? provider.inputBorder : "hsl(220 14% 88%)"}`,
          color: `hsl(${provider.textColor})`,
          transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
        }}
      />
      <AnimatePresence>
        {isVerifying ? (
          <motion.div
            key="verifying"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "hsl(45 80% 45%)" }} />
          </motion.div>
        ) : (isBlocked || error) ? (
          <motion.div
            key="blocked-error"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <ShieldX className="w-4 h-4" style={{ color: "hsl(0 70% 50%)" }} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -5, height: 0 }}
          className="text-xs font-semibold text-destructive px-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);
