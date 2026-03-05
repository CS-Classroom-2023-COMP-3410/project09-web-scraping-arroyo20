const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

const RESULTS_DIR = path.join(__dirname, "results");

function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
}

async function getHTML(url) {
    const res = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 30000,
    });
    return res.data;
}

async function scrapeBulletin() {
    const BULLETIN_URL = "https://bulletin.du.edu/undergraduate/coursedescriptions/comp/";
    const html = await getHTML(BULLETIN_URL);
    const $ = cheerio.load(html);

    const courses = [];

    $(".courseblock").each((i, el) => {
        const titleText = clean($(el).find(".courseblocktitle").text());
        const descText = clean($(el).find(".courseblockdesc").text());

        const match = titleText.match(/COMP\s*(\d{4})\s+(.*?)\s+\(/);
        if (!match) return;

        const number = parseInt(match[1], 10);
        const title = match[2];

        if (number >= 3000 && !/Prerequisite/i.test(descText)) {
            courses.push({ course: `COMP-${number}`, title });
        }
    });

    await fs.writeJson(path.join(RESULTS_DIR, "bulletin.json"), { courses }, { spaces: 4 });
    return courses.length;
}

async function scrapeAthletics() {
    const ATHLETICS_COVERAGE_URL = "https://denverpioneers.com/coverage";
    const html = await getHTML(ATHLETICS_COVERAGE_URL);
    const $ = cheerio.load(html);

    const events = [];
    let currentDate = "";

    $("body *").each((_, el) => {
        const txt = clean($(el).text());

        if (/\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(txt) && txt.length < 80) {
            currentDate = txt;
            return;
        }

        if (el.tagName === "tr") {
            const tds = $(el).find("td");
            if (tds.length >= 3) {
                const duTeam = clean($(tds[1]).text());
                const opponent = clean($(tds[2]).text());

                if (duTeam && opponent && currentDate) {
                    events.push({ duTeam, opponent, date: currentDate });
                }
            }
        }
    });

    const finalEvents = events.slice(0, 10);

    await fs.writeJson(
        path.join(RESULTS_DIR, "athletic_events.json"),
        { events: finalEvents },
        { spaces: 4 }
    );

    return finalEvents.length;
}

function buildMonths(year) {
    const months = [];
    for (let m = 1; m <= 12; m++) {
        const start = `${year}-${String(m).padStart(2, "0")}-01`;
        const endMonth = m === 12 ? 1 : m + 1;
        const endYear = m === 12 ? year + 1 : year;
        const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
        months.push({ start, end });
    }
    return months;
}

async function scrapeEventPage(eventUrl) {
    const html = await getHTML(eventUrl);
    const $ = cheerio.load(html);

    const title = clean($("h1").first().text());
    if (!title) return null;

    const pageText = clean($("main").text() || $("body").text());

    const dateMatch = pageText.match(
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i
    );
    const timeMatch = pageText.match(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/i);

    let description =
        clean($(".field--name-body").text()) ||
        clean($(".event-description").text()) ||
        clean($("article").text()) ||
        "";

    if (description && description.length > 500) description = description.slice(0, 500);

    const obj = { title };
    if (dateMatch) obj.date = dateMatch[0];
    if (timeMatch) obj.time = timeMatch[0];
    if (description && description.length >= 20) obj.description = description;

    return obj;
}

async function scrapeCalendar2025() {
    const CALENDAR_URL = "https://www.du.edu/calendar";
    const months = buildMonths(2025);
    const eventUrls = new Set();

    console.log("  Fetching month views...");
    for (const m of months) {
        const url = `${CALENDAR_URL}?start_date=${m.start}&end_date=${m.end}&search=`;
        try {
            const html = await getHTML(url);
            const $ = cheerio.load(html);

            $("a").each((_, a) => {
                const href = $(a).attr("href");
                const text = clean($(a).text());
                if (!href) return;

                if (/View Details/i.test(text) && href.includes("/events/")) {
                    const full = href.startsWith("http") ? href : `https://www.du.edu${href}`;
                    eventUrls.add(full);
                }
            });
        } catch (err) {
            console.error(`  Could not fetch month ${m.start}: ${err.message}`);
        }
    }

    const urls = Array.from(eventUrls);
    const events = [];

    
    console.log(`  Found ${urls.length} individual event pages. Scraping them now...`);
    let count = 0;

    for (const u of urls) {
        try {
            count++;
            // Log every 5 events to show progress
            if (count % 5 === 0) console.log(`  ...scraped ${count}/${urls.length} pages`);
            
            const e = await scrapeEventPage(u);
            if (e) events.push(e);
        } catch (err) {
            
            console.log(`  [Timeout/Error] on ${u}: ${err.message}`);
        }
    }

    const seen = new Set();
    const finalEvents = [];
    for (const e of events) {
        const key = `${e.title}|${e.date || ""}|${e.time || ""}`;
        if (!seen.has(key)) {
            seen.add(key);
            finalEvents.push(e);
        }
    }

    await fs.writeJson(path.join(RESULTS_DIR, "calendar_events.json"), { events: finalEvents }, { spaces: 4 });
    return finalEvents.length;
}

async function main() {
    await fs.ensureDir(RESULTS_DIR);

    console.log("scraping bulletin...");
    const c1 = await scrapeBulletin();
    console.log(`  wrote results/bulletin.json (${c1} courses)`);

    console.log("scraping athletics...");
    const c2 = await scrapeAthletics();
    console.log(`  wrote results/athletic_events.json (${c2} events)`);

    console.log("scraping DU calendar 2025...");
    const c3 = await scrapeCalendar2025();
    console.log(`  wrote results/calendar_events.json (${c3} events)`);

    console.log("Done.");
}

main().catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
});