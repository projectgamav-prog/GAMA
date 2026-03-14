import {
    CONTENT_BLOCK_STATUSES,
    CONTENT_BLOCK_TYPES,
    CONTENT_BLOCK_VISIBILITIES,
    normalizeContentBlockData,
} from "../content/schema/cms-schema.js";
import { listContentRecords } from "./content-state.js";

const BODY_BLOCK_TYPES = Object.freeze(CONTENT_BLOCK_TYPES.filter((type) => type !== "hero"));

const BLOCK_TYPE_LABELS = Object.freeze({
    rich_text: "Rich Text",
    video: "Video",
    media: "Media",
    image: "Image",
    quote: "Quote",
    commentary: "Commentary",
    audio: "Audio",
    related_entities: "Related Entities",
    cta: "Call To Action",
    gallery: "Gallery",
    stat_grid: "Stat Grid",
});

function getBlockTypeLabel(type) {
    return BLOCK_TYPE_LABELS[type] || String(type || "Block");
}

function trimText(value) {
    return String(value ?? "").trim();
}

function truncateText(value, maxLength = 120) {
    const normalized = trimText(value);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

function createFieldWrapper(labelText, hintText = "") {
    const wrapper = document.createElement("label");
    wrapper.className = "admin-editor-field";

    const label = document.createElement("span");
    label.className = "admin-editor-field-label";
    label.textContent = labelText;
    wrapper.appendChild(label);

    if (hintText) {
        const hint = document.createElement("span");
        hint.className = "admin-editor-field-hint";
        hint.textContent = hintText;
        wrapper.appendChild(hint);
    }

    return wrapper;
}

function createTextControl({ name, value = "", rows = 0, required = false, disabled = false, placeholder = "" }) {
    const input = rows > 0 ? document.createElement("textarea") : document.createElement("input");
    input.name = name;
    input.className = "admin-editor-input";
    input.disabled = disabled;
    input.required = required;

    if (rows > 0) {
        input.rows = rows;
    } else {
        input.type = "text";
    }

    if (placeholder) {
        input.placeholder = placeholder;
    }

    input.value = String(value ?? "");
    return input;
}

function appendTextField(container, field) {
    const wrapper = createFieldWrapper(field.label, field.hint);
    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control";
    controlWrap.appendChild(createTextControl(field));
    wrapper.appendChild(controlWrap);
    container.appendChild(wrapper);
}

function appendSelectField(container, field) {
    const wrapper = createFieldWrapper(field.label, field.hint);
    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control";

    const select = document.createElement("select");
    select.name = field.name;
    select.className = "admin-editor-input";
    select.disabled = field.disabled === true;

    (field.options || []).forEach((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        element.selected = option.value === field.value;
        select.appendChild(element);
    });

    controlWrap.appendChild(select);
    wrapper.appendChild(controlWrap);
    container.appendChild(wrapper);
}

function getMediaAssetsByType(assetTypes = []) {
    const allowedTypes = new Set(assetTypes);
    return listContentRecords("media_assets").filter((asset) => !allowedTypes.size || allowedTypes.has(asset.asset_type));
}

function createMediaAssetOptions(assetTypes = []) {
    const assets = getMediaAssetsByType(assetTypes);
    const options = [{ value: "", label: "Select media asset" }];

    assets.forEach((asset) => {
        options.push({
            value: asset.id,
            label: asset.title ? `${asset.title} (${asset.asset_type})` : `${asset.id} (${asset.asset_type})`,
        });
    });

    return options;
}

function buildTypeSpecificFields(draft, disabled) {
    switch (draft.block_type) {
        case "rich_text":
        case "commentary":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                { kind: "text", name: "body", label: "Body", value: draft.body, rows: 7, required: true, disabled },
            ];
        case "video":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "select",
                    name: "media_asset_id",
                    label: "Video Asset",
                    value: draft.media_asset_id,
                    options: createMediaAssetOptions(["video", "embed"]),
                    disabled,
                    hint: "Choose a reusable video or embed asset.",
                },
                { kind: "text", name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "media":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "select",
                    name: "media_asset_id",
                    label: "Media Asset",
                    value: draft.media_asset_id,
                    options: createMediaAssetOptions(),
                    disabled,
                },
                { kind: "text", name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "image":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "select",
                    name: "media_asset_id",
                    label: "Image Asset",
                    value: draft.media_asset_id,
                    options: createMediaAssetOptions(["image"]),
                    disabled,
                },
                { kind: "text", name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "audio":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "select",
                    name: "media_asset_id",
                    label: "Audio Asset",
                    value: draft.media_asset_id,
                    options: createMediaAssetOptions(["audio"]),
                    disabled,
                },
                { kind: "text", name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "quote":
            return [
                { kind: "text", name: "quote", label: "Quote", value: draft.quote, rows: 5, required: true, disabled },
                { kind: "text", name: "attribution", label: "Attribution", value: draft.attribution, disabled },
            ];
        case "related_entities":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "text",
                    name: "items_json",
                    label: "Items JSON",
                    value: draft.items_json,
                    rows: 6,
                    disabled,
                    hint: 'Use a JSON array like [{"entity":"characters","id":"character-arjuna","label":"Arjuna"}].',
                },
            ];
        case "cta":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, required: true, disabled },
                { kind: "text", name: "body", label: "Body", value: draft.body, rows: 4, disabled },
                { kind: "text", name: "label", label: "Button Label", value: draft.label, required: true, disabled },
                { kind: "text", name: "href", label: "Button URL", value: draft.href, required: true, disabled },
            ];
        case "gallery":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "text",
                    name: "media_asset_ids",
                    label: "Media Asset IDs",
                    value: draft.media_asset_ids,
                    rows: 6,
                    disabled,
                    hint: "Enter one media asset id per line or as a comma-separated list.",
                },
                { kind: "text", name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "stat_grid":
            return [
                { kind: "text", name: "title", label: "Title", value: draft.title, disabled },
                {
                    kind: "text",
                    name: "items_json",
                    label: "Items JSON",
                    value: draft.items_json,
                    rows: 6,
                    disabled,
                    hint: 'Use a JSON array like [{"label":"Theme","value":"Detachment"}].',
                },
            ];
        default:
            return [];
    }
}

function normalizeType(type) {
    const normalized = String(type || "").trim().toLowerCase();
    return BODY_BLOCK_TYPES.includes(normalized) ? normalized : "rich_text";
}

function getItemsJson(value) {
    const normalized = trimText(value);
    if (!normalized) {
        return [];
    }

    const parsed = JSON.parse(normalized);
    if (!Array.isArray(parsed)) {
        throw new Error("Items JSON must be an array.");
    }

    return parsed;
}

function getMediaAssetIds(value) {
    return String(value ?? "")
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function buildBlockDataFromForm(type, formData) {
    switch (type) {
        case "rich_text":
        case "commentary":
            return {
                title: trimText(formData.get("title")),
                body: trimText(formData.get("body")),
            };
        case "video":
        case "media":
        case "image":
        case "audio":
            return {
                title: trimText(formData.get("title")),
                media_asset_id: trimText(formData.get("media_asset_id")),
                caption: trimText(formData.get("caption")),
            };
        case "quote":
            return {
                quote: trimText(formData.get("quote")),
                attribution: trimText(formData.get("attribution")),
            };
        case "related_entities":
            return {
                title: trimText(formData.get("title")),
                items: getItemsJson(formData.get("items_json")),
            };
        case "cta":
            return {
                title: trimText(formData.get("title")),
                body: trimText(formData.get("body")),
                label: trimText(formData.get("label")),
                href: trimText(formData.get("href")),
            };
        case "gallery":
            return {
                title: trimText(formData.get("title")),
                media_asset_ids: getMediaAssetIds(formData.get("media_asset_ids")),
                caption: trimText(formData.get("caption")),
            };
        case "stat_grid":
            return {
                title: trimText(formData.get("title")),
                items: getItemsJson(formData.get("items_json")),
            };
        default:
            return {};
    }
}

export function getContentBlockTypeOptions() {
    return BODY_BLOCK_TYPES.map((type) => Object.freeze({
        value: type,
        label: getBlockTypeLabel(type),
    }));
}

export function getContentBlockTypeLabel(type) {
    return getBlockTypeLabel(type);
}

export function createEmptyContentBlockDraft(type = "rich_text") {
    return Object.freeze({
        block_type: normalizeType(type),
        variant: "",
        status: "draft",
        visibility: "public",
        title: "",
        body: "",
        media_asset_id: "",
        caption: "",
        quote: "",
        attribution: "",
        items_json: "[]",
        label: "",
        href: "",
        media_asset_ids: "",
    });
}

export function createContentBlockDraftFromRecord(block) {
    const base = createEmptyContentBlockDraft(block?.block_type || "rich_text");
    return Object.freeze({
        ...base,
        block_type: normalizeType(block?.block_type),
        variant: block?.variant || "",
        status: block?.status || "draft",
        visibility: block?.visibility || "public",
        title: block?.data?.title || "",
        body: block?.data?.body || "",
        media_asset_id: block?.data?.media_asset_id || "",
        caption: block?.data?.caption || "",
        quote: block?.data?.quote || "",
        attribution: block?.data?.attribution || "",
        items_json: JSON.stringify(block?.data?.items || [], null, 2),
        label: block?.data?.label || "",
        href: block?.data?.href || "",
        media_asset_ids: Array.isArray(block?.data?.media_asset_ids) ? block.data.media_asset_ids.join("\n") : "",
    });
}

export function getContentBlockSummary(block) {
    switch (block?.block_type) {
        case "rich_text":
        case "commentary":
            return truncateText(block?.data?.title || block?.data?.body || "Text block");
        case "video":
        case "media":
        case "image":
        case "audio":
            return truncateText(block?.data?.title || block?.data?.caption || block?.data?.media_asset_id || "Media block");
        case "quote":
            return truncateText(block?.data?.quote || "Quote block");
        case "related_entities":
            return truncateText(block?.data?.title || `${(block?.data?.items || []).length} related entit${(block?.data?.items || []).length === 1 ? "y" : "ies"}`);
        case "cta":
            return truncateText(block?.data?.title || block?.data?.label || "Call to action");
        case "gallery":
            return truncateText(block?.data?.title || `${(block?.data?.media_asset_ids || []).length} media items`);
        case "stat_grid":
            return truncateText(block?.data?.title || `${(block?.data?.items || []).length} stats`);
        default:
            return "Content block";
    }
}

export function readContentBlockFormPayload(form) {
    const formData = new FormData(form);
    const blockType = normalizeType(formData.get("block_type"));
    const status = CONTENT_BLOCK_STATUSES.includes(String(formData.get("status"))) ? String(formData.get("status")) : "draft";
    const visibility = CONTENT_BLOCK_VISIBILITIES.includes(String(formData.get("visibility"))) ? String(formData.get("visibility")) : "public";
    const variant = trimText(formData.get("variant")) || null;

    return Object.freeze({
        block_type: blockType,
        variant,
        status,
        visibility,
        is_published: status === "published",
        data: normalizeContentBlockData(
            blockType,
            buildBlockDataFromForm(blockType, formData),
            "Content block"
        ),
    });
}

export function createContentBlockForm({
    draft,
    busy = false,
    submitLabel = "Save Block",
    cancelLabel = "Cancel",
    onSubmit,
    onCancel,
    onTypeChange,
    onError,
}) {
    const safeDraft = draft || createEmptyContentBlockDraft();
    const form = document.createElement("form");
    form.className = "admin-editor-form admin-explanation-form";
    form.noValidate = false;

    const grid = document.createElement("div");
    grid.className = "admin-editor-grid admin-explanation-form-grid";

    appendSelectField(grid, {
        name: "block_type",
        label: "Block Type",
        value: safeDraft.block_type,
        options: getContentBlockTypeOptions(),
        disabled: busy,
        hint: "This writes directly to content_blocks for the verse body region.",
    });
    grid.querySelector('select[name="block_type"]')?.addEventListener("change", (event) => {
        onTypeChange?.(normalizeType(event.currentTarget?.value));
    });

    appendSelectField(grid, {
        name: "status",
        label: "Status",
        value: safeDraft.status,
        options: CONTENT_BLOCK_STATUSES.map((value) => ({ value, label: value })),
        disabled: busy,
    });
    appendSelectField(grid, {
        name: "visibility",
        label: "Visibility",
        value: safeDraft.visibility,
        options: CONTENT_BLOCK_VISIBILITIES.map((value) => ({ value, label: value })),
        disabled: busy,
    });
    appendTextField(grid, {
        name: "variant",
        label: "Variant",
        value: safeDraft.variant,
        disabled: busy,
        hint: "Optional styling variant for shared rendering hooks.",
    });

    buildTypeSpecificFields(safeDraft, busy).forEach((field) => {
        if (field.kind === "select") {
            appendSelectField(grid, field);
            return;
        }

        appendTextField(grid, field);
    });

    const footer = document.createElement("div");
    footer.className = "admin-editor-footer";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "admin-inline-bar-link";
    cancelButton.textContent = cancelLabel;
    cancelButton.disabled = busy;
    cancelButton.addEventListener("click", () => onCancel?.());
    footer.appendChild(cancelButton);

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "admin-inline-bar-link is-primary";
    submitButton.disabled = busy;
    submitButton.textContent = submitLabel;
    footer.appendChild(submitButton);

    form.append(grid, footer);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            onError?.("Please complete the required block fields before saving.");
            return;
        }

        try {
            await onSubmit?.(readContentBlockFormPayload(form));
        } catch (error) {
            onError?.(error?.message || "Unable to save this content block.");
        }
    });

    return form;
}
