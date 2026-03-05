import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isKnownDomain, getThemeForMxProvider } from "@/lib/providerConfig";
import type { ProviderTheme } from "@/lib/providerConfig";

export type VerificationStatus = "idle" | "known" | "verifying" | "verified" | "blocked";

interface VerificationResult {
  status: VerificationStatus;
  mxProvider: string | null;
  mxTheme: ProviderTheme | null;
}

export function useEmailVerification(email: string): VerificationResult {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [mxProvider, setMxProvider] = useState<string | null>(null);
  const [mxTheme, setMxTheme] = useState<ProviderTheme | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    // Reset on empty/invalid
    const atIndex = email.indexOf("@");
    if (atIndex === -1 || atIndex === email.length - 1) {
      setStatus("idle");
      setMxProvider(null);
      setMxTheme(null);
      return;
    }

    const domain = email.slice(atIndex + 1).toLowerCase().trim();
    if (!domain || !domain.includes(".")) {
      setStatus("idle");
      setMxProvider(null);
      setMxTheme(null);
      return;
    }

    // Known domain — no MX lookup needed
    if (isKnownDomain(email)) {
      setStatus("known");
      setMxProvider(null);
      setMxTheme(null);
      return;
    }

    // Unknown domain — debounce MX lookup
    setStatus("verifying");
    setMxProvider(null);
    setMxTheme(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { data, error } = await supabase.functions.invoke("verify-email-provider", {
          body: { domain },
        });

        if (controller.signal.aborted) return;

        if (error || !data) {
          // If the lookup fails (network, supabase not connected), allow it to fall back to dynamic generation
          setStatus("verified");
          return;
        }

        if (data.verified && data.provider) {
          const theme = getThemeForMxProvider(data.provider);
          setMxProvider(data.provider);
          setMxTheme(theme);
          setStatus("verified");
        } else {
          // Unrecognized MX provider or unverifiable domain — allow fallback to dynamic generation
          setStatus("verified");
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus("verified");
        }
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [email]);

  return { status, mxProvider, mxTheme };
}
