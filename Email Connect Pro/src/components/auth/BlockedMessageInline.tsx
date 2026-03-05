import { motion } from "framer-motion";

export const BlockedMessageInline = () => (
  <motion.div
    className="rounded-xl p-4 text-center space-y-2 backdrop-blur-md"
    style={{ backgroundColor: "hsl(0 50% 97% / 0.8)", border: "1px solid hsl(0 40% 88%)" }}
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
  >
    <p className="text-xs font-semibold" style={{ color: "hsl(0 60% 40%)" }}>
      This email provider is not recognized
    </p>
    <p className="text-[11px] leading-relaxed" style={{ color: "hsl(0 30% 50%)" }}>
      We currently support major providers only. Please sign in with one of the following:
    </p>
    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
      {["Gmail", "Outlook", "Yahoo", "iCloud", "ProtonMail", "AOL", "Zoho", "FastMail", "Tuta"].map((name) => (
        <span
          key={name}
          className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium"
          style={{ backgroundColor: "hsl(0 30% 93% / 0.8)", color: "hsl(0 40% 40%)" }}
        >
          {name}
        </span>
      ))}
    </div>
    <p className="text-[10px] pt-1" style={{ color: "hsl(0 20% 60%)" }}>
      US ISP emails (AT&T, Comcast, Verizon, etc.) are also supported.
    </p>
  </motion.div>
);
