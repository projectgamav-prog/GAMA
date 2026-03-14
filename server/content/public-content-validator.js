import { createBooksDatabase } from "../../src/content/books/schema.js";
import { createCharactersDatabase } from "../../src/content/schema/characters-schema.js";
import { createCmsDatabase } from "../../src/content/schema/cms-schema.js";
import { createPermissionsContentDatabase } from "../../src/content/schema/permissions-schema.js";
import { tableConfigs } from "./table-config.js";
import { readTable } from "./table-store.js";

async function readAllTables() {
  const tableNames = Object.keys(tableConfigs);
  const entries = await Promise.all(
    tableNames.map(async (tableName) => [tableName, await readTable(tableName)])
  );

  return Object.fromEntries(entries);
}

export async function assertPublicTablesBuildable(mutatedTables = {}) {
  const rawTables = await readAllTables();

  Object.entries(mutatedTables || {}).forEach(([tableName, nextRows]) => {
    rawTables[tableName] = nextRows;
  });

  try {
    const booksDatabase = createBooksDatabase(rawTables);
    const charactersDatabase = createCharactersDatabase(rawTables);
    const contentDatabase = {
      ...booksDatabase,
      characters: charactersDatabase.characters,
      indexes: {
        ...booksDatabase.indexes,
        ...charactersDatabase.indexes,
      },
    };
    createCmsDatabase(rawTables, contentDatabase);
    createPermissionsContentDatabase(rawTables);
  } catch (error) {
    throw new Error(`This change would break the public content database: ${error.message}`);
  }
}

export async function assertPublicDataBuildable(mutatedTableName, nextRows) {
  return assertPublicTablesBuildable({
    [mutatedTableName]: nextRows,
  });
}
