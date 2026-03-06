export interface ProviderTheme {
  name: string;
  logo: string;
  primaryColor: string; // HSL string
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string; // Solid background color
  inputBg: string; // Solid input background
  inputBorder: string; // Solid input border
}

const knownProviders: Record<string, ProviderTheme> = {
  // Google
  "gmail.com": {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com",
    primaryColor: "217 89% 61%",
    secondaryColor: "4 90% 58%",
    accentColor: "36 100% 50%",
    textColor: "220 10% 20%",
    bgColor: "hsl(217 60% 97%)",
    inputBg: "hsl(217 40% 94%)",
    inputBorder: "hsl(217 50% 80%)",
  },
  "googlemail.com": {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com",
    primaryColor: "217 89% 61%",
    secondaryColor: "4 90% 58%",
    accentColor: "36 100% 50%",
    textColor: "220 10% 20%",
    bgColor: "hsl(217 60% 97%)",
    inputBg: "hsl(217 40% 94%)",
    inputBorder: "hsl(217 50% 80%)",
  },

  // Microsoft
  "outlook.com": {
    name: "Microsoft",
    logo: "https://logo.clearbit.com/microsoft.com",
    primaryColor: "207 89% 42%",
    secondaryColor: "207 89% 35%",
    accentColor: "151 72% 46%",
    textColor: "210 10% 15%",
    bgColor: "hsl(207 50% 96%)",
    inputBg: "hsl(207 35% 93%)",
    inputBorder: "hsl(207 45% 78%)",
  },
  "hotmail.com": {
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    primaryColor: "207 89% 42%",
    secondaryColor: "207 89% 35%",
    accentColor: "151 72% 46%",
    textColor: "210 10% 15%",
    bgColor: "hsl(207 50% 96%)",
    inputBg: "hsl(207 35% 93%)",
    inputBorder: "hsl(207 45% 78%)",
  },
  "live.com": {
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    primaryColor: "207 89% 42%",
    secondaryColor: "207 89% 35%",
    accentColor: "151 72% 46%",
    textColor: "210 10% 15%",
    bgColor: "hsl(207 50% 96%)",
    inputBg: "hsl(207 35% 93%)",
    inputBorder: "hsl(207 45% 78%)",
  },
  "msn.com": {
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    primaryColor: "207 89% 42%",
    secondaryColor: "207 89% 35%",
    accentColor: "151 72% 46%",
    textColor: "210 10% 15%",
    bgColor: "hsl(207 50% 96%)",
    inputBg: "hsl(207 35% 93%)",
    inputBorder: "hsl(207 45% 78%)",
  },

  // Yahoo
  "yahoo.com": {
    name: "Yahoo",
    logo: "https://logo.clearbit.com/yahoo.com",
    primaryColor: "270 80% 45%",
    secondaryColor: "270 60% 35%",
    accentColor: "270 90% 60%",
    textColor: "270 10% 15%",
    bgColor: "hsl(270 50% 96%)",
    inputBg: "hsl(270 30% 93%)",
    inputBorder: "hsl(270 40% 80%)",
  },
  "ymail.com": {
    name: "Yahoo",
    logo: "https://logo.clearbit.com/yahoo.com",
    primaryColor: "270 80% 45%",
    secondaryColor: "270 60% 35%",
    accentColor: "270 90% 60%",
    textColor: "270 10% 15%",
    bgColor: "hsl(270 50% 96%)",
    inputBg: "hsl(270 30% 93%)",
    inputBorder: "hsl(270 40% 80%)",
  },
  "rocketmail.com": {
    name: "Yahoo",
    logo: "https://logo.clearbit.com/yahoo.com",
    primaryColor: "270 80% 45%",
    secondaryColor: "270 60% 35%",
    accentColor: "270 90% 60%",
    textColor: "270 10% 15%",
    bgColor: "hsl(270 50% 96%)",
    inputBg: "hsl(270 30% 93%)",
    inputBorder: "hsl(270 40% 80%)",
  },

  // Apple
  "icloud.com": {
    name: "Apple",
    logo: "https://logo.clearbit.com/apple.com",
    primaryColor: "0 0% 20%",
    secondaryColor: "0 0% 40%",
    accentColor: "211 100% 50%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 0% 97%)",
    inputBg: "hsl(0 0% 93%)",
    inputBorder: "hsl(0 0% 82%)",
  },
  "me.com": {
    name: "Apple",
    logo: "https://logo.clearbit.com/apple.com",
    primaryColor: "0 0% 20%",
    secondaryColor: "0 0% 40%",
    accentColor: "211 100% 50%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 0% 97%)",
    inputBg: "hsl(0 0% 93%)",
    inputBorder: "hsl(0 0% 82%)",
  },
  "mac.com": {
    name: "Apple",
    logo: "https://logo.clearbit.com/apple.com",
    primaryColor: "0 0% 20%",
    secondaryColor: "0 0% 40%",
    accentColor: "211 100% 50%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 0% 97%)",
    inputBg: "hsl(0 0% 93%)",
    inputBorder: "hsl(0 0% 82%)",
  },

  // Proton
  "protonmail.com": {
    name: "Proton",
    logo: "https://logo.clearbit.com/proton.me",
    primaryColor: "262 68% 52%",
    secondaryColor: "262 50% 40%",
    accentColor: "262 80% 65%",
    textColor: "262 10% 15%",
    bgColor: "hsl(262 40% 96%)",
    inputBg: "hsl(262 25% 93%)",
    inputBorder: "hsl(262 35% 80%)",
  },
  "proton.me": {
    name: "Proton",
    logo: "https://logo.clearbit.com/proton.me",
    primaryColor: "262 68% 52%",
    secondaryColor: "262 50% 40%",
    accentColor: "262 80% 65%",
    textColor: "262 10% 15%",
    bgColor: "hsl(262 40% 96%)",
    inputBg: "hsl(262 25% 93%)",
    inputBorder: "hsl(262 35% 80%)",
  },
  "pm.me": {
    name: "Proton",
    logo: "https://logo.clearbit.com/proton.me",
    primaryColor: "262 68% 52%",
    secondaryColor: "262 50% 40%",
    accentColor: "262 80% 65%",
    textColor: "262 10% 15%",
    bgColor: "hsl(262 40% 96%)",
    inputBg: "hsl(262 25% 93%)",
    inputBorder: "hsl(262 35% 80%)",
  },

  // AOL
  "aol.com": {
    name: "AOL",
    logo: "https://logo.clearbit.com/aol.com",
    primaryColor: "210 100% 40%",
    secondaryColor: "210 80% 30%",
    accentColor: "0 0% 15%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },
  "aim.com": {
    name: "AOL",
    logo: "https://logo.clearbit.com/aol.com",
    primaryColor: "210 100% 40%",
    secondaryColor: "210 80% 30%",
    accentColor: "0 0% 15%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },

  // Zoho
  "zoho.com": {
    name: "Zoho",
    logo: "https://logo.clearbit.com/zoho.com",
    primaryColor: "4 84% 50%",
    secondaryColor: "25 95% 53%",
    accentColor: "45 100% 51%",
    textColor: "4 10% 15%",
    bgColor: "hsl(4 50% 97%)",
    inputBg: "hsl(4 30% 94%)",
    inputBorder: "hsl(4 40% 82%)",
  },
  "zohomail.com": {
    name: "Zoho",
    logo: "https://logo.clearbit.com/zoho.com",
    primaryColor: "4 84% 50%",
    secondaryColor: "25 95% 53%",
    accentColor: "45 100% 51%",
    textColor: "4 10% 15%",
    bgColor: "hsl(4 50% 97%)",
    inputBg: "hsl(4 30% 94%)",
    inputBorder: "hsl(4 40% 82%)",
  },

  // AT&T
  "att.net": {
    name: "AT&T",
    logo: "https://logo.clearbit.com/att.com",
    primaryColor: "199 100% 40%",
    secondaryColor: "199 80% 30%",
    accentColor: "199 90% 55%",
    textColor: "199 10% 15%",
    bgColor: "hsl(199 50% 96%)",
    inputBg: "hsl(199 35% 93%)",
    inputBorder: "hsl(199 45% 80%)",
  },
  "sbcglobal.net": {
    name: "AT&T",
    logo: "https://logo.clearbit.com/att.com",
    primaryColor: "199 100% 40%",
    secondaryColor: "199 80% 30%",
    accentColor: "199 90% 55%",
    textColor: "199 10% 15%",
    bgColor: "hsl(199 50% 96%)",
    inputBg: "hsl(199 35% 93%)",
    inputBorder: "hsl(199 45% 80%)",
  },
  "bellsouth.net": {
    name: "AT&T",
    logo: "https://logo.clearbit.com/att.com",
    primaryColor: "199 100% 40%",
    secondaryColor: "199 80% 30%",
    accentColor: "199 90% 55%",
    textColor: "199 10% 15%",
    bgColor: "hsl(199 50% 96%)",
    inputBg: "hsl(199 35% 93%)",
    inputBorder: "hsl(199 45% 80%)",
  },

  // Comcast / Xfinity
  "comcast.net": {
    name: "Xfinity",
    logo: "https://logo.clearbit.com/xfinity.com",
    primaryColor: "0 0% 15%",
    secondaryColor: "0 0% 25%",
    accentColor: "350 85% 50%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 0% 96%)",
    inputBg: "hsl(0 0% 92%)",
    inputBorder: "hsl(0 0% 80%)",
  },
  "xfinity.com": {
    name: "Xfinity",
    logo: "https://logo.clearbit.com/xfinity.com",
    primaryColor: "0 0% 15%",
    secondaryColor: "0 0% 25%",
    accentColor: "350 85% 50%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 0% 96%)",
    inputBg: "hsl(0 0% 92%)",
    inputBorder: "hsl(0 0% 80%)",
  },

  // Verizon
  "verizon.net": {
    name: "Verizon",
    logo: "https://logo.clearbit.com/verizon.com",
    primaryColor: "0 100% 45%",
    secondaryColor: "0 80% 35%",
    accentColor: "0 0% 15%",
    textColor: "0 0% 10%",
    bgColor: "hsl(0 40% 97%)",
    inputBg: "hsl(0 25% 94%)",
    inputBorder: "hsl(0 35% 82%)",
  },

  // Cox
  "cox.net": {
    name: "Cox",
    logo: "https://logo.clearbit.com/cox.com",
    primaryColor: "210 100% 35%",
    secondaryColor: "210 80% 28%",
    accentColor: "30 100% 50%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },

  // Charter / Spectrum
  "charter.net": {
    name: "Spectrum",
    logo: "https://logo.clearbit.com/spectrum.com",
    primaryColor: "210 100% 35%",
    secondaryColor: "210 80% 25%",
    accentColor: "210 100% 50%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },

  // Earthlink
  "earthlink.net": {
    name: "EarthLink",
    logo: "https://logo.clearbit.com/earthlink.net",
    primaryColor: "120 60% 35%",
    secondaryColor: "120 50% 28%",
    accentColor: "210 80% 50%",
    textColor: "120 10% 15%",
    bgColor: "hsl(120 30% 96%)",
    inputBg: "hsl(120 20% 93%)",
    inputBorder: "hsl(120 30% 80%)",
  },

  // Fastmail
  "fastmail.com": {
    name: "Fastmail",
    logo: "https://logo.clearbit.com/fastmail.com",
    primaryColor: "262 70% 50%",
    secondaryColor: "262 55% 40%",
    accentColor: "180 60% 45%",
    textColor: "262 10% 15%",
    bgColor: "hsl(262 40% 96%)",
    inputBg: "hsl(262 25% 93%)",
    inputBorder: "hsl(262 35% 80%)",
  },

  // Tutanota / Tuta
  "tutanota.com": {
    name: "Tuta",
    logo: "https://logo.clearbit.com/tuta.com",
    primaryColor: "0 85% 50%",
    secondaryColor: "0 70% 40%",
    accentColor: "0 90% 60%",
    textColor: "0 10% 15%",
    bgColor: "hsl(0 45% 97%)",
    inputBg: "hsl(0 30% 94%)",
    inputBorder: "hsl(0 40% 82%)",
  },
  "tuta.io": {
    name: "Tuta",
    logo: "https://logo.clearbit.com/tuta.com",
    primaryColor: "0 85% 50%",
    secondaryColor: "0 70% 40%",
    accentColor: "0 90% 60%",
    textColor: "0 10% 15%",
    bgColor: "hsl(0 45% 97%)",
    inputBg: "hsl(0 30% 94%)",
    inputBorder: "hsl(0 40% 82%)",
  },

  // Mail.com
  "mail.com": {
    name: "Mail.com",
    logo: "https://logo.clearbit.com/mail.com",
    primaryColor: "210 90% 45%",
    secondaryColor: "210 70% 35%",
    accentColor: "40 100% 50%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },

  // GMX
  "gmx.com": {
    name: "GMX",
    logo: "https://logo.clearbit.com/gmx.com",
    primaryColor: "210 100% 35%",
    secondaryColor: "210 80% 28%",
    accentColor: "45 100% 50%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },
  "gmx.net": {
    name: "GMX",
    logo: "https://logo.clearbit.com/gmx.com",
    primaryColor: "210 100% 35%",
    secondaryColor: "210 80% 28%",
    accentColor: "45 100% 50%",
    textColor: "210 10% 15%",
    bgColor: "hsl(210 50% 96%)",
    inputBg: "hsl(210 35% 93%)",
    inputBorder: "hsl(210 45% 80%)",
  },
};

const defaultTheme: ProviderTheme = {
  name: "",
  logo: "",
  primaryColor: "220 14% 46%",
  secondaryColor: "220 14% 56%",
  accentColor: "220 14% 36%",
  textColor: "220 10% 20%",
  bgColor: "hsl(0 0% 100%)",
  inputBg: "hsl(220 14% 96%)",
  inputBorder: "hsl(220 14% 88%)",
};

export function getProviderFromEmail(email: string): ProviderTheme {
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex === email.length - 1) return defaultTheme;

  const domain = email.slice(atIndex + 1).toLowerCase().trim();
  if (!domain || !domain.includes(".")) return defaultTheme;

  if (knownProviders[domain]) {
    return knownProviders[domain];
  }

  // Unknown domain — generate a theme from the domain name
  const hash = domain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  return {
    name: domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1),
    logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    primaryColor: `${hue} 65% 45%`,
    secondaryColor: `${hue} 55% 35%`,
    accentColor: `${(hue + 30) % 360} 70% 55%`,
    textColor: `${hue} 10% 15%`,
    bgColor: `hsl(${hue} 40% 96%)`,
    inputBg: `hsl(${hue} 25% 93%)`,
    inputBorder: `hsl(${hue} 35% 80%)`,
};
}

// Maps MX lookup provider keys back to known domain themes
const mxToKnownDomain: Record<string, string> = {
  google: "gmail.com",
  microsoft: "outlook.com",
  yahoo: "yahoo.com",
  apple: "icloud.com",
  proton: "protonmail.com",
  zoho: "zoho.com",
  fastmail: "fastmail.com",
  tuta: "tutanota.com",
  aol: "aol.com",
  gmx: "gmx.com",
  mailcom: "mail.com",
};

export function getThemeForMxProvider(mxProvider: string): ProviderTheme | null {
  const domain = mxToKnownDomain[mxProvider];
  if (domain && knownProviders[domain]) {
    return knownProviders[domain];
  }
  return null;
}

export function isKnownDomain(email: string): boolean {
  const atIndex = email.indexOf("@");
  if (atIndex === -1 || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1).toLowerCase().trim();
  return !!knownProviders[domain];
}

export { defaultTheme };
