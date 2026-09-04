import fs from "node:fs";
const files = fs
  .readdirSync("docs/screenshots")
  .filter((x) => x.endsWith(".png"))
  .sort();
const cells = files.map(
  (f) =>
    `<td align="center"><img src="docs/screenshots/${f}" width="230" alt="${f.replace(/\.png$/, "").replaceAll("-", " ")}" /><br/><sub>${f
      .replace(/\.png$/, "")
      .replace(/^\d+-/, "")
      .replaceAll("-", " ")}</sub></td>`,
);
const rows = [];
for (let i = 0; i < cells.length; i += 3)
  rows.push("<tr>" + cells.slice(i, i + 3).join("") + "</tr>");
const gallery = "<table>\n" + rows.join("\n") + "\n</table>";
let readme = fs.readFileSync("README.md", "utf8");
readme = readme.replace(
  /<!-- SCREENSHOTS:START -->[\s\S]*<!-- SCREENSHOTS:END -->/,
  `<!-- SCREENSHOTS:START -->\n${gallery}\n<!-- SCREENSHOTS:END -->`,
);
fs.writeFileSync("README.md", readme);
console.log(`Gallery: ${files.length} verified screen captures`);
