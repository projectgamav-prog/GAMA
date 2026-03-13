import fs from "node:fs/promises";
import { contentDataDirectory, getTablePath } from "../core/paths.js";

async function ensureTableFile(tableName) {
  await fs.mkdir(contentDataDirectory, { recursive: true });

  const tablePath = getTablePath(tableName);

  try {
    await fs.access(tablePath);
  } catch {
    await fs.writeFile(tablePath, "[]\n", "utf8");
  }

  return tablePath;
}

export async function readTable(tableName) {
  const tablePath = await ensureTableFile(tableName);
  const raw = await fs.readFile(tablePath, "utf8");

  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Table "${tableName}" must contain a JSON array.`);
  }

  return parsed;
}

export async function writeTable(tableName, data) {
  if (!Array.isArray(data)) {
    throw new Error(`Table "${tableName}" write payload must be an array.`);
  }

  const tablePath = await ensureTableFile(tableName);
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(tablePath, payload, "utf8");
  return data;
}

export async function appendRow(tableName, row) {
  const rows = await readTable(tableName);
  rows.push(row);
  await writeTable(tableName, rows);
  return row;
}

export async function updateRow(tableName, id, updatedData) {
  const rows = await readTable(tableName);
  const index = rows.findIndex((row) => row.id === id);

  if (index === -1) {
    throw new Error(`Row "${id}" not found in "${tableName}".`);
  }

  rows[index] = updatedData;
  await writeTable(tableName, rows);
  return rows[index];
}

export async function deleteRow(tableName, id) {
  const rows = await readTable(tableName);
  const index = rows.findIndex((row) => row.id === id);

  if (index === -1) {
    throw new Error(`Row "${id}" not found in "${tableName}".`);
  }

  const [deletedRow] = rows.splice(index, 1);
  await writeTable(tableName, rows);
  return deletedRow;
}
