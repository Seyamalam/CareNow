import { copyFile, mkdir } from "node:fs/promises";
// MapLibre v6's module worker must be served separately from Metro's app chunks.
await mkdir("public", { recursive: true });
await copyFile(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre-gl-worker.mjs",
);
await copyFile(
  "node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs",
  "public/maplibre-gl-shared.mjs",
);
