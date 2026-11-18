// Request classifier: who is asking, and is it who it says it is.
// Classes: human, search, social, monitor, seo, ai, automation, bot.
//
// Vendored from @forgemeshlabs/pay-per-crawl-core@0.1.3 (git tag v0.1.3,
// commit d81ad05dfe6c149a52bdf16f2d50b60a655a7858). See ORIGIN.md.
// Edits from the upstream src/classify.js: the verifyRdns helper, mergeCatalog,
// and the rDNS branch inside classify() were omitted, along with imports of
// resolver.js and util.js, so this tree contains no DNS-over-HTTPS, payment,
// or proxy.forgemesh.io code. With an empty IP (the only way the app calls
// this), the dropped branch did not run, so classification results match
// upstream.
import { SHIPPED_CATALOG } from "./catalog.js";

const BOT_WORDS = /\b(bot|crawler|spider|scraper|fetcher|crawl|agent|archiver|indexer)\b/i;
const BROWSER_TOKENS = /(chrome|safari|firefox|edg|opera|opr|msie|trident|samsungbrowser|ucbrowser)/;

/** First token of an unknown UA, for the bot-name column. */
export function shortName(ua) {
  const t = String(ua || "").trim();
  const m = /^([A-Za-z0-9_.-]+)/.exec(t);
  return (m ? m[1] : t).slice(0, 60);
}

/**
 * @param {string} ua
 * @param {Record<string,string>} headers lowercased header map
 * @param {string} ip remote address, for search-engine verification
 * @param {{catalog?: object[]}} [opts]
 * @returns {Promise<{class:string, name:string, verified:boolean|null, impersonation:boolean}>}
 */
export async function classify(ua, headers = {}, ip = "", opts = {}) {
  const uaL = String(ua || "").trim().toLowerCase();
  const catalog = opts.catalog || SHIPPED_CATALOG;

  for (const entry of catalog) {
    if (!entry.match.some((needle) => uaL.includes(needle))) continue;
    // Upstream would run rDNS verification when entry.verify is set and ip is
    // non-empty. That branch is omitted here; the app always passes an empty IP.
    return { class: entry.class, name: entry.name, verified: null, impersonation: false };
  }

  if (uaL === "") return { class: "automation", name: "Empty User-Agent", verified: null, impersonation: false };

  if (BOT_WORDS.test(uaL)) return { class: "bot", name: shortName(ua), verified: null, impersonation: false };

  if (uaL.includes("mozilla/") && BROWSER_TOKENS.test(uaL)) {
    const accept = String(headers.accept || "").toLowerCase();
    // A real navigation sends text/html; API-ish Accept with a browser UA is a tool.
    if (accept !== "" && !accept.includes("text/html") && !accept.includes("*/*") && !accept.includes("image/")) {
      return { class: "automation", name: "Browser-UA tool", verified: null, impersonation: false };
    }
    return { class: "human", name: "", verified: null, impersonation: false };
  }

  return { class: "bot", name: shortName(ua), verified: null, impersonation: false };
}
