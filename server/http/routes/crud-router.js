import express from "express";
import { hasPermission } from "../../../src/permissions/access.js";
import { appendRow, deleteRow, readTable, updateRow } from "../../content/table-store.js";
import { assertPublicDataBuildable } from "../../content/public-content-validator.js";
import { assertDeleteAllowed, filterRows, getTableConfig, readRelatedTables } from "../../content/table-relations.js";
import { validateRecord } from "../../content/record-validator.js";

const WRITE_PERMISSION_CONFIG = Object.freeze({
  books: { edit: "books.edit", publishField: "is_published", publishValue: true },
  book_sections: { edit: "books.edit" },
  chapters: { edit: "chapters.edit" },
  chapter_sections: { edit: "chapters.edit" },
  verses: { edit: "verses.edit" },
  media_assets: { edit: "media.upload" },
  explanation_documents: { edit: "verses.edit", publishField: "status", publishValue: "published" },
  explanation_blocks: { edit: "verses.edit" },
});

function resolveContentBlockWriteConfig(nextRecord = null, currentRecord = null) {
  const ownerEntity = String(nextRecord?.owner_entity || currentRecord?.owner_entity || "").trim();

  switch (ownerEntity) {
    case "books":
    case "book_sections":
      return { edit: "books.edit", publishField: "status", publishValue: "published" };
    case "chapters":
    case "chapter_sections":
      return { edit: "chapters.edit", publishField: "status", publishValue: "published" };
    case "verses":
      return { edit: "verses.edit", publishField: "status", publishValue: "published" };
    case "characters":
      return { edit: "characters.edit", publishField: "status", publishValue: "published" };
    default:
      return null;
  }
}

function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, error, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: error.message });
}

function statusForError(error) {
  if (error.message.includes("not found")) {
    return 404;
  }
  if (error.message.includes("Cannot delete")) {
    return 409;
  }
  if (error.message.includes("Unknown table")) {
    return 500;
  }
  return 400;
}

function failWithStatus(res, error, statusCode) {
  return res.status(statusCode).json({ success: false, error });
}

function ensureUserCanWrite(req, res, { tableName, mode, nextRecord = null, currentRecord = null }) {
  const config = tableName === "content_blocks"
    ? resolveContentBlockWriteConfig(nextRecord, currentRecord)
    : WRITE_PERMISSION_CONFIG[tableName];
  if (!config) {
    return true;
  }

  if (!req.auth?.user) {
    failWithStatus(res, "You must be logged in to perform this action.", 401);
    return false;
  }

  if (!hasPermission(req.auth.permissionContext, config.edit)) {
    failWithStatus(res, `Missing required permission "${config.edit}".`, 403);
    return false;
  }

  if (mode === "create" && !hasPermission(req.auth.permissionContext, "content.create")) {
    failWithStatus(res, 'Missing required permission "content.create".', 403);
    return false;
  }

  if (mode === "delete" && !hasPermission(req.auth.permissionContext, "content.delete")) {
    failWithStatus(res, 'Missing required permission "content.delete".', 403);
    return false;
  }

  if (config.publishField) {
    const previousValue = currentRecord?.[config.publishField];
    const nextValue = nextRecord?.[config.publishField];
    const publishValue = Object.prototype.hasOwnProperty.call(config, "publishValue") ? config.publishValue : true;
    const publishChanged = mode === "create"
      ? nextValue === publishValue
      : nextValue !== undefined && nextValue !== previousValue && (nextValue === publishValue || previousValue === publishValue);

    if (publishChanged && !hasPermission(req.auth.permissionContext, "content.publish")) {
      failWithStatus(res, 'Missing required permission "content.publish".', 403);
      return false;
    }
  }

  return true;
}

export function createCrudRouter(tableName) {
  const router = express.Router();
  const { label } = getTableConfig(tableName);

  router.get("/", async (req, res) => {
    try {
      const rows = await readTable(tableName);
      ok(res, filterRows(rows, req.query));
    } catch (error) {
      fail(res, error, 500);
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const rows = await readTable(tableName);
      const row = rows.find((item) => item.id === req.params.id);
      if (!row) {
        return fail(res, new Error(`${label} "${req.params.id}" not found.`), 404);
      }

      ok(res, row);
    } catch (error) {
      fail(res, error, 500);
    }
  });

  router.post("/", async (req, res) => {
    try {
      const [rows, relatedTables] = await Promise.all([readTable(tableName), readRelatedTables(tableName)]);
      const record = validateRecord(tableName, req.body, rows, relatedTables);
      if (!ensureUserCanWrite(req, res, { tableName, mode: "create", nextRecord: record })) {
        return;
      }
      await assertPublicDataBuildable(tableName, [...rows, record]);
      await appendRow(tableName, record);
      ok(res, record, 201);
    } catch (error) {
      fail(res, error, statusForError(error));
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const [rows, relatedTables] = await Promise.all([readTable(tableName), readRelatedTables(tableName)]);
      const existing = rows.find((row) => row.id === req.params.id);
      if (!existing) {
        return fail(res, new Error(`${label} "${req.params.id}" not found.`), 404);
      }

      const record = validateRecord(tableName, { ...existing, ...req.body, id: req.params.id }, rows, relatedTables, req.params.id);
      if (!ensureUserCanWrite(req, res, {
        tableName,
        mode: "update",
        currentRecord: existing,
        nextRecord: record,
      })) {
        return;
      }
      const nextRows = rows.map((row) => (row.id === req.params.id ? record : row));
      await assertPublicDataBuildable(tableName, nextRows);
      await updateRow(tableName, req.params.id, record);
      ok(res, record);
    } catch (error) {
      fail(res, error, statusForError(error));
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!ensureUserCanWrite(req, res, { tableName, mode: "delete" })) {
        return;
      }
      await assertDeleteAllowed(tableName, req.params.id);
      const rows = await readTable(tableName);
      const nextRows = rows.filter((row) => row.id !== req.params.id);
      await assertPublicDataBuildable(tableName, nextRows);
      const deleted = await deleteRow(tableName, req.params.id);
      ok(res, deleted);
    } catch (error) {
      fail(res, error, statusForError(error));
    }
  });

  return router;
}
