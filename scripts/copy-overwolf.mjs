import fs from "node:fs/promises";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

import path from "node:path";
import manifest from "../overwolf/manifest.json" assert { type: "json" };

manifest.meta.name = manifest.meta.name.replace("-DEV", "");
delete manifest.data.windows.controller.debug_url;
delete manifest.data.windows.desktop.debug_url;
manifest.data.windows.desktop.block_top_window_navigation = true;
delete manifest.data.windows.overlay.debug_url;
manifest.data.windows.overlay.block_top_window_navigation = true;

await fs.writeFile(
  path.resolve(__dirname, "../out/manifest.json"),
  JSON.stringify(manifest)
);
await fs.cp(
  path.resolve(__dirname, "../overwolf/icons/"),
  path.resolve(__dirname, "../out/icons/"),
  { recursive: true }
);

const removeableFiles = [
  "404.html",
  "index.html",
  "index.txt",
  "apple-icon.png",
  "opengraph-image.jpg",
  "robots.txt",
  "sitemap.xml",
  "twitter-image.jpg",
];
removeableFiles.forEach(async (file) => {
  await fs.rm(path.resolve(__dirname, "../out/" + file));
});
