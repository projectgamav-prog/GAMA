import fs from "node:fs/promises";
import path from "node:path";
import { managedMediaDirectory, managedMediaPublicBasePath } from "../core/paths.js";
import { assertPublicDataBuildable } from "./public-content-validator.js";
import { validateRecord } from "./record-validator.js";
import { readTable, writeTable } from "./table-store.js";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNowParts() {
  const now = new Date();
  return {
    year: String(now.getUTCFullYear()),
    month: String(now.getUTCMonth() + 1).padStart(2, "0"),
    stamp: now.toISOString().replace(/[:.]/g, "-"),
  };
}

function getFileExtension(fileName = "") {
  return path.extname(String(fileName || "")).toLowerCase();
}

function inferAssetType({ mimeType = "", fileName = "" } = {}) {
  const normalizedMimeType = normalizeText(mimeType).toLowerCase();
  const extension = getFileExtension(fileName);

  if (normalizedMimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"].includes(extension)) {
    return "image";
  }

  if (normalizedMimeType.startsWith("video/") || [".mp4", ".webm", ".ogg", ".mov", ".m4v"].includes(extension)) {
    return "video";
  }

  if (normalizedMimeType.startsWith("audio/") || [".mp3", ".wav", ".m4a", ".aac", ".oga", ".ogg"].includes(extension)) {
    return "audio";
  }

  return "document";
}

function decodeFilePayload(file, index) {
  const fileName = normalizeText(file?.name);
  const dataBase64 = normalizeText(file?.data_base64);
  const mimeType = normalizeText(file?.type) || "application/octet-stream";

  if (!fileName) {
    throw new Error(`Imported file at index ${index} is missing a file name.`);
  }

  if (!dataBase64) {
    throw new Error(`Imported file "${fileName}" is missing file data.`);
  }

  return {
    fileName,
    mimeType,
    relativePath: normalizeText(file?.relative_path),
    buffer: Buffer.from(dataBase64, "base64"),
  };
}

function buildStoredFileName(fileName, stamp, index) {
  const extension = getFileExtension(fileName);
  const baseName = slugify(path.basename(fileName, extension)) || "media";
  return `${baseName}-${stamp}-${String(index + 1).padStart(2, "0")}${extension}`;
}

function buildTitleFromFileName(fileName) {
  const extension = getFileExtension(fileName);
  const baseName = path.basename(fileName, extension);
  return baseName
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function importMediaFiles(filePayloads = []) {
  if (!Array.isArray(filePayloads) || !filePayloads.length) {
    throw new Error("At least one local file is required for media import.");
  }

  const { year, month, stamp } = getNowParts();
  const targetDirectory = path.join(managedMediaDirectory, year, month);
  const existingMediaAssets = await readTable("media_assets");
  const nextMediaAssets = [...existingMediaAssets];
  const imports = filePayloads.map((file, index) => decodeFilePayload(file, index));

  const preparedRecords = imports.map((file, index) => {
    const storedFileName = buildStoredFileName(file.fileName, stamp, index);
    const publicSrc = `${managedMediaPublicBasePath}/${year}/${month}/${storedFileName}`;
    const title = buildTitleFromFileName(file.fileName) || storedFileName;
    const assetType = inferAssetType({
      mimeType: file.mimeType,
      fileName: file.fileName,
    });

    const draftRecord = {
      id: `media-asset-${slugify(title)}-${stamp}-${String(index + 1).padStart(2, "0")}`,
      asset_type: assetType,
      title,
      src: publicSrc,
      alt_text: assetType === "image" ? title : null,
      caption: null,
      provider: "local-upload",
      metadata: {
        source: "local-media-import",
        original_filename: file.fileName,
        original_relative_path: file.relativePath || null,
        mime_type: file.mimeType,
        file_size: file.buffer.byteLength,
        imported_at: new Date().toISOString(),
      },
    };

    const validated = validateRecord("media_assets", draftRecord, nextMediaAssets, {});
    nextMediaAssets.push(validated);

    return {
      file,
      storedFileName,
      validated,
      destinationPath: path.join(targetDirectory, storedFileName),
    };
  });

  await assertPublicDataBuildable("media_assets", nextMediaAssets);
  await fs.mkdir(targetDirectory, { recursive: true });

  const writtenPaths = [];

  try {
    for (const entry of preparedRecords) {
      await fs.writeFile(entry.destinationPath, entry.file.buffer);
      writtenPaths.push(entry.destinationPath);
    }

    await writeTable("media_assets", nextMediaAssets);
  } catch (error) {
    await Promise.all(
      writtenPaths.map(async (writtenPath) => {
        try {
          await fs.unlink(writtenPath);
        } catch {
          // Best-effort cleanup for partially imported files.
        }
      })
    );
    throw error;
  }

  return preparedRecords.map((entry) => entry.validated);
}
