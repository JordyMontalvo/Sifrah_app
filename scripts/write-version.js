const fs = require("fs");
const path = require("path");

const version =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.COMMIT_SHA ||
  process.env.npm_package_version ||
  String(Date.now());

const payload = {
  version: String(version).slice(0, 12),
  builtAt: new Date().toISOString(),
};

const outDir = path.join(__dirname, "..", "public");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "version.json");
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + "\n");
console.log("[write-version]", payload);
