#!/usr/bin/env node
/**
 * Google Scholar Publication Crawler (Puppeteer)
 *
 * Uses Puppeteer to control a real Chrome browser, which is more
 * resistant to bot detection than axios/cheerio.
 *
 * Usage:
 *   node scripts/crawl-scholar-puppeteer.js              # Crawl and update
 *   node scripts/crawl-scholar-puppeteer.js --dry-run    # Preview changes
 *   node scripts/crawl-scholar-puppeteer.js --headless   # Run without visible browser
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
  waitForCaptcha: true, // If CAPTCHA appears, pause and wait for manual solve
};

const DATA_DIR = path.join(__dirname, "..", "data");
const PUBLICATIONS_FILE = path.join(DATA_DIR, "publications.json");

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D""'']/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ─── Scraper ────────────────────────────────────────────────────────────────

async function scrapePublications(browser) {
  const page = await browser.newPage();
  
  // Set a realistic viewport and user agent
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
      
      // Wait for the publications table to appear (indicates CAPTCHA solved)
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

  // Wait for the publications table
  await page.waitForSelector("#gsc_a_b", { timeout: 30000 });

  // Click "Show more" button until all publications are loaded
  let previousCount = 0;
  while (true) {
    const currentCount = await page.$$eval(
      "#gsc_a_b .gsc_a_tr",
      (rows) => rows.length
    );

    if (currentCount === previousCount) break; // No more to load

    const showMoreButton = await page.$("#gsc_bpf_more");
    if (!showMoreButton) break;

    const isDisabled = await page.$eval(
      "#gsc_bpf_more",
      (btn) => btn.disabled || btn.style.display === "none"
    );
    if (isDisabled) break;

    console.log(`Loaded ${currentCount} publications, clicking "Show more"...`);
    await showMoreButton.click();
    await sleep(1500); // Wait for new content to load
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

      const citText = row.querySelector(".gsc_a_c a")?.textContent.trim() || "0";
      const citations = parseInt(citText, 10) || 0;

      const yearText = row.querySelector(".gsc_a_y span")?.textContent.trim() || "";
      const year = parseInt(yearText, 10) || null;

      return {
        title,
        authors,
        venue,
        citations,
        year,
        detailPath,
      };
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
      await page.goto(detailUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Extract the paper link
      const link = await page
        .$eval("#gsc_oci_title_gg a", (a) => a.href)
        .catch(() => "");

      pub.link = link;
      if (link) {
        console.log(`     → ${link}`);
      }

      await sleep(1000); // Polite delay
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

function mergeNewPublications(pubData, newItems) {
  for (const item of newItems) {
    let yearGroup = pubData.publications.find((g) => g.year === item.year);
    if (!yearGroup) {
      yearGroup = { year: item.year, items: [] };
      pubData.publications.push(yearGroup);
    }

    yearGroup.items.push({
      authors: item.authors,
      title: item.title,
      venue: item.venue || "",
      link: item.link || "",
    });
  }

  pubData.publications.sort((a, b) => b.year - a.year);
  return pubData;
}


// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const headless = process.argv.includes("--headless");

  console.log("=== Google Scholar Publication Crawler (Puppeteer) ===\n");
  if (dryRun) {
    console.log("** DRY RUN — no files will be modified **\n");
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: headless ? "new" : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    // Scrape publications
    const scholarPubs = await scrapePublications(browser);

    if (scholarPubs.length === 0) {
      console.log("No publications found. Something went wrong.");
      process.exit(1);
    }

    // Load existing data
    const pubData = loadJson(PUBLICATIONS_FILE);
    const existingTitles = buildExistingTitleSet(pubData);

    // Identify new publications
    const newPubs = scholarPubs.filter(
      (p) => !existingTitles.has(normalizeTitle(p.title))
    );

    // Print summary
    console.log("\n--- Summary ---");
    console.log(`  Total on Google Scholar : ${scholarPubs.length}`);
    console.log(`  Already in JSON         : ${scholarPubs.length - newPubs.length}`);
    console.log(`  New publications        : ${newPubs.length}`);
    console.log();

    if (newPubs.length > 0) {
      console.log("New publications found:\n");
      newPubs.forEach((p, i) => {
        console.log(`  ${i + 1}. [${p.year || "N/A"}] ${p.title}`);
        console.log(`     Authors : ${p.authors}`);
        console.log(`     Venue   : ${p.venue}`);
        console.log(`     Link    : ${p.link || "(not found)"}`);
        console.log();
      });

      if (!dryRun) {
        mergeNewPublications(pubData, newPubs);
        saveJson(PUBLICATIONS_FILE, pubData);
        console.log(`✓ Updated: ${PUBLICATIONS_FILE}`);
      } else {
        console.log("(Dry run — publications.json was NOT modified)");
      }
    } else {
      console.log("✓ publications.json is already up to date!");
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
