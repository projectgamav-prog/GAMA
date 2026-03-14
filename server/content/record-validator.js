import { ALL_CONTENT_FIELD_CONFIGS } from "../../src/content/schema/index.js";
import {
  CONTENT_BLOCK_OWNER_ENTITIES,
  CONTENT_BLOCK_REGIONS,
  CONTENT_BLOCK_STATUSES,
  CONTENT_BLOCK_TYPES,
  CONTENT_BLOCK_VISIBILITIES,
  MEDIA_ASSET_TYPES,
  normalizeContentBlockData,
} from "../../src/content/schema/cms-schema.js";
import { CHARACTER_SLUG_PATTERN } from "../../src/content/schema/characters-schema.js";
import { PERMISSION_KEYS } from "../../src/permissions/keys.js";

const CONTENT_FIELD_CONFIGS = ALL_CONTENT_FIELD_CONFIGS;

function normalizeIdPart(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^(book|chapter|section|verse)[-_]/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function padNumber(value, size = 2) {
  return String(value).padStart(size, "0");
}

function normalizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeLowerText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createTimestamp() {
  return new Date().toISOString();
}

function normalizeTimestamp(value, fieldName) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return createTimestamp();
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`"${fieldName}" must be a valid timestamp.`);
  }

  return parsed.toISOString();
}

function assertSupportedValue(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new Error(`"${fieldName}" must use a supported value.`);
  }
}

function assertContentBlockOwnerExists(ownerEntity, ownerId, relatedTables = {}) {
  switch (ownerEntity) {
    case "books":
    case "book_sections":
    case "chapters":
    case "chapter_sections":
    case "verses":
    case "characters":
      assertForeignKey(relatedTables[ownerEntity] || [], "owner_id", ownerId, ownerEntity);
      return;
    default:
      throw new Error(`Unsupported content block owner_entity "${ownerEntity}".`);
  }
}

function asPositiveInteger(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`"${fieldName}" must be a positive integer.`);
  }
  return parsed;
}

function assertRequiredString(record, fieldName) {
  const value = String(record[fieldName] ?? "").trim();
  if (!value) {
    throw new Error(`"${fieldName}" is required.`);
  }
  return value;
}

function parseJsonObject(value, fieldName, defaultValue = {}) {
  if (value == null || value === "") {
    return { ...defaultValue };
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return { ...value };
  }

  try {
    const parsed = JSON.parse(String(value));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error(`"${fieldName}" must be a valid JSON object.`);
  }
}

function parseStringList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry ?? "").trim())
      .filter(Boolean);
  }

  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function assertUnique(rows, predicate, message, currentId) {
  const duplicate = rows.find((row) => row.id !== currentId && predicate(row));
  if (duplicate) {
    throw new Error(message);
  }
}

function assertUniqueId(rows, id, currentId) {
  assertUnique(rows, (row) => row.id === id, `ID "${id}" already exists in this table.`, currentId);
}

function assertForeignKey(rows, fieldName, value, tableName) {
  const exists = rows.some((row) => row.id === value);
  if (!exists) {
    throw new Error(`"${fieldName}" references unknown ${tableName} id "${value}".`);
  }
}

function buildDefaultSlug(record, fallbackFields) {
  const parts = fallbackFields
    .map((fieldName) => normalizeSlug(record[fieldName]))
    .filter(Boolean);

  return parts.join("-") || undefined;
}

function setDefaultValues(record, fieldNames, defaultValue = null) {
  fieldNames.forEach((fieldName) => {
    if (!(fieldName in record) || record[fieldName] === undefined) {
      record[fieldName] = defaultValue;
    }
  });
}

function assertSchemaRequiredFields(tableName, record) {
  const fields = CONTENT_FIELD_CONFIGS[tableName] || [];

  fields.forEach((field) => {
    if (field.required !== true) {
      return;
    }

    if (field.type === "checkbox") {
      if (typeof record[field.name] !== "boolean") {
        throw new Error(`"${field.name}" is required.`);
      }
      return;
    }

    if (field.type === "number") {
      if (record[field.name] == null || record[field.name] === "") {
        throw new Error(`"${field.name}" is required.`);
      }
      return;
    }

    if (String(record[field.name] ?? "").trim() === "") {
      throw new Error(`"${field.name}" is required.`);
    }
  });
}

export function generateId(tableName, record, relatedTables = {}) {
  if (record.id) {
    return normalizeSlug(record.id);
  }

  switch (tableName) {
    case "books":
      return `book-${normalizeIdPart(record.slug || record.short_title || record.title)}`;
    case "book_sections": {
      const order = asPositiveInteger(record.ui_order ?? 1, "ui_order");
      return `book-section-${normalizeIdPart(record.book_id)}-${padNumber(order)}`;
    }
    case "chapters": {
      const bookRow = (relatedTables.books || []).find((row) => row.id === record.source_book_id);
      const base = normalizeIdPart(bookRow?.slug || bookRow?.id || record.source_book_id);
      return `chapter-${base}-${padNumber(asPositiveInteger(record.chapter_number, "chapter_number"))}`;
    }
    case "chapter_sections": {
      const sectionNumber = asPositiveInteger(record.section_number, "section_number");
      return `chapter-section-${normalizeIdPart(record.chapter_id)}-${padNumber(sectionNumber)}`;
    }
    case "verses": {
      const verseNumber = asPositiveInteger(record.verse_number, "verse_number");
      return `verse-${normalizeIdPart(record.chapter_id)}-${padNumber(verseNumber, 3)}`;
    }
    case "characters":
      return `character-${normalizeIdPart(record.slug || record.name)}`;
    case "content_blocks": {
      const position = asPositiveInteger(record.position ?? 1, "position");
      return `content-block-${normalizeSlug(record.owner_entity)}-${normalizeSlug(record.owner_id)}-${normalizeSlug(record.region)}-${padNumber(position, 3)}`;
    }
    case "media_assets":
      return `media-asset-${normalizeIdPart(record.title || record.src || createTimestamp())}`;
    case "roles":
      return normalizeSlug(record.id || record.label);
    case "role_capabilities":
      return `role-capability-${normalizeSlug(record.role_id)}-${normalizeSlug(record.capability_key)}`;
    case "user_role_assignments":
      return `user-role-assignment-${normalizeSlug(record.user_id)}-${normalizeSlug(record.role_id)}`;
    default:
      throw new Error(`No ID generator configured for "${tableName}".`);
  }
}

export function validateRecord(tableName, record, rows, relatedTables = {}, currentId = null) {
  const normalized = { ...record };
  assertSchemaRequiredFields(tableName, normalized);

  switch (tableName) {
    case "books": {
      setDefaultValues(normalized, ["cover_image", "theme_key", "meta_title", "meta_description"], null);
      setDefaultValues(normalized, ["insight_title", "insight_media", "insight_caption"], "");
      if (normalized.ui_order == null) {
        normalized.ui_order = rows.length + 1;
      }
      normalized.slug = normalizeSlug(assertRequiredString(normalized, "slug"));
      normalized.title = assertRequiredString(normalized, "title");
      if (!normalized.short_title && normalized.title) {
        normalized.short_title = normalized.title;
      }
      if (normalized.ui_order != null) {
        normalized.ui_order = asPositiveInteger(normalized.ui_order, "ui_order");
      }
      if (normalized.is_published != null) {
        normalized.is_published = Boolean(normalized.is_published);
      }
      assertUnique(rows, (row) => row.slug === normalized.slug, `Book slug "${normalized.slug}" already exists.`, currentId);
      break;
    }
    case "book_sections": {
      setDefaultValues(normalized, ["summary", "badge_text", "cover_image", "insight_title", "insight_media", "insight_caption"], null);
      normalized.book_id = assertRequiredString(normalized, "book_id");
      normalized.source_book_id = assertRequiredString(normalized, "source_book_id");
      normalized.title = assertRequiredString(normalized, "title");
      normalized.slug = normalizeSlug(normalized.slug || buildDefaultSlug(normalized, ["title"]));
      normalized.ui_order = asPositiveInteger(normalized.ui_order ?? 1, "ui_order");
      if (normalized.chapter_start != null) {
        normalized.chapter_start = asPositiveInteger(normalized.chapter_start, "chapter_start");
      }
      if (normalized.chapter_end != null) {
        normalized.chapter_end = asPositiveInteger(normalized.chapter_end, "chapter_end");
      }
      if ((normalized.chapter_start == null) !== (normalized.chapter_end == null)) {
        throw new Error('"chapter_start" and "chapter_end" must be provided together.');
      }
      if (normalized.chapter_start != null && normalized.chapter_start > normalized.chapter_end) {
        throw new Error('"chapter_start" cannot be greater than "chapter_end".');
      }
      assertForeignKey(relatedTables.books || [], "book_id", normalized.book_id, "books");
      assertForeignKey(relatedTables.books || [], "source_book_id", normalized.source_book_id, "books");
      const sourceBook = (relatedTables.books || []).find((row) => row.id === normalized.source_book_id);
      if (sourceBook?.book_type !== "source") {
        throw new Error('"source_book_id" must reference a source book.');
      }
      assertUnique(
        rows,
        (row) =>
          row.book_id === normalized.book_id &&
          Number(row.ui_order) === normalized.ui_order,
        "This ui_order is already used inside the selected book.",
        currentId
      );
      break;
    }
    case "chapters": {
      setDefaultValues(normalized, ["summary", "insight_title", "insight_media", "insight_caption", "hero_image", "audio_intro_url"], null);
      normalized.source_book_id = assertRequiredString(normalized, "source_book_id");
      normalized.chapter_number = asPositiveInteger(normalized.chapter_number, "chapter_number");
      normalized.title = assertRequiredString(normalized, "title");
      normalized.slug = normalizeSlug(normalized.slug || buildDefaultSlug(normalized, ["title"]));
      if (normalized.ui_order != null) {
        normalized.ui_order = asPositiveInteger(normalized.ui_order, "ui_order");
      } else {
        normalized.ui_order = normalized.chapter_number;
      }
      assertForeignKey(relatedTables.books || [], "source_book_id", normalized.source_book_id, "books");
      const sourceBook = (relatedTables.books || []).find((row) => row.id === normalized.source_book_id);
      if (sourceBook?.book_type !== "source") {
        throw new Error('"source_book_id" must reference a source book.');
      }
      assertUnique(
        rows,
        (row) =>
          row.source_book_id === normalized.source_book_id &&
          Number(row.chapter_number) === normalized.chapter_number,
        `Chapter ${normalized.chapter_number} already exists for this source book.`,
        currentId
      );
      assertUnique(
        rows,
        (row) => row.source_book_id === normalized.source_book_id && row.slug === normalized.slug,
        `Chapter slug "${normalized.slug}" already exists for this source book.`,
        currentId
      );
      break;
    }
    case "chapter_sections": {
      setDefaultValues(normalized, ["summary", "insight_title", "insight_media", "insight_caption", "card_variant", "accent_key"], null);
      normalized.chapter_id = assertRequiredString(normalized, "chapter_id");
      normalized.section_number = asPositiveInteger(normalized.section_number, "section_number");
      normalized.title = assertRequiredString(normalized, "title");
      normalized.slug = normalizeSlug(normalized.slug || buildDefaultSlug(normalized, ["title"]));
      normalized.ui_order = asPositiveInteger(normalized.ui_order ?? normalized.section_number, "ui_order");
      if (normalized.verse_start != null) {
        normalized.verse_start = asPositiveInteger(normalized.verse_start, "verse_start");
      }
      if (normalized.verse_end != null) {
        normalized.verse_end = asPositiveInteger(normalized.verse_end, "verse_end");
      }
      if ((normalized.verse_start == null) !== (normalized.verse_end == null)) {
        throw new Error('"verse_start" and "verse_end" must be provided together.');
      }
      if (normalized.verse_start != null && normalized.verse_start > normalized.verse_end) {
        throw new Error('"verse_start" cannot be greater than "verse_end".');
      }
      assertForeignKey(relatedTables.chapters || [], "chapter_id", normalized.chapter_id, "chapters");
      assertUnique(
        rows,
        (row) => row.chapter_id === normalized.chapter_id && Number(row.section_number) === normalized.section_number,
        `Section ${normalized.section_number} already exists for this chapter.`,
        currentId
      );
      break;
    }
    case "verses": {
      setDefaultValues(
        normalized,
        ["sanskrit_text", "transliteration_text", "english_text", "hindi_text", "insight_title", "insight_media", "insight_caption", "audio_url"],
        null
      );
      normalized.chapter_id = assertRequiredString(normalized, "chapter_id");
      normalized.verse_number = asPositiveInteger(normalized.verse_number, "verse_number");
      normalized.slug = normalizeSlug(
        normalized.slug || `verse-${normalized.verse_number}`
      );
      assertForeignKey(relatedTables.chapters || [], "chapter_id", normalized.chapter_id, "chapters");
      assertUnique(
        rows,
        (row) => row.chapter_id === normalized.chapter_id && Number(row.verse_number) === normalized.verse_number,
        `Verse ${normalized.verse_number} already exists for this chapter.`,
        currentId
      );
      if (normalized.is_featured != null) {
        normalized.is_featured = Boolean(normalized.is_featured);
      }
      break;
    }
    case "characters": {
      setDefaultValues(normalized, ["aliases", "tags", "search_terms"], []);
      if (normalized.ui_order == null) {
        normalized.ui_order = rows.length + 1;
      }
      if (normalized.is_published == null) {
        normalized.is_published = false;
      }

      normalized.slug = normalizeSlug(assertRequiredString(normalized, "slug"));
      normalized.name = assertRequiredString(normalized, "name");
      normalized.image = assertRequiredString(normalized, "image");
      normalized.tradition = assertRequiredString(normalized, "tradition");
      normalized.role = assertRequiredString(normalized, "role");
      normalized.era = assertRequiredString(normalized, "era");
      normalized.collection = assertRequiredString(normalized, "collection");
      normalized.short_meta = assertRequiredString(normalized, "short_meta");
      normalized.summary = assertRequiredString(normalized, "summary");
      normalized.overview = assertRequiredString(normalized, "overview");
      normalized.focus = assertRequiredString(normalized, "focus");
      normalized.ui_order = asPositiveInteger(normalized.ui_order, "ui_order");
      normalized.detail_available = Boolean(normalized.detail_available);
      normalized.is_published = Boolean(normalized.is_published);
      normalized.aliases = parseStringList(normalized.aliases);
      normalized.tags = parseStringList(normalized.tags);
      normalized.search_terms = parseStringList(normalized.search_terms);

      if (!CHARACTER_SLUG_PATTERN.test(normalized.slug)) {
        throw new Error('"slug" must use lowercase kebab-case.');
      }

      assertUnique(rows, (row) => row.slug === normalized.slug, `Character slug "${normalized.slug}" already exists.`, currentId);
      break;
    }
    case "media_assets": {
      const createdAt = normalizeTimestamp(normalized.created_at, "created_at");
      normalized.asset_type = normalizeLowerText(assertRequiredString(normalized, "asset_type"));
      normalized.src = assertRequiredString(normalized, "src");
      normalized.title = normalized.title ? String(normalized.title).trim() : null;
      normalized.alt_text = normalized.alt_text ? String(normalized.alt_text).trim() : null;
      normalized.caption = normalized.caption ? String(normalized.caption).trim() : null;
      normalized.provider = normalized.provider ? String(normalized.provider).trim() : null;
      normalized.metadata = parseJsonObject(normalized.metadata, "metadata");
      normalized.created_at = currentId ? normalizeTimestamp(normalized.created_at || createdAt, "created_at") : createdAt;
      normalized.updated_at = createTimestamp();

      assertSupportedValue(normalized.asset_type, MEDIA_ASSET_TYPES, "asset_type");
      assertUnique(rows, (row) => row.src === normalized.src, `Media asset source "${normalized.src}" already exists.`, currentId);
      break;
    }
    case "content_blocks": {
      const createdAt = normalizeTimestamp(normalized.created_at, "created_at");
      normalized.owner_entity = normalizeLowerText(assertRequiredString(normalized, "owner_entity"));
      normalized.owner_id = assertRequiredString(normalized, "owner_id");
      normalized.region = normalizeLowerText(assertRequiredString(normalized, "region"));
      normalized.block_type = normalizeLowerText(assertRequiredString(normalized, "block_type"));
      normalized.variant = normalized.variant ? String(normalized.variant).trim() : null;
      normalized.position = asPositiveInteger(normalized.position, "position");
      normalized.status = normalizeLowerText(normalized.status || "draft");
      normalized.visibility = normalizeLowerText(normalized.visibility || "public");
      normalized.is_published = normalized.is_published == null
        ? normalized.status === "published"
        : Boolean(normalized.is_published);
      normalized.data = normalizeContentBlockData(
        normalized.block_type,
        parseJsonObject(normalized.data, "data"),
        "Content block"
      );
      normalized.created_at = currentId ? normalizeTimestamp(normalized.created_at || createdAt, "created_at") : createdAt;
      normalized.updated_at = createTimestamp();

      assertSupportedValue(normalized.owner_entity, CONTENT_BLOCK_OWNER_ENTITIES, "owner_entity");
      assertSupportedValue(normalized.region, CONTENT_BLOCK_REGIONS, "region");
      assertSupportedValue(normalized.block_type, CONTENT_BLOCK_TYPES, "block_type");
      assertSupportedValue(normalized.status, CONTENT_BLOCK_STATUSES, "status");
      assertSupportedValue(normalized.visibility, CONTENT_BLOCK_VISIBILITIES, "visibility");
      assertContentBlockOwnerExists(normalized.owner_entity, normalized.owner_id, relatedTables);

      if (normalized.data.media_asset_id) {
        assertForeignKey(relatedTables.media_assets || [], "media_asset_id", normalized.data.media_asset_id, "media_assets");
      }

      if (Array.isArray(normalized.data.media_asset_ids)) {
        normalized.data.media_asset_ids.forEach((assetId) => {
          assertForeignKey(relatedTables.media_assets || [], "media_asset_id", assetId, "media_assets");
        });
      }

      assertUnique(
        rows,
        (row) =>
          row.owner_entity === normalized.owner_entity
          && row.owner_id === normalized.owner_id
          && row.region === normalized.region
          && Number(row.position) === normalized.position,
        "This position is already used inside the selected owner region.",
        currentId
      );
      break;
    }
    case "roles": {
      normalized.label = assertRequiredString(normalized, "label");
      normalized.description = assertRequiredString(normalized, "description");
      break;
    }
    case "role_capabilities": {
      normalized.role_id = assertRequiredString(normalized, "role_id");
      normalized.capability_key = assertRequiredString(normalized, "capability_key");
      assertForeignKey(relatedTables.roles || [], "role_id", normalized.role_id, "roles");
      assertSupportedValue(normalized.capability_key, PERMISSION_KEYS, "capability_key");
      assertUnique(
        rows,
        (row) => row.role_id === normalized.role_id && row.capability_key === normalized.capability_key,
        "This capability is already assigned to the selected role.",
        currentId
      );
      break;
    }
    case "user_role_assignments": {
      normalized.user_id = assertRequiredString(normalized, "user_id");
      normalized.role_id = assertRequiredString(normalized, "role_id");
      assertForeignKey(relatedTables.roles || [], "role_id", normalized.role_id, "roles");
      assertUnique(
        rows,
        (row) => row.user_id === normalized.user_id && row.role_id === normalized.role_id,
        "This user already has the selected role.",
        currentId
      );
      break;
    }
    default:
      throw new Error(`Unsupported table "${tableName}".`);
  }

  normalized.id = currentId ? String(currentId).trim() : generateId(tableName, normalized, relatedTables);
  assertUniqueId(rows, normalized.id, currentId);
  return normalized;
}
