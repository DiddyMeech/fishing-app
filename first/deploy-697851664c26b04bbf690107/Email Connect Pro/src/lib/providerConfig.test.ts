import { describe, it, expect } from "vitest";
import {
  getProviderFromEmail,
  isKnownDomain,
  getThemeForMxProvider,
  defaultTheme,
} from "./providerConfig";

describe("isKnownDomain", () => {
  it("returns true for known domains", () => {
    expect(isKnownDomain("user@gmail.com")).toBe(true);
    expect(isKnownDomain("user@outlook.com")).toBe(true);
    expect(isKnownDomain("user@yahoo.com")).toBe(true);
    expect(isKnownDomain("user@icloud.com")).toBe(true);
    expect(isKnownDomain("user@protonmail.com")).toBe(true);
    expect(isKnownDomain("user@aol.com")).toBe(true);
    expect(isKnownDomain("user@zoho.com")).toBe(true);
    expect(isKnownDomain("user@fastmail.com")).toBe(true);
    expect(isKnownDomain("user@tutanota.com")).toBe(true);
    expect(isKnownDomain("user@tuta.io")).toBe(true);
  });

  it("returns true for domain aliases", () => {
    expect(isKnownDomain("user@googlemail.com")).toBe(true);
    expect(isKnownDomain("user@hotmail.com")).toBe(true);
    expect(isKnownDomain("user@live.com")).toBe(true);
    expect(isKnownDomain("user@ymail.com")).toBe(true);
    expect(isKnownDomain("user@me.com")).toBe(true);
    expect(isKnownDomain("user@pm.me")).toBe(true);
  });

  it("returns true for US ISP domains", () => {
    expect(isKnownDomain("user@att.net")).toBe(true);
    expect(isKnownDomain("user@comcast.net")).toBe(true);
    expect(isKnownDomain("user@verizon.net")).toBe(true);
    expect(isKnownDomain("user@cox.net")).toBe(true);
  });

  it("returns false for unknown domains", () => {
    expect(isKnownDomain("user@randomcorp.com")).toBe(false);
    expect(isKnownDomain("user@mycompany.io")).toBe(false);
  });

  it("returns false for invalid emails", () => {
    expect(isKnownDomain("")).toBe(false);
    expect(isKnownDomain("noatsign")).toBe(false);
    expect(isKnownDomain("user@")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isKnownDomain("user@Gmail.COM")).toBe(true);
    expect(isKnownDomain("user@OUTLOOK.com")).toBe(true);
  });
});

describe("getProviderFromEmail", () => {
  it("returns correct theme for known providers", () => {
    const gmail = getProviderFromEmail("user@gmail.com");
    expect(gmail.name).toBe("Google");
    expect(gmail.primaryColor).toBe("217 89% 61%");

    const outlook = getProviderFromEmail("user@outlook.com");
    expect(outlook.name).toBe("Microsoft");

    const yahoo = getProviderFromEmail("user@yahoo.com");
    expect(yahoo.name).toBe("Yahoo");

    const icloud = getProviderFromEmail("user@icloud.com");
    expect(icloud.name).toBe("Apple");

    const proton = getProviderFromEmail("user@protonmail.com");
    expect(proton.name).toBe("Proton");

    const tuta = getProviderFromEmail("user@tutanota.com");
    expect(tuta.name).toBe("Tuta");
  });

  it("returns same theme for domain aliases", () => {
    const gmail = getProviderFromEmail("user@gmail.com");
    const googlemail = getProviderFromEmail("user@googlemail.com");
    expect(gmail.name).toBe(googlemail.name);
    expect(gmail.primaryColor).toBe(googlemail.primaryColor);

    const outlook = getProviderFromEmail("user@outlook.com");
    const hotmail = getProviderFromEmail("user@hotmail.com");
    expect(outlook.name).toBe(hotmail.name);
  });

  it("generates a deterministic theme for unknown domains", () => {
    const theme1 = getProviderFromEmail("user@randomcorp.com");
    const theme2 = getProviderFromEmail("other@randomcorp.com");
    expect(theme1.name).toBe("Randomcorp");
    expect(theme1.primaryColor).toBe(theme2.primaryColor);
    expect(theme1.logo).toContain("randomcorp.com");
  });

  it("returns default theme for invalid emails", () => {
    expect(getProviderFromEmail("")).toBe(defaultTheme);
    expect(getProviderFromEmail("noat")).toBe(defaultTheme);
    expect(getProviderFromEmail("user@")).toBe(defaultTheme);
  });
});

describe("getThemeForMxProvider", () => {
  it("maps MX provider keys to known themes", () => {
    const google = getThemeForMxProvider("google");
    expect(google).not.toBeNull();
    expect(google!.name).toBe("Google");

    const microsoft = getThemeForMxProvider("microsoft");
    expect(microsoft).not.toBeNull();
    expect(microsoft!.name).toBe("Microsoft");

    const yahoo = getThemeForMxProvider("yahoo");
    expect(yahoo!.name).toBe("Yahoo");

    const apple = getThemeForMxProvider("apple");
    expect(apple!.name).toBe("Apple");

    const proton = getThemeForMxProvider("proton");
    expect(proton!.name).toBe("Proton");

    const tuta = getThemeForMxProvider("tuta");
    expect(tuta!.name).toBe("Tuta");
  });

  it("returns null for unknown MX providers", () => {
    expect(getThemeForMxProvider("unknown")).toBeNull();
    expect(getThemeForMxProvider("")).toBeNull();
  });
});

describe("theme structure", () => {
  it("all known provider themes have required fields", () => {
    const providers = [
      "user@gmail.com",
      "user@outlook.com",
      "user@yahoo.com",
      "user@icloud.com",
      "user@protonmail.com",
      "user@aol.com",
      "user@zoho.com",
      "user@fastmail.com",
      "user@tutanota.com",
      "user@att.net",
      "user@comcast.net",
    ];

    for (const email of providers) {
      const theme = getProviderFromEmail(email);
      expect(theme.name).toBeTruthy();
      expect(theme.primaryColor).toMatch(/^\d+ \d+% \d+%$/);
      expect(theme.bgColor).toContain("hsl(");
      expect(theme.inputBg).toContain("hsl(");
      expect(theme.inputBorder).toContain("hsl(");
    }
  });

  it("generated themes for unknown domains have valid HSL colors", () => {
    const theme = getProviderFromEmail("user@example.org");
    expect(theme.primaryColor).toMatch(/^\d+ \d+% \d+%$/);
    expect(theme.bgColor).toMatch(/^hsl\(/);
    expect(theme.logo).toBeTruthy();
    expect(theme.name).toBeTruthy();
  });
});
