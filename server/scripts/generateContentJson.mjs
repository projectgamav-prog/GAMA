import fs from "node:fs/promises";
import { contentDataDirectory, getTablePath, tableFileMap } from "../core/paths.js";

function toJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function ensureTableFile(fileName) {
  const tableName = Object.entries(tableFileMap).find(([, mappedFileName]) => mappedFileName === fileName)?.[0];
  if (!tableName) {
    throw new Error(`Unknown content table file "${fileName}".`);
  }

  const filePath = getTablePath(tableName);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, toJson([]), "utf8");
  }
}

async function main() {
  await fs.mkdir(contentDataDirectory, { recursive: true });
  await Promise.all(Object.values(tableFileMap).map((fileName) => ensureTableFile(fileName)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
