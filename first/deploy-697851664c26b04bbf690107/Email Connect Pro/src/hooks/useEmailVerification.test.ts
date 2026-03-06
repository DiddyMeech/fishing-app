import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmailVerification } from "./useEmailVerification";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: new Error("mock") }),
    },
  },
}));

describe("useEmailVerification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with idle status for empty email", () => {
    const { result } = renderHook(() => useEmailVerification(""));
    expect(result.current.status).toBe("idle");
    expect(result.current.mxProvider).toBeNull();
    expect(result.current.mxTheme).toBeNull();
  });

  it("returns idle for email without @", () => {
    const { result } = renderHook(() => useEmailVerification("noemail"));
    expect(result.current.status).toBe("idle");
  });

  it("returns idle for email with @ but no domain", () => {
    const { result } = renderHook(() => useEmailVerification("user@"));
    expect(result.current.status).toBe("idle");
  });

  it("returns idle for domain without dot", () => {
    const { result } = renderHook(() => useEmailVerification("user@nodot"));
    expect(result.current.status).toBe("idle");
  });

  it("returns known for recognized providers", () => {
    const { result: gmail } = renderHook(() => useEmailVerification("test@gmail.com"));
    expect(gmail.current.status).toBe("known");

    const { result: outlook } = renderHook(() => useEmailVerification("test@outlook.com"));
    expect(outlook.current.status).toBe("known");

    const { result: yahoo } = renderHook(() => useEmailVerification("test@yahoo.com"));
    expect(yahoo.current.status).toBe("known");

    const { result: icloud } = renderHook(() => useEmailVerification("test@icloud.com"));
    expect(icloud.current.status).toBe("known");
  });

  it("returns verifying then blocked for unknown domains", async () => {
    const { result } = renderHook(() => useEmailVerification("test@unknowncorp.xyz"));
    expect(result.current.status).toBe("verifying");

    // After debounce + edge function failure (mocked), should become blocked
    await act(async () => {
      vi.advanceTimersByTime(700);
      // Allow promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.status).toBe("blocked");
  });

  it("resets to idle when email is cleared", () => {
    const { result, rerender } = renderHook(
      ({ email }) => useEmailVerification(email),
      { initialProps: { email: "test@gmail.com" } }
    );
    expect(result.current.status).toBe("known");

    rerender({ email: "" });
    expect(result.current.status).toBe("idle");
  });

  it("transitions between providers correctly", () => {
    const { result, rerender } = renderHook(
      ({ email }) => useEmailVerification(email),
      { initialProps: { email: "test@gmail.com" } }
    );
    expect(result.current.status).toBe("known");

    rerender({ email: "test@outlook.com" });
    expect(result.current.status).toBe("known");

    rerender({ email: "test@yahoo.com" });
    expect(result.current.status).toBe("known");
  });

  it("transitions from known to verifying for unknown domain", () => {
    const { result, rerender } = renderHook(
      ({ email }) => useEmailVerification(email),
      { initialProps: { email: "test@gmail.com" } }
    );
    expect(result.current.status).toBe("known");

    rerender({ email: "test@unknowncorp.xyz" });
    expect(result.current.status).toBe("verifying");
  });
});
