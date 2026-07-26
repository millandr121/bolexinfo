/**
 * Full preservation pipeline: discover → download → extract → verify → report.
 *
 * Run: npm run pipeline
 *
 * Requires network access to web.archive.org. In an environment whose egress
 * policy blocks archive hosts, discovery still records the seed inventory and
 * every later stage explains what is missing rather than fabricating output.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const stages = ["discover.ts", "download.ts", "extract.ts", "verify.ts", "report.ts"];

for (const stage of stages) {
  console.log(`\n━━━ ${stage} ━━━`);
  const result = spawnSync(process.execPath, ["--import", "tsx", path.join(here, stage)], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    console.error(`Stage ${stage} exited with ${result.status}; continuing to report what exists.`);
    if (stage === "discover.ts" || stage === "download.ts") {
      // Extraction and verification of a partial archive are still valuable.
      continue;
    }
  }
}
