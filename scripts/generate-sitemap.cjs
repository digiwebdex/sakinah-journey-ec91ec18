// Run: node scripts/generate-sitemap.js
// Generates public/sitemap.xml with static + dynamic routes

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://rahekaba.com";
const TODAY = new Date().toISOString().split("T")[0];

const staticRoutes = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/packages", priority: "0.9", changefreq: "weekly" },
  { loc: "/hotels", priority: "0.8", changefreq: "weekly" },
  { loc: "/about", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "/track", priority: "0.5", changefreq: "monthly" },
];

function buildXml(routes) {
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${BASE_URL}${r.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const xml = buildXml(staticRoutes);
const outPath = path.join(__dirname, "..", "public", "sitemap.xml");
fs.writeFileSync(outPath, xml, "utf-8");
console.log(`✅ Sitemap generated: ${outPath} (${staticRoutes.length} URLs)`);
