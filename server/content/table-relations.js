import { tableConfigs, deleteConstraints } from "./table-config.js";
import { readTable } from "./table-store.js";

export function getTableConfig(tableName) {
  const tableConfig = tableConfigs[tableName];
  if (!tableConfig) {
    throw new Error(`Unknown table "${tableName}".`);
  }

  return tableConfig;
}

export async function readRelatedTables(tableName) {
  const tableConfig = getTableConfig(tableName);
  const entries = await Promise.all(
    tableConfig.relatedTables.map(async (relatedTableName) => [relatedTableName, await readTable(relatedTableName)])
  );

  return Object.fromEntries(entries);
}

export function filterRows(rows, query) {
  const entries = Object.entries(query || {}).filter(([, value]) => value != null && value !== "");
  if (!entries.length) {
    return rows;
  }

  return rows.filter((row) =>
    entries.every(([key, value]) => String(row[key] ?? "") === String(value))
  );
}

export async function assertDeleteAllowed(tableName, id) {
  const constraints = deleteConstraints[tableName] || [];

  for (const constraint of constraints) {
    const rows = await readTable(constraint.table);
    const dependencyCount = rows.filter((row) => row[constraint.field] === id).length;

    if (dependencyCount > 0) {
      throw new Error(`Cannot delete this record because ${dependencyCount} ${constraint.label} still reference it.`);
    }
  }
}
