import axios from "axios";
import * as cheerio from "cheerio";

const MAX_PAGES = 20;
const PAGE_TIMEOUT = 8000;
const CONCURRENCY = 4;
const MAX_CHARS = 60000;

const SKIP_EXT = /\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|tar|gz|mp4|mp3|css|js|json|xml|ico|woff|woff2|ttf)$/i;

function normalize(url) {
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const u = new URL(url);
    return u.origin + u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function sameHost(href, hostname) {
  try { return new URL(href).hostname === hostname; } catch { return false; }
}

function extractText($) {
  // Remove non-content elements
  $(
    "script, style, noscript, nav, footer, header, aside, form, iframe, svg, " +
    "[aria-hidden='true'], [role='navigation'], [role='banner'], [role='complementary'], " +
    ".cookie-banner, .cookie-notice, #cookie-banner, .nav, .navbar, .sidebar, " +
    ".advertisement, .ads, .social-share, .breadcrumb, .pagination"
  ).remove();

  // Prefer main content areas if they exist
  const main = $("main, article, [role='main'], .main-content, .content, #content, #main").first();
  const source = main.length ? main : $("body");
  const text = source.text()
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

function extractLinks($, pageUrl, hostname) {
  const links = new Set();
  $("a[href]").each((_, el) => {
    try {
      const href = $(el).attr("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const resolved = new URL(href, pageUrl);
      if (resolved.hostname !== hostname) return;
      if (SKIP_EXT.test(resolved.pathname)) return;
      links.add(resolved.origin + resolved.pathname.replace(/\/$/, ""));
    } catch {}
  });
  return [...links];
}

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    timeout: PAGE_TIMEOUT,
    maxContentLength: 2 * 1024 * 1024,
    headers: {
      "User-Agent": "DoodleAI-Crawler/1.0 (knowledge base builder)",
      "Accept": "text/html,application/xhtml+xml",
    },
    validateStatus: (s) => s < 400,
  });
  return typeof data === "string" ? data : null;
}

async function trySitemap(origin, hostname) {
  const paths = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap/sitemap.xml"];
  for (const p of paths) {
    try {
      const { data } = await axios.get(origin + p, { timeout: 5000 });
      const urls = [...data.matchAll(/<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/g)]
        .map((m) => m[1].trim())
        .filter((u) => sameHost(u, hostname) && !SKIP_EXT.test(u));
      if (urls.length > 0) return urls;
    } catch {}
  }
  return [];
}

export async function crawlSite(inputUrl) {
  const startUrl = normalize(inputUrl);
  const { origin, hostname } = new URL(startUrl);

  // 1. Fetch the main page
  const mainHtml = await fetchHtml(startUrl);
  if (!mainHtml) throw new Error("Could not load the page. Check the URL and try again.");

  const $main = cheerio.load(mainHtml);
  const pageTitle = $main("title").text().trim();
  const mainText = extractText($main);
  const mainLinks = extractLinks($main, startUrl, hostname);

  const visited = new Set([startUrl]);
  const results = [{ url: startUrl, text: mainText }];

  // 2. Try sitemap for more page URLs
  let queue = await trySitemap(origin, hostname);
  if (queue.length === 0) queue = mainLinks;

  // Deduplicate and exclude already visited
  queue = [...new Set(queue)].filter((u) => !visited.has(u));

  // 3. Crawl in batches
  for (let i = 0; i < queue.length && results.length < MAX_PAGES; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async (url) => {
        if (visited.has(url)) return null;
        visited.add(url);
        const html = await fetchHtml(url);
        if (!html) return null;
        const $ = cheerio.load(html);
        return { url, text: extractText($) };
      })
    );
    for (const r of settled) {
      if (r.status === "fulfilled" && r.value && results.length < MAX_PAGES) {
        results.push(r.value);
      }
    }
  }

  // 4. Build combined knowledge text
  const combined = results
    .map((p) => `--- Page: ${p.url} ---\n${p.text}`)
    .join("\n\n")
    .slice(0, MAX_CHARS);

  return {
    pages: results.length,
    siteName: pageTitle || hostname,
    text: combined,
  };
}
