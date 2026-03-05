import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Maps common MX host patterns to known provider names
const mxProviderMap: Record<string, string> = {
  "google.com": "google",
  "googlemail.com": "google",
  "gmail-smtp-in.l.google.com": "google",
  "outlook.com": "microsoft",
  "protection.outlook.com": "microsoft",
  "mail.protection.outlook.com": "microsoft",
  "pphosted.com": "microsoft",
  "yahoodns.net": "yahoo",
  "yahoo.com": "yahoo",
  "icloud.com": "apple",
  "apple.com": "apple",
  "me.com": "apple",
  "zoho.com": "zoho",
  "zohomail.com": "zoho",
  "protonmail.ch": "proton",
  "proton.me": "proton",
  "fastmail.com": "fastmail",
  "messagingengine.com": "fastmail",
  "tutanota.de": "tuta",
  "tuta.io": "tuta",
  "gmx.net": "gmx",
  "gmx.com": "gmx",
  "mail.com": "mailcom",
  "aol.com": "aol",
};

function matchMxToProvider(mxHost: string): string | null {
  const lower = mxHost.toLowerCase().replace(/\.$/, "");
  // Direct match
  for (const [pattern, provider] of Object.entries(mxProviderMap)) {
    if (lower === pattern || lower.endsWith("." + pattern)) {
      return provider;
    }
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing domain parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize domain
    const cleanDomain = domain.toLowerCase().trim().replace(/[^a-z0-9.\-]/g, "");
    if (!cleanDomain || !cleanDomain.includes(".")) {
      return new Response(
        JSON.stringify({ error: "Invalid domain" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Google DNS-over-HTTPS to resolve MX records (no native DNS in Deno Deploy)
    const dnsUrl = `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=MX`;
    const dnsResponse = await fetch(dnsUrl, {
      headers: { Accept: "application/dns-json" },
    });

    if (!dnsResponse.ok) {
      return new Response(
        JSON.stringify({ verified: false, provider: null, reason: "dns_error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dnsData = await dnsResponse.json();

    // Check if domain has MX records at all
    if (!dnsData.Answer || dnsData.Answer.length === 0) {
      return new Response(
        JSON.stringify({ verified: false, provider: null, reason: "no_mx_records" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract MX hostnames and try to match to a known provider
    const mxRecords = dnsData.Answer
      .filter((r: { type: number }) => r.type === 15) // MX record type
      .map((r: { data: string }) => {
        // MX data format: "priority hostname"
        const parts = r.data.split(" ");
        return parts.length > 1 ? parts[1] : parts[0];
      });

    if (mxRecords.length === 0) {
      return new Response(
        JSON.stringify({ verified: false, provider: null, reason: "no_mx_records" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to match any MX record to a known provider
    let detectedProvider: string | null = null;
    for (const mx of mxRecords) {
      const match = matchMxToProvider(mx);
      if (match) {
        detectedProvider = match;
        break;
      }
    }

    if (detectedProvider) {
      return new Response(
        JSON.stringify({
          verified: true,
          provider: detectedProvider,
          mxRecords,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Has MX records but not a recognized provider
    return new Response(
      JSON.stringify({
        verified: false,
        provider: null,
        reason: "unknown_provider",
        mxRecords,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
