import { normalizeIdentifier, normalizeText } from "./normalize.js";

export const IDENTIFIER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MEDIA_PATH_PATTERN = /^(\/|https?:\/\/|\.{1,2}\/)/i;

export function requireObject(record, label) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        throw new Error(`${label} must be an object.`);
    }
}

export function requireFields(record, fields, label) {
    fields.forEach((field) => {
        if (!(field in record)) {
            throw new Error(`${label} is missing required field "${field}".`);
        }
    });
}

export function requireString(record, field, label) {
    const value = normalizeText(record[field]);
    if (!value) {
        throw new Error(`${label} has an invalid "${field}" value.`);
    }
    return value;
}

export function requireIdentifier(record, field, label) {
    const value = normalizeIdentifier(record[field]);
    if (!IDENTIFIER_PATTERN.test(value)) {
        throw new Error(`${label} must use a lowercase kebab-case "${field}".`);
    }
    return value;
}

export function requirePositiveInteger(record, field, label) {
    const value = record[field];
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`${label} must use a positive integer "${field}".`);
    }
    return value;
}

export function requireBoolean(record, field, label) {
    if (typeof record[field] !== "boolean") {
        throw new Error(`${label} must use a boolean "${field}" value.`);
    }
    return record[field];
}

export function requireMediaPath(record, field, label) {
    const value = requireString(record, field, label);
    if (!MEDIA_PATH_PATTERN.test(value)) {
        throw new Error(`${label} has an invalid "${field}" media path.`);
    }
    return value;
}

export function normalizeOptionalString(record, field) {
    if (!(field in record) || record[field] == null) return null;
    const value = normalizeText(record[field]);
    return value || null;
}

export function normalizeOptionalBoolean(record, field, label) {
    if (!(field in record) || record[field] == null) return null;
    if (typeof record[field] !== "boolean") {
        throw new Error(`${label} must use a boolean or null "${field}" value.`);
    }
    return record[field];
}

export function normalizeOptionalMediaPath(record, field, label) {
    if (!(field in record) || record[field] == null) return null;
    const value = normalizeText(record[field]);
    if (!value) return null;
    if (!MEDIA_PATH_PATTERN.test(value)) {
        throw new Error(`${label} has an invalid "${field}" media path.`);
    }
    return value;
}

export function normalizeOptionalPositiveInteger(record, field, label) {
    if (!(field in record) || record[field] == null) return null;
    return requirePositiveInteger(record, field, label);
}

export function createUniqueTracker() {
    return new Set();
}

export function assertUnique(tracker, value, label) {
    if (tracker.has(value)) {
        throw new Error(`Duplicate ${label} detected: "${value}".`);
    }
    tracker.add(value);
}
