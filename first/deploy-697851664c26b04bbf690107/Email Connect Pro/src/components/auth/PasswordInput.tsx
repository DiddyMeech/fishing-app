import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { getProviderFromEmail } from "@/lib/providerConfig";

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  provider: ReturnType<typeof getProviderFromEmail>;
  autoComplete: string;
  placeholder?: string;
  error?: string;
}

export const PasswordInput = ({ value, onChange, show, onToggle, provider, autoComplete, placeholder = "Password", error }: PasswordInputProps) => (
  <div className="space-y-1.5">
    <div className="relative">
      <motion.div 
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10" 
        animate={{ color: error ? "hsl(0 70% 50%)" : `hsl(${provider.primaryColor})` }} 
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <Lock className="w-4 h-4" />
      </motion.div>
      <input
        type={show ? "text" : "password"}
        name="password"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none backdrop-blur-md"
        style={{
          backgroundColor: error ? "hsl(0 30% 96% / 0.7)" : provider.inputBg.replace(")", " / 0.7)"),
          border: `2px solid ${error ? "hsl(0 50% 80%)" : provider.inputBorder}`,
          color: `hsl(${provider.textColor})`,
          transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
        }}
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2">
        <motion.div animate={{ color: `hsl(${provider.primaryColor} / 0.55)` }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </motion.div>
      </button>
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
