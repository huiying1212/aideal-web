#!/usr/bin/env node
/**
 * Google Scholar Publication Crawler (Puppeteer)
 *
 * Uses Puppeteer to control a real Chrome browser to:
 *  1. Scrape the Google Scholar profile for all publications
 *  2. Download PDFs using the browser (with full session/cookie support)
 *  3. Update publications.json with new entries and pdf paths
 *
 * Usage:
 *   node scripts/crawl-scholar-puppeteer.js              # Crawl and update
 *   node scripts/crawl-scholar-puppeteer.js --dry-run    # Preview changes
 *   node scripts/crawl-scholar-puppeteer.js --headless   # Run without visible browser
 *   node scripts/crawl-scholar-puppeteer.js --skip-pdf   # Skip PDF downloads
 *
 * Dependencies: puppeteer
 * Install:  npm install --save-dev puppeteer
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// ─── Configuration ──────────────────────────────────────────────────────────

const CONFIG = {
  scholarUserId: "8NN-2uYAAAAJ",
  scholarUrl: "https://scholar.google.com",
  pageSize: 100,
  waitForCaptcha: true,
};

const DATA_DIR = path.join(__dirname, "..", "data");
const PUBLICATIONS_FILE = path.join(DATA_DIR, "publications.json");
const PAPERS_DIR = path.join(__dirname, "..", "public", "papers");

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D\u201E""'']/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function isPdfFile(filePath) {
  try {
    const header = Buffer.alloc(5);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, header, 0, 5, 0);
    fs.closeSync(fd);
    return header.toString("ascii", 0, 4) === "%PDF";
  } catch {
    return false;
  }
}

// ─── PDF Download (Puppeteer-based) ─────────────────────────────────────────

/**
 * Resolve a paper link to one or more candidate downloadable PDF URLs.
 *
 * Returns an array of URLs to try in order. Many links from Google Scholar
 * detail pages already point directly to PDFs (e.g. dl.acm.org/doi/pdf/...,
 * arxiv.org/pdf/...). For others we transform the URL or guess the PDF path.
 */
function resolvePdfUrls(paperLink) {
  if (!paperLink) return [];

  const candidates = [];

  // Already a direct PDF link
  if (paperLink.match(/\.pdf(\?|$|#)/i)) {
    candidates.push(paperLink);
    return candidates;
  }

  // arXiv abstract → PDF
  const arxivAbs = paperLink.match(/arxiv\.org\/abs\/(.+?)(?:\?|#|$)/);
  if (arxivAbs) {
    candidates.push(`https://arxiv.org/pdf/${arxivAbs[1]}.pdf`);
    return candidates;
  }

  // arXiv /pdf/ without .pdf extension
  if (paperLink.includes("arxiv.org/pdf/")) {
    candidates.push(paperLink.endsWith(".pdf") ? paperLink : paperLink + ".pdf");
    return candidates;
  }

  // ACM DL: try /doi/pdf/ variant
  if (paperLink.includes("dl.acm.org")) {
    if (paperLink.includes("/doi/full/")) {
      candidates.push(paperLink.replace("/doi/full/", "/doi/pdf/"));
    } else if (paperLink.includes("/doi/abs/")) {
      candidates.push(paperLink.replace("/doi/abs/", "/doi/pdf/"));
    } else {
      // dl.acm.org/doi/10.xxxx → dl.acm.org/doi/pdf/10.xxxx
      const acmDoi = paperLink.match(/dl\.acm\.org\/doi\/(10\.\d+\/.+?)(?:\?|#|$)/);
      if (acmDoi) candidates.push(`https://dl.acm.org/doi/pdf/${acmDoi[1]}`);
    }
    return candidates;
  }

  // Springer: article page → pdf page
  if (paperLink.includes("link.springer.com/article/")) {
    candidates.push(paperLink.replace("/article/", "/content/pdf/") + ".pdf");
    // Also try the epub/pdf endpoint
    const springerDoi = paperLink.match(/link\.springer\.com\/article\/(10\..+?)(?:\?|#|$)/);
    if (springerDoi) {
      candidates.push(`https://link.springer.com/content/pdf/${springerDoi[1]}.pdf`);
    }
    return candidates;
  }

  // Springer chapter
  if (paperLink.includes("link.springer.com/chapter/")) {
    candidates.push(paperLink.replace("/chapter/", "/content/pdf/") + ".pdf");
    return candidates;
  }

  // MDPI: article page → pdf
  if (paperLink.includes("mdpi.com") && !paperLink.includes("/pdf")) {
    candidates.push(paperLink.replace(/\/?$/, "/pdf"));
    return candidates;
  }

  // Taylor & Francis
  if (paperLink.includes("tandfonline.com")) {
    if (paperLink.includes("/doi/abs/")) {
      candidates.push(paperLink.replace("/doi/abs/", "/doi/pdf/"));
    } else if (paperLink.includes("/doi/full/")) {
      candidates.push(paperLink.replace("/doi/full/", "/doi/pdf/"));
    }
    return candidates;
  }

  // IEEE Xplore
  if (paperLink.includes("ieeexplore.ieee.org")) {
    const ieeeMatch = paperLink.match(/document\/(\d+)/);
    if (ieeeMatch) {
      candidates.push(`https://ieeexplore.ieee.org/stampPDF/getPDF.jsp?tp=&arnumber=${ieeeMatch[1]}`);
    }
    // Will fall through to browser-based discovery too
  }

  // ScienceDirect — try the pii-based PDF endpoint
  if (paperLink.includes("sciencedirect.com")) {
    const piiMatch = paperLink.match(/pii\/([A-Z0-9]+)/i);
    if (piiMatch) {
      candidates.push(`https://www.sciencedirect.com/science/article/pii/${piiMatch[1]}/pdfft`);
    }
    // Will also try browser-based meta tag discovery
  }

  // ResearchGate — direct links usually work as-is
  if (paperLink.includes("researchgate.net") && paperLink.includes("/publication/")) {
    // ResearchGate PDF links often end with the filename, try as-is
    candidates.push(paperLink);
  }

  // JMIR and similar: try appending /pdf
  if (paperLink.includes("jmir.org")) {
    candidates.push(paperLink.replace(/\/?$/, "/pdf"));
    candidates.push(paperLink);
  }

  // DOI.org redirect — resolve DOI to actual URL
  if (paperLink.includes("doi.org/") && !paperLink.includes("dl.acm.org")) {
    // DOI links redirect; we'll let the browser follow the redirect
    candidates.push(paperLink);
  }

  // Google Drive
  if (paperLink.includes("drive.google.com/file")) {
    const idMatch = paperLink.match(/\/d\/([^/]+)/);
    if (idMatch) candidates.push(`https://drive.google.com/uc?export=download&id=${idMatch[1]}`);
    return candidates;
  }

  // If URL contains /pdf/ it's likely already a PDF endpoint
  if (paperLink.includes("/pdf/") || paperLink.includes("/pdf?")) {
    candidates.push(paperLink);
  }

  return candidates; // May be empty — will try browser-based discovery
}

// Backward-compat wrapper: returns the first candidate or null
function resolvePdfUrl(paperLink) {
  const urls = resolvePdfUrls(paperLink);
  return urls.length > 0 ? urls[0] : null;
}

/**
 * Download a PDF using Puppeteer's browser context.
 *
 * This uses the browser's CDP (Chrome DevTools Protocol) to intercept
 * the download, which means we get the benefit of cookies, session,
 * and proper TLS handling — just like clicking a link in the browser.
 */
async function downloadPdfWithBrowser(page, pdfUrl, destPath, timeout = 60000) {
  // Use CDP to fetch the PDF with the browser's session
  const client = await page.createCDPSession();

  try {
    await client.send("Network.enable");

    // Use page.evaluate with fetch API to download using the browser's context
    const base64Data = await page.evaluate(async (url) => {
      try {
        const resp = await fetch(url, {
          credentials: "include",
          redirect: "follow",
        });

        if (!resp.ok) {
          return { error: `HTTP ${resp.status}` };
        }

        const buffer = await resp.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Check the actual file header instead of trusting content-type.
        // PDF files always start with "%PDF"
        if (bytes.length >= 4) {
          const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
          if (header !== "%PDF") {
            // Check if it looks like HTML (login page, error page, etc.)
            const firstChars = String.fromCharCode(...bytes.slice(0, Math.min(200, bytes.length)));
            if (firstChars.includes("<!DOCTYPE") || firstChars.includes("<html") || firstChars.includes("<HTML")) {
              return { error: "Got HTML page instead of PDF" };
            }
            return { error: `Not a PDF file (header: ${header})` };
          }
        }

        // Convert to base64 for transfer from browser to Node
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk);
        }
        return { data: btoa(binary), size: bytes.length };
      } catch (e) {
        return { error: e.message };
      }
    }, pdfUrl);

    if (base64Data.error) {
      throw new Error(base64Data.error);
    }

    if (!base64Data.data || base64Data.size < 1000) {
      throw new Error("Downloaded file too small to be a valid PDF");
    }

    // Write to disk
    const buffer = Buffer.from(base64Data.data, "base64");
    fs.writeFileSync(destPath, buffer);

    return true;
  } finally {
    await client.detach();
  }
}

/**
 * Try to find and download a PDF for a publication.
 * Returns the relative path (e.g. /papers/filename.pdf) or null.
 */
async function tryDownloadPdf(browser, page, paperLink, filename) {
  if (!paperLink) return null;

  const pdfFilename = `${filename}.pdf`;
  const pdfPath = path.join(PAPERS_DIR, pdfFilename);
  const pdfRelPath = `/papers/${pdfFilename}`;

  // Skip if already downloaded and valid
  if (fs.existsSync(pdfPath) && isPdfFile(pdfPath)) {
    return pdfRelPath;
  }

  // Helper: attempt download from a URL, return true on success
  async function attemptDownload(url, label) {
    try {
      await downloadPdfWithBrowser(page, url, pdfPath);
      if (isPdfFile(pdfPath)) {
        const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
        console.log(`     ✓ PDF saved ${label} (${sizeMB} MB)`);
        return true;
      } else {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }
    } catch (err) {
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }
    return false;
  }

  // Step 1: Try all resolved candidate PDF URLs
  const candidateUrls = resolvePdfUrls(paperLink);
  for (const url of candidateUrls) {
    if (await attemptDownload(url, `via resolved URL`)) return pdfRelPath;
  }

  // Step 2: Navigate to the paper page and look for meta tags & PDF links
  try {
    await page.goto(paperLink, { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(1000);

    // Try citation_pdf_url meta tag (used by most academic publishers)
    const pdfLinks = await page.evaluate(() => {
      const links = [];

      // Meta tag: citation_pdf_url (ACM, Springer, IEEE, etc.)
      const metaCitation = document.querySelector('meta[name="citation_pdf_url"]');
      if (metaCitation) {
        const url = metaCitation.getAttribute("content");
        if (url) links.push(url);
      }

      // Meta tag: dc.identifier (some publishers)
      const metaDc = document.querySelector('meta[name="dc.identifier"][scheme="doi"]');

      // Look for direct PDF download links on the page
      const allLinks = document.querySelectorAll('a[href]');
      for (const a of allLinks) {
        const href = a.href;
        const text = (a.textContent || "").toLowerCase();
        const ariaLabel = (a.getAttribute("aria-label") || "").toLowerCase();
        const title = (a.getAttribute("title") || "").toLowerCase();

        // Links that point to PDF files
        if (href.match(/\.pdf(\?|$|#)/i)) {
          links.push(href);
          continue;
        }

        // Links with "PDF" in text/aria/title (common on publisher pages)
        if (
          (text.includes("pdf") || text.includes("download") ||
           ariaLabel.includes("pdf") || title.includes("pdf")) &&
          href.includes("http")
        ) {
          links.push(href);
        }
      }

      return links;
    });

    // Try each found PDF link
    for (const link of pdfLinks) {
      const absoluteUrl = link.startsWith("http")
        ? link
        : new URL(link, paperLink).href;

      if (await attemptDownload(absoluteUrl, `via page link`)) return pdfRelPath;
    }
  } catch {
    // Page navigation failed, skip
  }

  // Step 3: For DOI links, try the Unpaywall API (free/open-access PDFs)
  try {
    const doiMatch = paperLink.match(/(?:doi\.org\/|\/doi\/(?:abs|full|pdf)?\/?)?(10\.\d{4,9}\/[^\s?#]+)/);
    if (doiMatch) {
      const doi = doiMatch[1];
      const unpaywallUrl = `https://api.unpaywall.org/v2/${doi}?email=crawler@example.com`;

      const oaResult = await page.evaluate(async (url) => {
        try {
          const resp = await fetch(url);
          if (!resp.ok) return null;
          const data = await resp.json();
          if (data.best_oa_location && data.best_oa_location.url_for_pdf) {
            return data.best_oa_location.url_for_pdf;
          }
          // Try other OA locations
          if (data.oa_locations) {
            for (const loc of data.oa_locations) {
              if (loc.url_for_pdf) return loc.url_for_pdf;
            }
          }
          return null;
        } catch {
          return null;
        }
      }, unpaywallUrl);

      if (oaResult) {
        if (await attemptDownload(oaResult, `via Unpaywall OA`)) return pdfRelPath;
      }
    }
  } catch {
    // Unpaywall lookup failed, skip
  }

  // Step 4: Could not download PDF
  console.log(`     ⚠️  PDF not available for download`);
  return null;
}

// ─── Scraper ────────────────────────────────────────────────────────────────

async function scrapePublications(browser) {
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  const url =
    `${CONFIG.scholarUrl}/citations?hl=en&user=${CONFIG.scholarUserId}` +
    `&view_op=list_works&sortby=pubdate&cstart=0&pagesize=${CONFIG.pageSize}`;

  console.log(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // Check for CAPTCHA
  const pageContent = await page.content();
  if (
    pageContent.includes("unusual traffic") ||
    pageContent.includes("captcha") ||
    pageContent.includes("/sorry/")
  ) {
    console.log("\n⚠️  CAPTCHA detected!");
    if (CONFIG.waitForCaptcha) {
      console.log("Please solve the CAPTCHA in the browser window...");
      console.log("Waiting up to 2 minutes for you to complete it.\n");
      try {
        await page.waitForSelector("#gsc_a_b", { timeout: 120000 });
        console.log("✓ CAPTCHA solved! Continuing...\n");
      } catch (err) {
        throw new Error("CAPTCHA was not solved in time. Please try again.");
      }
    } else {
      throw new Error(
        "CAPTCHA detected. Run without --headless to solve it manually."
      );
    }
  }

  await page.waitForSelector("#gsc_a_b", { timeout: 30000 });

  // Click "Show more" until all loaded
  let previousCount = 0;
  while (true) {
    const currentCount = await page.$$eval(
      "#gsc_a_b .gsc_a_tr",
      (rows) => rows.length
    );

    if (currentCount === previousCount) break;

    const showMoreButton = await page.$("#gsc_bpf_more");
    if (!showMoreButton) break;

    const isDisabled = await page.$eval(
      "#gsc_bpf_more",
      (btn) => btn.disabled || btn.style.display === "none"
    );
    if (isDisabled) break;

    console.log(
      `Loaded ${currentCount} publications, clicking "Show more"...`
    );
    await showMoreButton.click();
    await sleep(1500);
    previousCount = currentCount;
  }

  // Extract all publications
  const publications = await page.$$eval("#gsc_a_b .gsc_a_tr", (rows) => {
    return rows.map((row) => {
      const titleEl = row.querySelector(".gsc_a_at");
      const title = titleEl?.textContent.trim() || "";
      const detailPath = titleEl?.getAttribute("href") || "";

      const grays = row.querySelectorAll(".gs_gray");
      const authors = grays[0]?.textContent.trim() || "";
      const venue = grays[1]?.textContent.trim() || "";

      const citText =
        row.querySelector(".gsc_a_c a")?.textContent.trim() || "0";
      const citations = parseInt(citText, 10) || 0;

      const yearText =
        row.querySelector(".gsc_a_y span")?.textContent.trim() || "";
      const year = parseInt(yearText, 10) || null;

      return { title, authors, venue, citations, year, detailPath };
    });
  });

  console.log(`\nExtracted ${publications.length} publications from page.\n`);

  // Fetch paper links from detail pages
  console.log("Fetching paper links...\n");
  for (let i = 0; i < publications.length; i++) {
    const pub = publications[i];
    if (!pub.detailPath) continue;

    const shortTitle =
      pub.title.length > 55 ? pub.title.substring(0, 55) + "..." : pub.title;
    console.log(`  [${i + 1}/${publications.length}] ${shortTitle}`);

    try {
      const detailUrl = `${CONFIG.scholarUrl}${pub.detailPath}`;
      await page.goto(detailUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Get the primary paper link
      const link = await page
        .$eval("#gsc_oci_title_gg a", (a) => a.href)
        .catch(() => "");

      pub.link = link;
      if (link) {
        console.log(`     → ${link}`);
      }

      // Also try to extract any additional PDF links from the detail page
      // (Scholar sometimes shows a direct PDF link separately)
      const extraPdfLink = await page.evaluate(() => {
        const links = document.querySelectorAll("#gsc_oci_title_gg a");
        for (const a of links) {
          const href = a.href || "";
          if (href.match(/\.pdf(\?|$|#)/i) || href.includes("/pdf/")) {
            return href;
          }
        }
        return null;
      }).catch(() => null);

      if (extraPdfLink && extraPdfLink !== link) {
        pub.scholarPdfLink = extraPdfLink;
        console.log(`     → PDF: ${extraPdfLink}`);
      }

      await sleep(1000);
    } catch (err) {
      console.log(`     ⚠️  Could not fetch link: ${err.message}`);
    }
  }

  await page.close();
  return publications;
}

// ─── Data Processing ────────────────────────────────────────────────────────

function buildExistingTitleSet(pubData) {
  const set = new Set();
  for (const group of pubData.publications) {
    for (const item of group.items) {
      set.add(normalizeTitle(item.title));
    }
  }
  return set;
}

function buildExistingTitleMap(pubData) {
  const map = new Map();
  for (const group of pubData.publications) {
    for (const item of group.items) {
      map.set(normalizeTitle(item.title), item);
    }
  }
  return map;
}

function mergeNewPublications(pubData, newItems) {
  for (const item of newItems) {
    let yearGroup = pubData.publications.find((g) => g.year === item.year);
    if (!yearGroup) {
      yearGroup = { year: item.year, items: [] };
      pubData.publications.push(yearGroup);
    }

    const entry = {
      authors: item.authors,
      title: item.title,
      venue: item.venue || "",
      link: item.link || "",
    };
    if (item.pdf) {
      entry.pdf = item.pdf;
    }

    yearGroup.items.push(entry);
  }

  pubData.publications.sort((a, b) => b.year - a.year);
  return pubData;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const headless = process.argv.includes("--headless");
  const skipPdf = process.argv.includes("--skip-pdf");

  console.log("=== Google Scholar Publication Crawler (Puppeteer) ===\n");
  if (dryRun) {
    console.log("** DRY RUN — no files will be modified **\n");
  }
  if (skipPdf) {
    console.log("** PDF downloads will be skipped **\n");
  }

  if (!dryRun && !skipPdf) {
    ensureDir(PAPERS_DIR);
  }

  const browser = await puppeteer.launch({
    headless: headless ? "new" : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    // 1. Scrape publications list + paper links
    const scholarPubs = await scrapePublications(browser);

    if (scholarPubs.length === 0) {
      console.log("No publications found. Something went wrong.");
      process.exit(1);
    }

    // 2. Load existing data
    const pubData = loadJson(PUBLICATIONS_FILE);
    const existingTitles = buildExistingTitleSet(pubData);
    const existingTitleMap = buildExistingTitleMap(pubData);

    // 3. Identify new publications
    const newPubs = scholarPubs.filter(
      (p) => !existingTitles.has(normalizeTitle(p.title))
    );

    console.log("\n--- Summary ---");
    console.log(`  Total on Google Scholar : ${scholarPubs.length}`);
    console.log(`  Already in JSON         : ${scholarPubs.length - newPubs.length}`);
    console.log(`  New publications        : ${newPubs.length}`);
    console.log();

    // 4. Download PDFs (for ALL publications — new and existing)
    if (!skipPdf && !dryRun) {
      console.log("--- Downloading PDFs ---\n");

      // Open a dedicated page for PDF downloads
      const dlPage = await browser.newPage();
      await dlPage.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
      );

      let downloadedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;
      let retriedCount = 0;

      for (let i = 0; i < scholarPubs.length; i++) {
        const pub = scholarPubs[i];
        const filename = titleToFilename(pub.title);
        const pdfPath = path.join(PAPERS_DIR, `${filename}.pdf`);

        // Check if existing entry already has a valid pdf ON DISK
        const existingItem = existingTitleMap.get(normalizeTitle(pub.title));
        if (existingItem && existingItem.pdf) {
          const existingPdfPath = path.join(
            __dirname,
            "..",
            "public",
            existingItem.pdf
          );
          if (fs.existsSync(existingPdfPath) && isPdfFile(existingPdfPath)) {
            skippedCount++;
            continue;
          }
        }

        // Check if PDF file already exists on disk (but not in JSON)
        if (fs.existsSync(pdfPath) && isPdfFile(pdfPath)) {
          const pdfRelPath = `/papers/${filename}.pdf`;
          pub.pdf = pdfRelPath;
          if (existingItem) existingItem.pdf = pdfRelPath;
          skippedCount++;
          continue;
        }

        // Collect all available links to try (in priority order)
        const linksToTry = [];
        if (pub.scholarPdfLink) linksToTry.push(pub.scholarPdfLink);
        if (pub.link) linksToTry.push(pub.link);
        if (existingItem && existingItem.link && !linksToTry.includes(existingItem.link)) {
          linksToTry.push(existingItem.link);
        }

        // No paper link at all? Can't download.
        if (linksToTry.length === 0) {
          failedCount++;
          continue;
        }

        const isRetry = existingItem && !existingItem.pdf;
        const shortTitle =
          pub.title.length > 55
            ? pub.title.substring(0, 55) + "..."
            : pub.title;
        console.log(
          `  [${i + 1}/${scholarPubs.length}]${isRetry ? " [RETRY]" : ""} ${shortTitle}`
        );

        // Try each link until one succeeds
        let pdfRelPath = null;
        for (const link of linksToTry) {
          pdfRelPath = await tryDownloadPdf(
            browser,
            dlPage,
            link,
            filename
          );
          if (pdfRelPath) break;
        }

        if (pdfRelPath) {
          pub.pdf = pdfRelPath;
          if (existingItem) existingItem.pdf = pdfRelPath;
          downloadedCount++;
          if (isRetry) retriedCount++;
        } else {
          failedCount++;
        }

        await sleep(800);
      }

      await dlPage.close();

      console.log(`\n--- PDF Summary ---`);
      console.log(`  Downloaded : ${downloadedCount} (${retriedCount} previously failed, now succeeded)`);
      console.log(`  Skipped    : ${skippedCount} (already exist)`);
      console.log(`  Failed     : ${failedCount} (not available)`);
      console.log();
    }

    // 5. Print new publications
    if (newPubs.length > 0) {
      console.log("New publications found:\n");
      newPubs.forEach((p, i) => {
        console.log(`  ${i + 1}. [${p.year || "N/A"}] ${p.title}`);
        console.log(`     Authors : ${p.authors}`);
        console.log(`     Venue   : ${p.venue}`);
        console.log(`     Link    : ${p.link || "(not found)"}`);
        if (p.pdf) {
          console.log(`     PDF     : ${p.pdf}`);
        }
        console.log();
      });

      if (!dryRun) {
        mergeNewPublications(pubData, newPubs);
      } else {
        console.log("(Dry run — publications.json was NOT modified)");
      }
    } else {
      console.log("✓ No new publications to add.");
    }

    // 6. Save
    if (!dryRun) {
      saveJson(PUBLICATIONS_FILE, pubData);
      console.log(`✓ Updated: ${PUBLICATIONS_FILE}`);

      if (!skipPdf) {
        const pdfCount = fs.existsSync(PAPERS_DIR)
          ? fs.readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".pdf")).length
          : 0;
        console.log(`✓ Total PDFs in public/papers/: ${pdfCount}`);
      }
    }

    console.log("\n✓ Done!");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`\n❌ Error: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
