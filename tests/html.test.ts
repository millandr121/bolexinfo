import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzePage, parseSerialRanges, toSitePath } from "../scripts/lib/html";

const SAMPLE = `
<html><head><title>Bolex Collector | Cameras | H-16</title>
<meta name="description" content="The H-16 camera."></head>
<body>
  <a href="/cameras/h16rex.html">REX</a>
  <a href="https://web.archive.org/web/20090101000000/http://www.bolexcollector.com/cameras.html">Cameras</a>
  <a href="http://example.com/elsewhere">External</a>
  <a href="/downloads/h16-manual.pdf">Manual</a>
  <img src="/images/h16.jpg" alt="H-16 with turret">
  <table>
    <tr><th>Year</th><th>Serials</th></tr>
    <tr><td>1946</td><td>20,001 - 32,000</td></tr>
    <tr><td>1947</td><td>32,001 - 46,000</td></tr>
  </table>
</body></html>`;

test("toSitePath resolves relative, wayback-rewritten and external URLs", () => {
  assert.equal(toSitePath("gallery.html", "/cameras/h16.html"), "/cameras/gallery.html");
  assert.equal(
    toSitePath("https://web.archive.org/web/20090101000000/http://www.bolexcollector.com/faq.html", "/"),
    "/faq.html",
  );
  assert.equal(toSitePath("http://example.com/x", "/"), null);
  assert.equal(toSitePath("mailto:someone@example.com", "/"), null);
});

test("analyzePage extracts title, links, images, downloads and tables", () => {
  const page = analyzePage(SAMPLE, "/cameras/h16.html");
  assert.equal(page.title, "Bolex Collector | Cameras | H-16");
  assert.equal(page.description, "The H-16 camera.");
  assert.deepEqual(page.internalLinks.sort(), ["/cameras.html", "/cameras/h16rex.html", "/downloads/h16-manual.pdf"]);
  assert.deepEqual(page.externalLinks, ["http://example.com/elsewhere"]);
  assert.deepEqual(page.downloads, ["/downloads/h16-manual.pdf"]);
  assert.equal(page.images[0]?.alt, "H-16 with turret");
  assert.equal(page.tables.length, 1);
  assert.equal(page.tables[0]?.length, 3);
});

test("parseSerialRanges recovers year ranges from table rows", () => {
  const page = analyzePage(SAMPLE, "/cameras/h16.html");
  const ranges = parseSerialRanges(page.tables);
  assert.deepEqual(ranges, [
    { year: 1946, from: 20001, to: 32000 },
    { year: 1947, from: 32001, to: 46000 },
  ]);
});
