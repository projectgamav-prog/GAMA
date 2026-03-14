import {
    MEDIA_ASSET_TYPES,
    normalizeContentBlockData,
} from "../content/schema/cms-schema.js";
import { createAdminApi } from "./api.js";

const CONTENT_BLOCK_TYPE_OPTIONS = Object.freeze([
    { value: "rich_text", label: "Rich Text" },
    { value: "commentary", label: "Commentary" },
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "media", label: "Media" },
    { value: "audio", label: "Audio" },
    { value: "quote", label: "Quote" },
    { value: "gallery", label: "Gallery" },
    { value: "cta", label: "Call To Action" },
    { value: "related_entities", label: "Related Entities" },
    { value: "stat_grid", label: "Stat Grid" },
    { value: "hero", label: "Hero" },
]);

const STATUS_OPTIONS = Object.freeze([
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
]);

const VISIBILITY_OPTIONS = Object.freeze([
    { value: "public", label: "Visible" },
    { value: "hidden", label: "Hidden" },
]);

const MEDIA_FILTER_OPTIONS = Object.freeze([
    { value: "compatible", label: "Compatible" },
    ...MEDIA_ASSET_TYPES.map((value) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
    })),
]);

const RELATED_ENTITIES_TEMPLATE = Object.freeze([
    {
        entity: "characters",
        id: "character-arjuna",
        label: "Arjuna",
    },
]);

const STAT_GRID_TEMPLATE = Object.freeze([
    {
        label: "Theme",
        value: "Action without attachment",
    },
]);

let mediaAssetsCache = null;
let mediaAssetsPromise = null;

function cloneObject(value, fallback = {}) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? { ...value }
        : { ...fallback };
}

function cloneArray(values = []) {
    return Array.isArray(values) ? [...values] : [];
}

function normalizeText(value) {
    return String(value ?? "").trim();
}

function createValidationError(message, fieldErrors = {}) {
    const error = new Error(message);
    error.fieldErrors = fieldErrors;
    return error;
}

function pickFirstNonEmpty(...values) {
    return values.find((value) => normalizeText(value));
}

function createDefaultBlockData(blockType = "rich_text") {
    switch (blockType) {
        case "hero":
            return {
                eyebrow: "",
                title: "",
                subtitle: "",
                media_asset_id: "",
                cta_label: "",
                cta_href: "",
            };
        case "commentary":
        case "rich_text":
            return {
                title: "",
                body: "",
            };
        case "image":
            return {
                title: "",
                media_asset_id: "",
                src: "",
                caption: "",
                alt_text: "",
            };
        case "video":
            return {
                title: "",
                media_asset_id: "",
                src: "",
                embed_url: "",
                caption: "",
                provider: "",
                alt_text: "",
            };
        case "media":
            return {
                title: "",
                media_asset_id: "",
                src: "",
                embed_url: "",
                caption: "",
                provider: "",
                alt_text: "",
                media_kind: "",
            };
        case "audio":
            return {
                title: "",
                media_asset_id: "",
                src: "",
                caption: "",
                provider: "",
            };
        case "quote":
            return {
                quote: "",
                attribution: "",
            };
        case "gallery":
            return {
                title: "",
                media_asset_ids: [],
                caption: "",
            };
        case "cta":
            return {
                title: "",
                body: "",
                label: "",
                href: "",
            };
        case "related_entities":
            return {
                title: "",
                items: cloneArray(RELATED_ENTITIES_TEMPLATE),
            };
        case "stat_grid":
            return {
                title: "",
                items: cloneArray(STAT_GRID_TEMPLATE),
            };
        default:
            return {};
    }
}

function cloneBlockData(blockType, data = {}) {
    const defaults = createDefaultBlockData(blockType);
    const nextData = {
        ...defaults,
        ...cloneObject(data),
    };

    if (Array.isArray(defaults.media_asset_ids) || Array.isArray(nextData.media_asset_ids)) {
        nextData.media_asset_ids = cloneArray(nextData.media_asset_ids);
    }

    if (Array.isArray(defaults.items) || Array.isArray(nextData.items)) {
        nextData.items = cloneArray(nextData.items).map((item) => cloneObject(item));
    }

    return nextData;
}

function createDraft(blockType = "rich_text", seed = {}) {
    return {
        block_type: blockType,
        variant: seed.variant ?? "",
        status: seed.status || "draft",
        visibility: seed.visibility || "public",
        is_published: seed.is_published === true || seed.status === "published",
        data: cloneBlockData(blockType, seed.data),
    };
}

function prettyJson(value, fallback) {
    return JSON.stringify(value ?? fallback, null, 2);
}

function getCompatibleAssetTypes(blockType) {
    switch (blockType) {
        case "image":
            return ["image"];
        case "video":
            return ["video", "embed"];
        case "audio":
            return ["audio"];
        case "hero":
            return ["image", "video", "embed"];
        case "media":
            return [...MEDIA_ASSET_TYPES];
        case "gallery":
            return [...MEDIA_ASSET_TYPES];
        default:
            return [];
    }
}

export function selectCompatibleImportedAsset(blockType, importedAssets = []) {
    const compatibleTypes = new Set(getCompatibleAssetTypes(blockType));
    return (Array.isArray(importedAssets) ? importedAssets : []).find((asset) => (
        compatibleTypes.has(normalizeText(asset?.asset_type).toLowerCase())
    )) || null;
}

function getDefaultAssetFilter(blockType) {
    if (blockType === "image") {
        return "image";
    }

    if (blockType === "audio") {
        return "audio";
    }

    return "compatible";
}

function getAssetLabel(asset) {
    const assetType = normalizeText(asset?.asset_type) || "media";
    const title = normalizeText(asset?.title);
    const src = normalizeText(asset?.src);
    return title || src || `${assetType} asset`;
}

function isImageAsset(asset) {
    return normalizeText(asset?.asset_type).toLowerCase() === "image";
}

function getItemJsonField(blockType) {
    if (blockType === "related_entities" || blockType === "stat_grid") {
        return "items";
    }

    return "";
}

function createRawJsonState(draft) {
    const blockType = draft?.block_type || "rich_text";
    const data = cloneObject(draft?.data);

    if (blockType === "related_entities") {
        return {
            items: prettyJson(data.items, RELATED_ENTITIES_TEMPLATE),
        };
    }

    if (blockType === "stat_grid") {
        return {
            items: prettyJson(data.items, STAT_GRID_TEMPLATE),
        };
    }

    return {};
}

async function loadMediaAssets(api) {
    if (Array.isArray(mediaAssetsCache)) {
        return mediaAssetsCache;
    }

    if (!mediaAssetsPromise) {
        mediaAssetsPromise = api.listRecords("media_assets")
            .then((records) => {
                mediaAssetsCache = sortMediaAssets(Array.isArray(records) ? records : []);
                return mediaAssetsCache;
            })
            .catch((error) => {
                mediaAssetsPromise = null;
                throw error;
            });
    }

    return mediaAssetsPromise;
}

function sortMediaAssets(records = []) {
    return [...records].sort((left, right) => getAssetLabel(left).localeCompare(getAssetLabel(right)));
}

function createSection(titleText, subtitleText = "") {
    const section = document.createElement("section");
    section.className = "admin-content-block-section";

    const header = document.createElement("div");
    header.className = "admin-content-block-section-header";

    const title = document.createElement("h4");
    title.className = "admin-explanation-section-title";
    title.textContent = titleText;
    header.appendChild(title);

    if (subtitleText) {
        const subtitle = document.createElement("p");
        subtitle.className = "admin-editor-subtitle admin-content-block-section-subtitle";
        subtitle.textContent = subtitleText;
        header.appendChild(subtitle);
    }

    section.appendChild(header);
    return section;
}

function createField({
    label,
    hint = "",
    error = "",
    control,
    wide = false,
}) {
    const field = document.createElement("label");
    field.className = "admin-editor-field";
    if (wide) {
        field.classList.add("is-wide");
    }
    if (error) {
        field.classList.add("has-error");
    }

    const labelElement = document.createElement("span");
    labelElement.className = "admin-editor-field-label";
    labelElement.textContent = label;

    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control";
    controlWrap.appendChild(control);

    field.append(labelElement, controlWrap);

    if (hint) {
        const hintElement = document.createElement("span");
        hintElement.className = "admin-editor-field-hint";
        hintElement.textContent = hint;
        field.appendChild(hintElement);
    }

    if (error) {
        const errorElement = document.createElement("span");
        errorElement.className = "admin-editor-field-error";
        errorElement.textContent = error;
        field.appendChild(errorElement);
    }

    return field;
}

function createInputControl({
    type = "text",
    value = "",
    placeholder = "",
    disabled = false,
    rows = 4,
    options = [],
    onInput = null,
}) {
    let input;

    if (type === "textarea") {
        input = document.createElement("textarea");
        input.rows = rows;
        input.value = String(value ?? "");
    } else if (type === "select") {
        input = document.createElement("select");
        options.forEach((option) => {
            const element = document.createElement("option");
            element.value = option.value;
            element.textContent = option.label;
            element.selected = String(option.value) === String(value ?? "");
            input.appendChild(element);
        });
    } else {
        input = document.createElement("input");
        input.type = type;
        input.value = String(value ?? "");
    }

    input.className = "admin-editor-input";
    input.placeholder = placeholder;
    input.disabled = disabled;

    if (typeof onInput === "function") {
        const eventName = type === "select" ? "change" : "input";
        input.addEventListener(eventName, () => {
            onInput(input.value);
        });
    }

    return input;
}

function createButton(text, className, { type = "button", disabled = false, onClick = null } = {}) {
    const button = document.createElement("button");
    button.type = type;
    button.className = className;
    button.disabled = disabled;
    button.textContent = text;
    if (typeof onClick === "function") {
        button.addEventListener("click", onClick);
    }
    return button;
}

function createAssetPreview(asset) {
    const preview = document.createElement("div");
    preview.className = "admin-content-block-asset-preview";

    if (!asset) {
        const empty = document.createElement("p");
        empty.className = "admin-editor-field-hint";
        empty.textContent = "No reusable media asset selected yet.";
        preview.appendChild(empty);
        return preview;
    }

    const meta = document.createElement("div");
    meta.className = "admin-content-block-asset-preview-copy";

    const eyebrow = document.createElement("span");
    eyebrow.className = "admin-content-block-asset-badge";
    eyebrow.textContent = normalizeText(asset.asset_type) || "media";

    const title = document.createElement("strong");
    title.textContent = getAssetLabel(asset);

    const src = document.createElement("span");
    src.className = "admin-editor-field-hint";
    src.textContent = normalizeText(asset.src);

    meta.append(eyebrow, title, src);

    if (isImageAsset(asset) && normalizeText(asset.src)) {
        const image = document.createElement("img");
        image.className = "admin-content-block-asset-preview-image";
        image.src = asset.src;
        image.alt = normalizeText(asset.alt_text) || getAssetLabel(asset);
        image.loading = "lazy";
        preview.appendChild(image);
    }

    preview.appendChild(meta);
    return preview;
}

function createDirectSourcePreview(blockType, draftData) {
    const preview = document.createElement("div");
    preview.className = "admin-content-block-direct-preview";

    const src = normalizeText(draftData?.src);
    const embedUrl = normalizeText(draftData?.embed_url);
    const activeUrl = embedUrl || src;

    if (!activeUrl) {
        const empty = document.createElement("p");
        empty.className = "admin-editor-field-hint";
        empty.textContent = "No direct source set yet. Use a reusable asset or paste a URL below.";
        preview.appendChild(empty);
        return preview;
    }

    if (blockType === "image") {
        const image = document.createElement("img");
        image.className = "admin-content-block-asset-preview-image";
        image.src = src;
        image.alt = normalizeText(draftData?.alt_text) || normalizeText(draftData?.title) || "Image preview";
        image.loading = "lazy";
        preview.appendChild(image);
    }

    const summary = document.createElement("p");
    summary.className = "admin-editor-field-hint";
    summary.textContent = embedUrl
        ? "Using a direct embed URL fallback."
        : "Using a direct source URL fallback.";
    preview.appendChild(summary);

    const link = document.createElement("a");
    link.className = "admin-content-block-direct-link";
    link.href = activeUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = activeUrl;
    preview.appendChild(link);

    return preview;
}

function createMediaFilterRow(state, compatibleTypes, disabled, rerender) {
    const row = document.createElement("div");
    row.className = "admin-content-block-filter-row";

    MEDIA_FILTER_OPTIONS.forEach((option) => {
        if (option.value !== "compatible" && compatibleTypes.length && !compatibleTypes.includes(option.value)) {
            return;
        }

        const button = createButton(
            option.label,
            `admin-content-block-filter${state.assetFilter === option.value ? " is-active" : ""}`,
            {
                disabled,
                onClick() {
                    state.assetFilter = option.value;
                    rerender();
                },
            }
        );
        row.appendChild(button);
    });

    return row;
}

function getVisibleMediaAssets(state, blockType) {
    const compatibleTypes = getCompatibleAssetTypes(blockType);
    const filterValue = state.assetFilter || getDefaultAssetFilter(blockType);
    const searchValue = normalizeText(state.assetSearchQuery).toLowerCase();
    const assets = Array.isArray(state.mediaAssets.records) ? state.mediaAssets.records : [];

    return assets.filter((asset) => {
        const assetType = normalizeText(asset?.asset_type).toLowerCase();
        const matchesSearch = !searchValue
            || getAssetLabel(asset).toLowerCase().includes(searchValue)
            || normalizeText(asset?.src).toLowerCase().includes(searchValue);

        if (!matchesSearch) {
            return false;
        }

        if (filterValue === "compatible") {
            return compatibleTypes.length ? compatibleTypes.includes(assetType) : true;
        }

        return assetType === filterValue;
    });
}

function appendAssetThumbnail(card, asset) {
    if (isImageAsset(asset) && normalizeText(asset?.src)) {
        const image = document.createElement("img");
        image.className = "admin-content-block-asset-card-image";
        image.src = asset.src;
        image.alt = normalizeText(asset.alt_text) || getAssetLabel(asset);
        image.loading = "lazy";
        card.appendChild(image);
        return;
    }

    const placeholder = document.createElement("div");
    placeholder.className = "admin-content-block-asset-card-placeholder";
    placeholder.textContent = normalizeText(asset?.asset_type) || "media";
    card.appendChild(placeholder);
}

function createAssetPicker({
    title,
    hint,
    state,
    blockType,
    selectedIds = [],
    disabled = false,
    onSelect,
    onImportComplete = null,
    rerender,
}) {
    const picker = document.createElement("div");
    picker.className = "admin-content-block-picker";

    const header = document.createElement("div");
    header.className = "admin-content-block-picker-header";

    const copy = document.createElement("div");
    copy.className = "admin-content-block-picker-copy";

    const heading = document.createElement("h5");
    heading.className = "admin-content-block-picker-title";
    heading.textContent = title;
    copy.appendChild(heading);

    if (hint) {
        const text = document.createElement("p");
        text.className = "admin-editor-field-hint";
        text.textContent = hint;
        copy.appendChild(text);
    }

    header.appendChild(copy);
    picker.appendChild(header);

    const controls = document.createElement("div");
    controls.className = "admin-content-block-picker-tools";

    const search = createInputControl({
        value: state.assetSearchQuery,
        placeholder: "Search media by title or source",
        disabled: disabled || state.mediaAssets.loading,
        onInput(nextValue) {
            state.assetSearchQuery = nextValue;
            rerender();
        },
    });
    controls.appendChild(search);

    const importFilesInput = document.createElement("input");
    importFilesInput.type = "file";
    importFilesInput.multiple = true;
    importFilesInput.hidden = true;

    const importFolderInput = document.createElement("input");
    importFolderInput.type = "file";
    importFolderInput.multiple = true;
    importFolderInput.hidden = true;
    importFolderInput.webkitdirectory = true;
    importFolderInput.setAttribute("webkitdirectory", "");

    async function handleImport(fileList) {
        const files = Array.from(fileList || []);
        if (!files.length || !state.api?.importMediaFiles) {
            return;
        }

        state.mediaAssets.importing = true;
        state.mediaAssets.error = "";
        state.mediaAssets.notice = "";
        rerender();

        try {
            const importedAssets = await state.api.importMediaFiles(files);
            mediaAssetsCache = sortMediaAssets([
                ...state.mediaAssets.records,
                ...(Array.isArray(importedAssets) ? importedAssets : []),
            ]);
            state.mediaAssets = {
                loading: false,
                importing: false,
                error: "",
                notice: "",
                records: mediaAssetsCache,
            };
            onImportComplete?.(Array.isArray(importedAssets) ? importedAssets : []);
            rerender();
        } catch (error) {
            state.mediaAssets.importing = false;
            state.mediaAssets.error = error.message || "Unable to import local media files.";
            state.mediaAssets.notice = "";
            rerender();
        } finally {
            importFilesInput.value = "";
            importFolderInput.value = "";
        }
    }

    importFilesInput.addEventListener("change", async () => {
        await handleImport(importFilesInput.files);
    });
    importFolderInput.addEventListener("change", async () => {
        await handleImport(importFolderInput.files);
    });

    controls.appendChild(
        createButton(
            state.mediaAssets.importing ? "Importing..." : "Import Files",
            "admin-inline-bar-link",
            {
                disabled: disabled || state.mediaAssets.importing,
                onClick() {
                    importFilesInput.click();
                },
            }
        )
    );

    controls.appendChild(
        createButton(
            state.mediaAssets.importing ? "Importing..." : "Import Folder",
            "admin-inline-bar-link",
            {
                disabled: disabled || state.mediaAssets.importing,
                onClick() {
                    importFolderInput.click();
                },
            }
        )
    );

    picker.append(importFilesInput, importFolderInput, controls);

    const compatibleTypes = getCompatibleAssetTypes(blockType);
    if (compatibleTypes.length > 1) {
        picker.appendChild(createMediaFilterRow(state, compatibleTypes, disabled, rerender));
    }

    if (state.mediaAssets.loading) {
        const loading = document.createElement("p");
        loading.className = "admin-editor-field-hint";
        loading.textContent = "Loading reusable media assets...";
        picker.appendChild(loading);
        return picker;
    }

    if (state.mediaAssets.error) {
        const error = document.createElement("p");
        error.className = "admin-editor-field-hint is-error";
        error.textContent = state.mediaAssets.error;
        picker.appendChild(error);
    }

    if (state.mediaAssets.notice) {
        const notice = document.createElement("p");
        notice.className = "admin-editor-field-hint";
        notice.textContent = state.mediaAssets.notice;
        picker.appendChild(notice);
    }

    const selectedAssetIds = new Set(selectedIds.filter(Boolean));
    const selectionSummary = document.createElement("p");
    selectionSummary.className = "admin-editor-field-hint";
    selectionSummary.textContent = selectedAssetIds.size
        ? `${selectedAssetIds.size} asset${selectedAssetIds.size === 1 ? "" : "s"} selected.`
        : "No assets selected yet.";
    picker.appendChild(selectionSummary);

    const grid = document.createElement("div");
    grid.className = "admin-content-block-asset-grid";

    const visibleAssets = getVisibleMediaAssets(state, blockType);
    if (!visibleAssets.length) {
        const empty = document.createElement("p");
        empty.className = "admin-editor-field-hint";
        empty.textContent = blockType === "gallery"
            ? "No compatible reusable media assets exist for this gallery filter yet."
            : `No compatible reusable media assets exist for ${getContentBlockTypeLabel(blockType)} blocks yet.`;
        picker.appendChild(empty);
    } else {
        visibleAssets.forEach((asset) => {
            const isSelected = selectedAssetIds.has(asset.id);
            const button = document.createElement("button");
            button.type = "button";
            button.className = `admin-content-block-asset-card${isSelected ? " is-selected" : ""}`;
            button.disabled = disabled;
            button.addEventListener("click", () => onSelect(asset.id));

            appendAssetThumbnail(button, asset);

            const meta = document.createElement("div");
            meta.className = "admin-content-block-asset-card-copy";

            const badge = document.createElement("span");
            badge.className = "admin-content-block-asset-badge";
            badge.textContent = normalizeText(asset.asset_type) || "media";

            const label = document.createElement("strong");
            label.textContent = getAssetLabel(asset);

            const src = document.createElement("span");
            src.className = "admin-editor-field-hint";
            src.textContent = normalizeText(asset.src);

            meta.append(badge, label, src);
            button.appendChild(meta);
            grid.appendChild(button);
        });

        picker.appendChild(grid);
    }

    return picker;
}

function getSelectedAsset(state, assetId) {
    if (!assetId) {
        return null;
    }

    return state.mediaAssets.records.find((asset) => asset.id === assetId) || null;
}

function getSelectedAssets(state, assetIds = []) {
    const wanted = new Set(assetIds.filter(Boolean));
    return state.mediaAssets.records.filter((asset) => wanted.has(asset.id));
}

function validateSelectedAssetTypes(blockType, state, data) {
    const compatibleTypes = getCompatibleAssetTypes(blockType);
    if (!compatibleTypes.length || !Array.isArray(state.mediaAssets.records) || !state.mediaAssets.records.length) {
        return;
    }

    const ids = [];
    if (data.media_asset_id) {
        ids.push(data.media_asset_id);
    }

    if (Array.isArray(data.media_asset_ids)) {
        ids.push(...data.media_asset_ids);
    }

    ids.forEach((assetId) => {
        const asset = getSelectedAsset(state, assetId);
        if (!asset) {
            return;
        }

        const assetType = normalizeText(asset.asset_type).toLowerCase();
        if (!compatibleTypes.includes(assetType)) {
            const fieldName = Array.isArray(data.media_asset_ids) ? "media_asset_ids" : "media_asset_id";
            throw createValidationError(
                `${getContentBlockTypeLabel(blockType)} blocks cannot use ${assetType} assets.`,
                {
                    [fieldName]: `${getContentBlockTypeLabel(blockType)} blocks cannot use ${assetType} assets.`,
                }
            );
        }
    });
}

function parseJsonArray(rawValue, label) {
    let parsed;

    try {
        parsed = JSON.parse(rawValue || "[]");
    } catch {
        throw new Error(`${label} must be valid JSON.`);
    }

    if (!Array.isArray(parsed)) {
        throw new Error(`${label} must be a JSON array.`);
    }

    return parsed;
}

function getFieldError(state, ...fieldNames) {
    return pickFirstNonEmpty(...fieldNames.map((fieldName) => state.fieldErrors?.[fieldName]));
}

function clearFieldErrors(state, ...fieldNames) {
    state.dismissedExternalError = true;
    if (!state.fieldErrors || !fieldNames.length) {
        return;
    }
    fieldNames.forEach((fieldName) => {
        delete state.fieldErrors[fieldName];
    });

    if (!Object.keys(state.fieldErrors).length) {
        state.errorMessage = "";
    }
}

function validateDraftBeforeNormalize(state) {
    const blockType = state.draft.block_type;
    const draftData = cloneObject(state.draft.data);
    const fieldErrors = {};

    switch (blockType) {
        case "image":
            if (!normalizeText(draftData.media_asset_id) && !normalizeText(draftData.src)) {
                fieldErrors.media_asset_id = "Select an image from the media library or enter a direct image URL.";
                fieldErrors.src = "Direct image URL is optional when an image asset is selected.";
            }
            break;
        case "video":
            if (!normalizeText(draftData.media_asset_id) && !normalizeText(draftData.src) && !normalizeText(draftData.embed_url)) {
                fieldErrors.media_asset_id = "Choose a video/embed asset or enter a direct video URL.";
                fieldErrors.src = "Enter a direct video URL, embed URL, or choose a reusable asset.";
                fieldErrors.embed_url = "Enter an embed URL, direct video URL, or choose a reusable asset.";
            }
            break;
        case "audio":
            if (!normalizeText(draftData.media_asset_id) && !normalizeText(draftData.src)) {
                fieldErrors.media_asset_id = "Choose an audio asset or enter a direct audio URL.";
                fieldErrors.src = "Enter a direct audio URL or choose an audio asset.";
            }
            break;
        case "media":
            if (!normalizeText(draftData.media_asset_id) && !normalizeText(draftData.src) && !normalizeText(draftData.embed_url)) {
                fieldErrors.media_asset_id = "Choose a reusable asset or enter a direct source.";
                fieldErrors.src = "Enter a direct source URL, embed URL, or choose a reusable asset.";
                fieldErrors.embed_url = "Enter an embed URL, direct source URL, or choose a reusable asset.";
            }
            break;
        case "gallery":
            if (!Array.isArray(draftData.media_asset_ids) || !draftData.media_asset_ids.length) {
                fieldErrors.media_asset_ids = "Select at least one reusable media asset for the gallery.";
            }
            break;
        case "related_entities":
        case "stat_grid":
            if (!normalizeText(state.rawJson.items)) {
                fieldErrors.items = blockType === "related_entities"
                    ? "Provide a JSON array of related entities."
                    : "Provide a JSON array of stat items.";
            }
            break;
        default:
            break;
    }

    if (Object.keys(fieldErrors).length) {
        throw createValidationError("Please fix the highlighted fields and try again.", fieldErrors);
    }
}

function buildPayload(state) {
    validateDraftBeforeNormalize(state);

    const blockType = state.draft.block_type;
    const draftData = cloneObject(state.draft.data);
    let nextData;

    switch (blockType) {
        case "related_entities":
            try {
                nextData = {
                    title: draftData.title,
                    items: parseJsonArray(state.rawJson.items, "Related entities"),
                };
            } catch (error) {
                throw createValidationError(error.message, {
                    items: error.message,
                });
            }
            break;
        case "stat_grid":
            try {
                nextData = {
                    title: draftData.title,
                    items: parseJsonArray(state.rawJson.items, "Stat grid items"),
                };
            } catch (error) {
                throw createValidationError(error.message, {
                    items: error.message,
                });
            }
            break;
        case "gallery":
            nextData = {
                title: draftData.title,
                caption: draftData.caption,
                media_asset_ids: cloneArray(draftData.media_asset_ids),
            };
            break;
        default:
            nextData = cloneObject(draftData);
            break;
    }

    validateSelectedAssetTypes(blockType, state, nextData);
    let normalizedData;
    try {
        normalizedData = normalizeContentBlockData(
            blockType,
            nextData,
            `${getContentBlockTypeLabel(blockType)} block`
        );
    } catch (error) {
        throw createValidationError(error.message);
    }

    const status = state.draft.status === "published" ? "published" : "draft";

    return {
        block_type: blockType,
        variant: normalizeText(state.draft.variant) || null,
        status,
        visibility: state.draft.visibility === "hidden" ? "hidden" : "public",
        is_published: status === "published",
        data: normalizedData,
    };
}

function appendTopLevelFields(grid, state, busy, onTypeChange) {
    grid.appendChild(
        createField({
            label: "Block Type",
            hint: "Choose a structured editorial block. Each type gets a purpose-built form below.",
            control: createInputControl({
                type: "select",
                value: state.draft.block_type,
                options: CONTENT_BLOCK_TYPE_OPTIONS,
                disabled: busy,
                onInput(nextValue) {
                    onTypeChange?.(nextValue);
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Variant",
            hint: "Optional subtype or display hint for shared renderers.",
            control: createInputControl({
                value: state.draft.variant,
                placeholder: "Optional variant",
                disabled: busy,
                onInput(nextValue) {
                    state.draft.variant = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Status",
            hint: "Published blocks appear on public pages. Draft blocks remain admin-only.",
            control: createInputControl({
                type: "select",
                value: state.draft.status,
                options: STATUS_OPTIONS,
                disabled: busy,
                onInput(nextValue) {
                    state.draft.status = nextValue;
                    state.draft.is_published = nextValue === "published";
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Visibility",
            hint: "Hidden blocks stay saved but do not render publicly.",
            control: createInputControl({
                type: "select",
                value: state.draft.visibility,
                options: VISIBILITY_OPTIONS,
                disabled: busy,
                onInput(nextValue) {
                    state.draft.visibility = nextValue;
                },
            }),
        })
    );
}

function appendTextFields(grid, state, busy, blockType) {
    const draftData = state.draft.data;

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "Optional heading",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: blockType === "commentary" ? "Commentary Body" : "Body",
            wide: true,
            hint: "Paragraph breaks are preserved when rendered.",
            control: createInputControl({
                type: "textarea",
                rows: 8,
                value: draftData.body,
                placeholder: "Write the block body",
                disabled: busy,
                onInput(nextValue) {
                    draftData.body = nextValue;
                },
            }),
        })
    );
}

function appendQuoteFields(grid, state, busy) {
    const draftData = state.draft.data;

    grid.appendChild(
        createField({
            label: "Quote",
            wide: true,
            control: createInputControl({
                type: "textarea",
                rows: 6,
                value: draftData.quote,
                placeholder: "Quoted text",
                disabled: busy,
                onInput(nextValue) {
                    draftData.quote = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Attribution",
            control: createInputControl({
                value: draftData.attribution,
                placeholder: "Speaker or source",
                disabled: busy,
                onInput(nextValue) {
                    draftData.attribution = nextValue;
                },
            }),
        })
    );
}

function appendCtaFields(grid, state, busy) {
    const draftData = state.draft.data;

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "CTA heading",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Button Label",
            control: createInputControl({
                value: draftData.label,
                placeholder: "Read more",
                disabled: busy,
                onInput(nextValue) {
                    draftData.label = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Body",
            wide: true,
            control: createInputControl({
                type: "textarea",
                rows: 5,
                value: draftData.body,
                placeholder: "Short supporting copy",
                disabled: busy,
                onInput(nextValue) {
                    draftData.body = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Link URL",
            control: createInputControl({
                value: draftData.href,
                placeholder: "/path-or-url",
                disabled: busy,
                onInput(nextValue) {
                    draftData.href = nextValue;
                },
            }),
        })
    );
}

function appendStructuredJsonFields(grid, state, busy, blockType) {
    const draftData = state.draft.data;
    const jsonField = getItemJsonField(blockType);
    const label = blockType === "related_entities" ? "Related Items JSON" : "Stat Items JSON";
    const hint = blockType === "related_entities"
        ? "Provide an array of objects like { \"entity\": \"characters\", \"id\": \"character-arjuna\", \"label\": \"Arjuna\" }."
        : "Provide an array of objects like { \"label\": \"Theme\", \"value\": \"Action\" }.";

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "Optional heading",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label,
            wide: true,
            hint,
            error: getFieldError(state, "items"),
            control: createInputControl({
                type: "textarea",
                rows: 8,
                value: state.rawJson[jsonField],
                disabled: busy,
                onInput(nextValue) {
                    state.rawJson[jsonField] = nextValue;
                    clearFieldErrors(state, "items");
                },
            }),
        })
    );
}

function appendHeroFields(grid, state, busy) {
    const draftData = state.draft.data;

    grid.appendChild(
        createField({
            label: "Eyebrow",
            control: createInputControl({
                value: draftData.eyebrow,
                placeholder: "Optional eyebrow",
                disabled: busy,
                onInput(nextValue) {
                    draftData.eyebrow = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "Hero title",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Subtitle",
            wide: true,
            control: createInputControl({
                type: "textarea",
                rows: 5,
                value: draftData.subtitle,
                placeholder: "Hero subtitle",
                disabled: busy,
                onInput(nextValue) {
                    draftData.subtitle = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "CTA Label",
            control: createInputControl({
                value: draftData.cta_label,
                placeholder: "Explore",
                disabled: busy,
                onInput(nextValue) {
                    draftData.cta_label = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "CTA Link",
            control: createInputControl({
                value: draftData.cta_href,
                placeholder: "/path-or-url",
                disabled: busy,
                onInput(nextValue) {
                    draftData.cta_href = nextValue;
                },
            }),
        })
    );
}

function appendMediaFields(grid, state, busy, blockType, rerender) {
    const draftData = state.draft.data;
    const selectedAssetId = normalizeText(draftData.media_asset_id);
    const selectedAsset = getSelectedAsset(state, selectedAssetId);
    const directPreviewType = blockType === "media" ? (normalizeText(draftData.media_kind) || "media") : blockType;
    const assetLabel = blockType === "image"
        ? "Image"
        : blockType === "video"
            ? "Video"
            : blockType === "audio"
                ? "Audio"
                : "Media";

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "Optional heading",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    if (blockType === "media") {
        grid.appendChild(
            createField({
                label: "Media Kind",
                hint: "Use this when saving a direct URL without choosing a reusable asset.",
                control: createInputControl({
                    type: "select",
                    value: draftData.media_kind,
                    disabled: busy,
                    options: [
                        { value: "", label: "Infer from asset or URL" },
                        ...MEDIA_ASSET_TYPES.map((value) => ({
                            value,
                            label: value.charAt(0).toUpperCase() + value.slice(1),
                        })),
                    ],
                    onInput(nextValue) {
                        draftData.media_kind = nextValue;
                        clearFieldErrors(state, "media_asset_id", "src", "embed_url");
                    },
                }),
            })
        );
    }

    if (blockType !== "audio") {
        grid.appendChild(
            createField({
                label: "Alt Text",
                hint: blockType === "video"
                    ? "Used for image-style fallbacks or poster-style previews."
                    : "Used when a direct image source is rendered.",
                error: getFieldError(state, "alt_text"),
                control: createInputControl({
                    value: draftData.alt_text,
                    placeholder: "Describe the media",
                    disabled: busy,
                    onInput(nextValue) {
                        draftData.alt_text = nextValue;
                        clearFieldErrors(state, "alt_text");
                    },
                }),
            })
        );
    }

    grid.appendChild(
        createField({
            label: blockType === "image"
                ? "Optional Direct Image URL"
                : blockType === "video"
                    ? "Optional Video File URL"
                    : blockType === "audio"
                        ? "Optional Audio URL"
                        : "Optional Direct Source URL",
            hint: blockType === "image"
                ? "Leave this empty if you selected or imported a reusable image above."
                : "Optional fallback when no reusable media asset is selected.",
            wide: true,
            error: getFieldError(state, "src"),
            control: createInputControl({
                value: draftData.src,
                placeholder: "https://example.com/media-file",
                disabled: busy,
                onInput(nextValue) {
                    draftData.src = nextValue;
                    clearFieldErrors(state, "src", "media_asset_id", "embed_url");
                },
            }),
        })
    );

    if (blockType === "video" || blockType === "media") {
        grid.appendChild(
            createField({
                label: "Embed URL",
                hint: "Useful for YouTube, Vimeo, or other embeddable media.",
                wide: true,
                error: getFieldError(state, "embed_url"),
                control: createInputControl({
                    value: draftData.embed_url,
                    placeholder: "https://www.youtube.com/embed/...",
                    disabled: busy,
                    onInput(nextValue) {
                        draftData.embed_url = nextValue;
                        clearFieldErrors(state, "embed_url", "media_asset_id", "src");
                    },
                }),
            }),
        );
    }

    if (blockType === "video" || blockType === "audio" || blockType === "media") {
        grid.appendChild(
            createField({
                label: "Provider",
                hint: "Optional provider hint like youtube, vimeo, spotify, or local.",
                error: getFieldError(state, "provider"),
                control: createInputControl({
                    value: draftData.provider,
                    placeholder: "youtube",
                    disabled: busy,
                    onInput(nextValue) {
                        draftData.provider = nextValue;
                        clearFieldErrors(state, "provider");
                    },
                }),
            })
        );
    }

    grid.appendChild(
        createField({
            label: "Caption",
            wide: true,
            error: getFieldError(state, "caption"),
            control: createInputControl({
                type: "textarea",
                rows: 4,
                value: draftData.caption,
                placeholder: "Optional supporting caption",
                disabled: busy,
                onInput(nextValue) {
                    draftData.caption = nextValue;
                    clearFieldErrors(state, "caption");
                },
            }),
        })
    );

    const pickerSection = document.createElement("div");
    pickerSection.className = "admin-content-block-picker-stack";
    pickerSection.appendChild(
        createAssetPicker({
            title: blockType === "image" ? "Image Library" : "Reusable Media Assets",
            hint: blockType === "image"
                ? "Select or import one reusable image. Direct image URL below is optional."
                : "Pick from shared media_assets records, or leave this blank and use the direct URL fields below.",
            state,
            blockType,
            selectedIds: selectedAssetId ? [selectedAssetId] : [],
            disabled: busy,
            onSelect(assetId) {
                draftData.media_asset_id = draftData.media_asset_id === assetId ? "" : assetId;
                state.mediaAssets.error = "";
                state.mediaAssets.notice = draftData.media_asset_id
                    ? `${assetLabel} asset selected: ${draftData.media_asset_id}`
                    : "";
                clearFieldErrors(state, "media_asset_id", "src", "embed_url");
                rerender();
            },
            onImportComplete(importedAssets) {
                const compatibleAsset = selectCompatibleImportedAsset(blockType, importedAssets);

                if (compatibleAsset?.id) {
                    draftData.media_asset_id = compatibleAsset.id;
                    state.assetSearchQuery = "";
                    state.mediaAssets.error = "";
                    state.mediaAssets.notice = `Imported ${assetLabel.toLowerCase()} selected: ${compatibleAsset.id} (${compatibleAsset.asset_type}) -> ${compatibleAsset.src}`;
                    clearFieldErrors(state, "media_asset_id", "src", "embed_url");
                    return;
                }

                state.mediaAssets.notice = "";
                state.mediaAssets.error = `Imported files did not produce a compatible ${assetLabel.toLowerCase()} asset for this block.`;
            },
            rerender,
        })
    );

    const previewGroup = document.createElement("div");
    previewGroup.className = "admin-content-block-preview-group";
    previewGroup.appendChild(createAssetPreview(selectedAsset));
    previewGroup.appendChild(createDirectSourcePreview(directPreviewType, draftData));
    pickerSection.appendChild(previewGroup);

    const clearButton = createButton("Clear Selected Asset", "admin-inline-bar-link", {
        disabled: busy || !selectedAssetId,
        onClick() {
            draftData.media_asset_id = "";
            clearFieldErrors(state, "media_asset_id");
            rerender();
        },
    });
    pickerSection.appendChild(clearButton);

    grid.appendChild(
        createField({
            label: blockType === "image" ? "Selected Image" : "Media Picker",
            wide: true,
            error: getFieldError(state, "media_asset_id"),
            control: pickerSection,
        })
    );
}

function appendGalleryFields(grid, state, busy, rerender) {
    const draftData = state.draft.data;
    const selectedAssetIds = cloneArray(draftData.media_asset_ids);
    const selectedAssets = getSelectedAssets(state, selectedAssetIds);

    grid.appendChild(
        createField({
            label: "Title",
            control: createInputControl({
                value: draftData.title,
                placeholder: "Optional gallery heading",
                disabled: busy,
                onInput(nextValue) {
                    draftData.title = nextValue;
                },
            }),
        })
    );

    grid.appendChild(
        createField({
            label: "Caption",
            wide: true,
            error: getFieldError(state, "caption"),
            control: createInputControl({
                type: "textarea",
                rows: 4,
                value: draftData.caption,
                placeholder: "Optional gallery caption",
                disabled: busy,
                onInput(nextValue) {
                    draftData.caption = nextValue;
                    clearFieldErrors(state, "caption");
                },
            }),
        })
    );

    const pickerStack = document.createElement("div");
    pickerStack.className = "admin-content-block-picker-stack";
    pickerStack.appendChild(
        createAssetPicker({
            title: "Gallery Assets",
            hint: "Galleries use reusable media assets only. Clicking an asset toggles it in or out of the saved gallery.",
            state,
            blockType: "gallery",
            selectedIds: selectedAssetIds,
            disabled: busy,
            onSelect(assetId) {
                const nextIds = new Set(cloneArray(draftData.media_asset_ids));
                if (nextIds.has(assetId)) {
                    nextIds.delete(assetId);
                } else {
                    nextIds.add(assetId);
                }
                draftData.media_asset_ids = Array.from(nextIds);
                clearFieldErrors(state, "media_asset_ids");
                rerender();
            },
            onImportComplete(importedAssets) {
                const nextIds = new Set(cloneArray(draftData.media_asset_ids));
                importedAssets.forEach((asset) => {
                    if (asset?.id) {
                        nextIds.add(asset.id);
                    }
                });
                draftData.media_asset_ids = Array.from(nextIds);
                clearFieldErrors(state, "media_asset_ids");
            },
            rerender,
        })
    );

    const selectedWrap = document.createElement("div");
    selectedWrap.className = "admin-content-block-gallery-selection";

    if (!selectedAssets.length) {
        const empty = document.createElement("p");
        empty.className = "admin-editor-field-hint";
        empty.textContent = "No gallery assets selected yet.";
        selectedWrap.appendChild(empty);
    } else {
        selectedAssets.forEach((asset) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "admin-content-block-selection-chip";
            chip.disabled = busy;
            chip.textContent = getAssetLabel(asset);
            chip.addEventListener("click", () => {
                draftData.media_asset_ids = cloneArray(draftData.media_asset_ids).filter((id) => id !== asset.id);
                clearFieldErrors(state, "media_asset_ids");
                rerender();
            });
            selectedWrap.appendChild(chip);
        });
    }

    pickerStack.appendChild(selectedWrap);

    grid.appendChild(
        createField({
            label: "Selected Media",
            wide: true,
            error: getFieldError(state, "media_asset_ids"),
            control: pickerStack,
        })
    );
}

function appendBlockSpecificFields(grid, state, busy, rerender) {
    switch (state.draft.block_type) {
        case "rich_text":
        case "commentary":
            appendTextFields(grid, state, busy, state.draft.block_type);
            return;
        case "image":
        case "video":
        case "media":
        case "audio":
            appendMediaFields(grid, state, busy, state.draft.block_type, rerender);
            return;
        case "quote":
            appendQuoteFields(grid, state, busy);
            return;
        case "gallery":
            appendGalleryFields(grid, state, busy, rerender);
            return;
        case "cta":
            appendCtaFields(grid, state, busy);
            return;
        case "related_entities":
        case "stat_grid":
            appendStructuredJsonFields(grid, state, busy, state.draft.block_type);
            return;
        case "hero":
            appendHeroFields(grid, state, busy);
            return;
        default:
            appendTextFields(grid, state, busy, "rich_text");
    }
}

export function createContentBlockDraftFromRecord(record = {}) {
    return createDraft(record.block_type || "rich_text", {
        variant: record.variant,
        status: record.status,
        visibility: record.visibility,
        is_published: record.is_published,
        data: record.data,
    });
}

export function createEmptyContentBlockDraft(blockType = "rich_text") {
    return createDraft(blockType);
}

export function getContentBlockSummary(block) {
    const typeLabel = getContentBlockTypeLabel(block?.block_type);
    const data = cloneObject(block?.data);

    switch (block?.block_type) {
        case "rich_text":
        case "commentary":
        case "image":
        case "video":
        case "media":
        case "audio":
        case "gallery":
        case "cta":
        case "hero":
            return normalizeText(data.title) || `${typeLabel} block`;
        case "quote":
            return normalizeText(data.quote).slice(0, 80) || `${typeLabel} block`;
        case "related_entities":
            return normalizeText(data.title) || `${Array.isArray(data.items) ? data.items.length : 0} related item(s)`;
        case "stat_grid":
            return normalizeText(data.title) || `${Array.isArray(data.items) ? data.items.length : 0} stat item(s)`;
        default:
            return `${typeLabel} block`;
    }
}

export function getContentBlockTypeLabel(blockType = "") {
    return CONTENT_BLOCK_TYPE_OPTIONS.find((option) => option.value === blockType)?.label
        || String(blockType || "Content Block").replaceAll("_", " ");
}

export function createContentBlockForm({
    draft,
    busy = false,
    submitLabel = "Save Block",
    externalErrorMessage = "",
    onCancel = null,
    onError = null,
    onSubmit = null,
    onTypeChange = null,
} = {}) {
    const api = createAdminApi();
    const state = {
        api,
        draft: createDraft(draft?.block_type || "rich_text", draft),
        rawJson: createRawJsonState(draft || {}),
        assetFilter: getDefaultAssetFilter(draft?.block_type || "rich_text"),
        assetSearchQuery: "",
        errorMessage: "",
        externalErrorMessage: normalizeText(externalErrorMessage),
        dismissedExternalError: false,
        fieldErrors: {},
        mediaAssets: {
            loading: true,
            importing: false,
            error: "",
            notice: "",
            records: [],
        },
    };

    const root = document.createElement("div");
    root.className = "admin-content-block-form";

    function render() {
        root.replaceChildren();

        const visibleErrorMessage = normalizeText(state.errorMessage)
            || (!state.dismissedExternalError ? normalizeText(state.externalErrorMessage) : "");
        if (visibleErrorMessage) {
            const banner = document.createElement("div");
            banner.className = "admin-content-block-error-banner";

            const title = document.createElement("strong");
            title.textContent = "Block could not be saved";

            const copy = document.createElement("p");
            copy.className = "admin-editor-subtitle";
            copy.textContent = visibleErrorMessage;

            banner.append(title, copy);
            root.appendChild(banner);
        }

        const metaSection = createSection(
            "Block Setup",
            "This stays within the unified content_blocks system. Save once and the shared public/admin renderer will use the same block payload."
        );

        const metaGrid = document.createElement("div");
        metaGrid.className = "admin-editor-grid admin-explanation-form-grid";
        appendTopLevelFields(metaGrid, state, busy, onTypeChange);
        metaSection.appendChild(metaGrid);
        root.appendChild(metaSection);

        const bodySection = createSection(
            `${getContentBlockTypeLabel(state.draft.block_type)} Fields`,
            "These fields are specific to the selected block type and save directly into content_blocks.data."
        );
        const bodyGrid = document.createElement("div");
        bodyGrid.className = "admin-editor-grid admin-explanation-form-grid";
        appendBlockSpecificFields(bodyGrid, state, busy, render);
        bodySection.appendChild(bodyGrid);
        root.appendChild(bodySection);

        const footer = document.createElement("div");
        footer.className = "admin-editor-footer";

        footer.appendChild(
            createButton("Cancel", "admin-inline-bar-link", {
                disabled: busy,
                onClick() {
                    onCancel?.();
                },
            })
        );

        footer.appendChild(
            createButton(submitLabel, "admin-inline-bar-link is-primary", {
                type: "button",
                disabled: busy,
                async onClick() {
                    state.dismissedExternalError = true;
                    state.errorMessage = "";
                    state.fieldErrors = {};
                    try {
                        const payload = buildPayload(state);
                        await Promise.resolve(onSubmit?.(payload));
                    } catch (error) {
                        state.errorMessage = error.message || "Unable to save this content block.";
                        state.fieldErrors = error.fieldErrors || {};
                        onError?.(state.errorMessage);
                        render();
                    }
                },
            })
        );

        root.appendChild(footer);
    }

    render();

    loadMediaAssets(api)
        .then((records) => {
            state.mediaAssets = {
                loading: false,
                importing: false,
                error: "",
                notice: "",
                records: sortMediaAssets(Array.isArray(records) ? records : []),
            };
            render();
        })
        .catch((error) => {
            state.mediaAssets = {
                loading: false,
                importing: false,
                error: error.message || "Unable to load media assets.",
                notice: "",
                records: [],
            };
            render();
        });

    return root;
}
