// Generates public/eadplataforma-index.json with the recursive structure of public/eadplataforma/
// Runs automatically via vite plugin on dev/build.
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "public/eadplataforma";
const OUT = "public/eadplataforma-index.json";

function walk(dir) {
  const entries = readdirSync(dir);
  const result = [];
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      result.push({
        name,
        type: "folder",
        path: relative(ROOT, full).replace(/\\/g, "/"),
        children: walk(full),
      });
    } else {
      result.push({
        name,
        type: "file",
        path: relative(ROOT, full).replace(/\\/g, "/"),
        size: st.size,
        ext: name.includes(".") ? name.split(".").pop().toLowerCase() : "",
      });
    }
  }
  // Folders first, then files; both alphabetical
  result.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
  return result;
}

export function generateIndex() {
  if (!existsSync(ROOT)) {
    writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), tree: [] }, null, 2));
    return;
  }
  const tree = walk(ROOT);
  writeFileSync(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), tree }, null, 2)
  );
  console.log(`[eadplataforma-index] generated ${OUT}`);
}

// Allow running directly: `node scripts/generate-eadplataforma-index.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIndex();
}
