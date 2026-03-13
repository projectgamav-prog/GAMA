import { createBooksDatabase } from "../../src/content/books/schema.js";
import { createExplanationsDatabase } from "../../src/content/explanations/schema.js";
import { tableConfigs } from "./table-config.js";
import { readTable } from "./table-store.js";

async function readAllTables() {
  const tableNames = Object.keys(tableConfigs);
  const entries = await Promise.all(
    tableNames.map(async (tableName) => [tableName, await readTable(tableName)])
  );

  return Object.fromEntries(entries);
}

export async function assertPublicDataBuildable(mutatedTableName, nextRows) {
  const rawTables = await readAllTables();
  rawTables[mutatedTableName] = nextRows;

  try {
    const booksDatabase = createBooksDatabase(rawTables);
    createExplanationsDatabase(rawTables, booksDatabase);
  } catch (error) {
    throw new Error(`This change would break the public content database: ${error.message}`);
  }
}
