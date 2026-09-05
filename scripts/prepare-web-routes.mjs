import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Explicit HTML entries replace CDN objects left by older static Expo exports.
// Every entry boots the same current single-page application.
const root = path.resolve(import.meta.dirname, "..");
const html = await readFile(path.join(root, "dist/index.html"));
async function walk(directory, segments = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith("+")) continue;
    const name = entry.name.replace(/\.tsx?$/, "");
    if (name.includes("[")) continue;
    const next =
      /^\(.*\)$/.test(name) || name === "index"
        ? segments
        : [...segments, name];
    if (entry.isDirectory()) await walk(path.join(directory, entry.name), next);
    else if (/\.tsx?$/.test(entry.name) && next.length) {
      const target = path.join(root, "dist", next.join("/") + ".html");
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html);
    }
  }
}
await walk(path.join(root, "app"));
