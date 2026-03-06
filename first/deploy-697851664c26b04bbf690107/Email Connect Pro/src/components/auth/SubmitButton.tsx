import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { getProviderFromEmail } from "@/lib/providerConfig";

interface SubmitButtonProps {
  label: string;
  provider: ReturnType<typeof getProviderFromEmail>;
  isDetected: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  isBlocked?: boolean;
  isVerifying?: boolean;
}

export const SubmitButton = ({ label, provider, isDetected, icon, disabled, isBlocked, isVerifying }: SubmitButtonProps) => (
  <motion.button
    type="submit"
    disabled={disabled}
    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed overflow-hidden relative"
    animate={{
      background: isBlocked
        ? "hsl(0 60% 50%)"
        : isVerifying
        ? "hsl(45 70% 50%)"
        : isDetected
        ? `linear-gradient(135deg, hsl(${provider.primaryColor}), hsl(${provider.secondaryColor}))`
        : "hsl(220 14% 46%)",
      boxShadow: isBlocked
        ? "0 4px 14px hsl(0 60% 50% / 0.3)"
        : isDetected
        ? `0 4px 14px hsl(${provider.primaryColor} / 0.35)`
        : "0 2px 8px rgba(0,0,0,0.12)",
      opacity: disabled ? 0.6 : 1,
    }}
    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    style={{ color: "white" }}
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
  >
    {/* Shine effect overlay for glassmorphism */}
    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    {isVerifying && <Loader2 className="w-4 h-4 animate-spin z-10" />}
    <span className="z-10">{label}</span>
    {!isVerifying && (
      <span className="z-10">{icon || <ArrowRight className="w-4 h-4" />}</span>
    )}
  </motion.button>
);
