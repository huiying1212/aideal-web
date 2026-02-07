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
 * Resolve a paper link to an actual downloadable PDF URL.
 *
 * Many links from Google Scholar detail pages already point directly
 * to PDFs (e.g. dl.acm.org/doi/pdf/..., arxiv.org/pdf/...).
 * For others we need to transform the URL or find the PDF on the page.
 */
function resolvePdfUrl(paperLink) {
  if (!paperLink) return null;

  // Already a direct PDF link
  if (paperLink.match(/\.pdf(\?|$|#)/i)) return paperLink;

  // arXiv abstract → PDF
  const arxivAbs = paperLink.match(/arxiv\.org\/abs\/(.+?)(?:\?|#|$)/);
  if (arxivAbs) return `https://arxiv.org/pdf/${arxivAbs[1]}.pdf`;

  // arXiv /pdf/ without .pdf extension
  if (paperLink.includes("arxiv.org/pdf/")) {
    return paperLink.endsWith(".pdf") ? paperLink : paperLink + ".pdf";
  }

  // ACM DL: /doi/full/ → /doi/pdf/  or /doi/10.xxx → /doi/pdf/10.xxx
  if (paperLink.includes("dl.acm.org")) {
    if (paperLink.includes("/doi/full/")) {
      return paperLink.replace("/doi/full/", "/doi/pdf/");
    }
    if (paperLink.includes("/doi/abs/")) {
      return paperLink.replace("/doi/abs/", "/doi/pdf/");
    }
    // dl.acm.org/doi/10.xxxx → dl.acm.org/doi/pdf/10.xxxx
    const acmDoi = paperLink.match(/dl\.acm\.org\/doi\/(10\.\d+\/.+?)(?:\?|#|$)/);
    if (acmDoi) return `https://dl.acm.org/doi/pdf/${acmDoi[1]}`;
  }

  // Springer: article page → pdf page
  if (paperLink.includes("link.springer.com/article/")) {
    return paperLink.replace("/article/", "/content/pdf/") + ".pdf";
  }

  // MDPI: article page → pdf
  if (paperLink.includes("mdpi.com") && !paperLink.includes("/pdf")) {
    return paperLink.replace(/\/?$/, "/pdf");
  }

  // Taylor & Francis
  if (paperLink.includes("tandfonline.com") && !paperLink.includes("/pdf/")) {
    return paperLink.replace("/doi/abs/", "/doi/pdf/").replace("/doi/full/", "/doi/pdf/");
  }

  // ScienceDirect — these often need browser navigation, return null to try browser method
  if (paperLink.includes("sciencedirect.com")) {
    return null; // Will use browser-based download
  }

  // Google Drive
  if (paperLink.includes("drive.google.com/file")) {
    const idMatch = paperLink.match(/\/d\/([^/]+)/);
    if (idMatch) return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }

  // If URL contains /pdf/ it's likely already a PDF endpoint
  if (paperLink.includes("/pdf/") || paperLink.includes("/pdf?")) {
    return paperLink;
  }

  return null; // Will try browser-based discovery
}

/**
 * Download a PDF using Puppeteer's browser context.
 *
 * This uses the browser's CDP (Chrome DevTools Protocol) to intercept
 * the download, which means we get the benefit of cookies, session,
 * and proper TLS handling — just like clicking a link in the browser.
 */
async function downloadPdfWithBrowser(page, pdfUrl, destPath, timeout = 30000) {
  // Use CDP to fetch the PDF with the browser's session
  const client = await page.createCDPSession();

  try {
    const response = await client.send("Network.enable");

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

        const contentType = resp.headers.get("content-type") || "";

        // If it's not a PDF (e.g. HTML login page), fail early
        if (
          contentType.includes("text/html") &&
          !contentType.includes("pdf")
        ) {
          return { error: "Got HTML instead of PDF" };
        }

        const buffer = await resp.arrayBuffer();
        // Convert to base64 for transfer from browser to Node
        const bytes = new Uint8Array(buffer);
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

  // Step 1: Try to resolve a direct PDF URL from the paper link
  let pdfUrl = resolvePdfUrl(paperLink);

  // Step 2: If we have a URL, try downloading with browser
  if (pdfUrl) {
    try {
      await downloadPdfWithBrowser(page, pdfUrl, pdfPath);
      if (isPdfFile(pdfPath)) {
        const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
        console.log(`     ✓ PDF saved (${sizeMB} MB)`);
        return pdfRelPath;
      } else {
        // Not a valid PDF
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }
    } catch (err) {
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      // Fall through to browser-based discovery
    }
  }

  // Step 3: Navigate to the paper page and look for citation_pdf_url meta tag
  try {
    await page.goto(paperLink, { waitUntil: "networkidle2", timeout: 20000 });
    await sleep(500);

    const metaPdfUrl = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="citation_pdf_url"]');
      return meta ? meta.getAttribute("content") : null;
    });

    if (metaPdfUrl) {
      const absoluteUrl = metaPdfUrl.startsWith("http")
        ? metaPdfUrl
        : new URL(metaPdfUrl, paperLink).href;

      try {
        await downloadPdfWithBrowser(page, absoluteUrl, pdfPath);
        if (isPdfFile(pdfPath)) {
          const sizeMB = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
          console.log(`     ✓ PDF saved via meta tag (${sizeMB} MB)`);
          return pdfRelPath;
        } else {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        }
      } catch {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }
    }
  } catch {
    // Page navigation failed, skip
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

      const link = await page
        .$eval("#gsc_oci_title_gg a", (a) => a.href)
        .catch(() => "");

      pub.link = link;
      if (link) {
        console.log(`     → ${link}`);
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

    // 4. Download PDFs
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

      for (let i = 0; i < scholarPubs.length; i++) {
        const pub = scholarPubs[i];
        const filename = titleToFilename(pub.title);
        const pdfPath = path.join(PAPERS_DIR, `${filename}.pdf`);

        // Check if existing entry already has a valid pdf
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

        // Check if PDF file already exists on disk
        if (fs.existsSync(pdfPath) && isPdfFile(pdfPath)) {
          const pdfRelPath = `/papers/${filename}.pdf`;
          pub.pdf = pdfRelPath;
          if (existingItem) existingItem.pdf = pdfRelPath;
          skippedCount++;
          continue;
        }

        // No paper link? Can't download.
        if (!pub.link) {
          failedCount++;
          continue;
        }

        const shortTitle =
          pub.title.length > 55
            ? pub.title.substring(0, 55) + "..."
            : pub.title;
        console.log(
          `  [${i + 1}/${scholarPubs.length}] ${shortTitle}`
        );

        const pdfRelPath = await tryDownloadPdf(
          browser,
          dlPage,
          pub.link,
          filename
        );

        if (pdfRelPath) {
          pub.pdf = pdfRelPath;
          if (existingItem) existingItem.pdf = pdfRelPath;
          downloadedCount++;
        } else {
          failedCount++;
        }

        await sleep(800);
      }

      await dlPage.close();

      console.log(`\n--- PDF Summary ---`);
      console.log(`  Downloaded : ${downloadedCount}`);
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
