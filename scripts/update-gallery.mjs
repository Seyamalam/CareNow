import fs from "node:fs";
const files = fs
  .readdirSync("docs/screenshots")
  .filter((x) => x.endsWith(".png"))
  .sort((a,b) => {
    const group = (f) => Number(f.slice(0,2)) >= 61 ? 0 : Number(f.slice(0,2)) >= 43 ? 1 : Number(f.slice(0,2)) >= 29 ? 2 : 3;
    return group(a)-group(b) || a.localeCompare(b);
  });
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
readme = readme.replace(/\d+ native Android captures\./, `${files.length} native Android captures.`);
fs.writeFileSync("README.md", readme);
console.log(`Gallery: ${files.length} verified screen captures`);
