import { useEffect, useCallback } from "react";

/**
 * Sends the document height to the parent window via postMessage
 * so the parent can resize the iframe dynamically.
 */
export function useIframeResize() {
  const sendHeight = useCallback(() => {
    const height = document.documentElement.scrollHeight;
    // Use VITE_PARENT_ORIGIN for security; fall back to "*" only in dev.
    // WARNING: "*" as targetOrigin is insecure in production — always set VITE_PARENT_ORIGIN.
    const parentOrigin = import.meta.env.VITE_PARENT_ORIGIN || "*";
    window.parent.postMessage({ type: "IFRAME_HEIGHT", height }, parentOrigin);
  }, []);

  useEffect(() => {
    // Send on initial load
    sendHeight();

    // Send on resize
    window.addEventListener("resize", sendHeight);

    // Observe DOM mutations for dynamic content changes
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
    };
  }, [sendHeight]);
}
