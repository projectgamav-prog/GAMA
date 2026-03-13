import {
    EXPLANATION_BLOCK_TYPES,
    normalizeExplanationBlockData,
} from "../content/explanations/schema.js";

const BLOCK_TYPE_LABELS = Object.freeze({
    text_section: "Text Section",
    video: "Video",
    image: "Image",
    divider: "Divider",
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

function createCheckboxField({ name, labelText, checked = false, disabled = false, hintText = "" }) {
    const wrapper = document.createElement("label");
    wrapper.className = "admin-editor-field";

    const label = document.createElement("span");
    label.className = "admin-editor-field-label";
    label.textContent = labelText;

    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control is-checkbox";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = name;
    input.className = "admin-editor-checkbox";
    input.checked = Boolean(checked);
    input.disabled = disabled;
    controlWrap.appendChild(input);

    wrapper.append(label, controlWrap);

    if (hintText) {
        const hint = document.createElement("span");
        hint.className = "admin-editor-field-hint";
        hint.textContent = hintText;
        wrapper.appendChild(hint);
    }

    return wrapper;
}

function appendField(container, field) {
    const wrapper = createFieldWrapper(field.label, field.hint);
    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control";
    controlWrap.appendChild(
        createTextControl({
            name: field.name,
            value: field.value,
            rows: field.rows || 0,
            required: field.required === true,
            disabled: field.disabled === true,
            placeholder: field.placeholder || "",
        })
    );
    wrapper.appendChild(controlWrap);
    container.appendChild(wrapper);
}

function buildTypeSpecificFields(draft, disabled) {
    switch (draft.type) {
        case "text_section":
            return [
                { name: "title", label: "Title", value: draft.title, disabled },
                { name: "body", label: "Body", value: draft.body, rows: 6, required: true, disabled },
            ];
        case "video":
            return [
                { name: "title", label: "Title", value: draft.title, disabled },
                { name: "url", label: "Video URL", value: draft.url, disabled, hint: "Optional if you provide an embed URL." },
                { name: "embed_url", label: "Embed URL", value: draft.embed_url, disabled, hint: "Optional if you provide a video URL." },
                { name: "description", label: "Description", value: draft.description, rows: 4, disabled },
            ];
        case "image":
            return [
                { name: "src", label: "Image Source", value: draft.src, required: true, disabled, hint: "Use a site-relative path or full URL." },
                { name: "alt", label: "Alt Text", value: draft.alt, disabled },
                { name: "caption", label: "Caption", value: draft.caption, rows: 4, disabled },
            ];
        case "divider":
            return [
                { name: "style", label: "Style", value: draft.style, disabled, hint: "Optional variant label for future styling hooks." },
            ];
        default:
            return [];
    }
}

function buildDataJsonFromForm(type, formData) {
    switch (type) {
        case "text_section":
            return {
                title: trimText(formData.get("title")),
                body: trimText(formData.get("body")),
            };
        case "video":
            return {
                title: trimText(formData.get("title")),
                url: trimText(formData.get("url")),
                embed_url: trimText(formData.get("embed_url")),
                description: trimText(formData.get("description")),
            };
        case "image":
            return {
                src: trimText(formData.get("src")),
                alt: trimText(formData.get("alt")),
                caption: trimText(formData.get("caption")),
            };
        case "divider":
            return {
                style: trimText(formData.get("style")),
            };
        default:
            return {};
    }
}

function normalizeType(type) {
    return String(type || "").trim().toLowerCase();
}

export function getExplanationBlockTypeOptions() {
    return EXPLANATION_BLOCK_TYPES.map((type) => Object.freeze({
        value: type,
        label: getBlockTypeLabel(type),
    }));
}

export function getExplanationBlockTypeLabel(type) {
    return getBlockTypeLabel(type);
}

export function createEmptyExplanationBlockDraft(type = "text_section") {
    return Object.freeze({
        type: normalizeType(type) || "text_section",
        is_visible: true,
        title: "",
        body: "",
        url: "",
        embed_url: "",
        description: "",
        src: "",
        alt: "",
        caption: "",
        style: "",
    });
}

export function createExplanationBlockDraftFromRecord(block) {
    const base = createEmptyExplanationBlockDraft(block?.type || "text_section");
    return Object.freeze({
        ...base,
        type: normalizeType(block?.type) || base.type,
        is_visible: block?.is_visible !== false,
        title: block?.data_json?.title || "",
        body: block?.data_json?.body || "",
        url: block?.data_json?.url || "",
        embed_url: block?.data_json?.embed_url || "",
        description: block?.data_json?.description || "",
        src: block?.data_json?.src || "",
        alt: block?.data_json?.alt || "",
        caption: block?.data_json?.caption || "",
        style: block?.data_json?.style || "",
    });
}

export function getExplanationBlockSummary(block) {
    const data = block?.data_json || {};

    switch (block?.type) {
        case "text_section":
            return truncateText(data.title || data.body || "Text section");
        case "video":
            return truncateText(data.title || data.description || data.embed_url || data.url || "Video block");
        case "image":
            return truncateText(data.caption || data.alt || data.src || "Image block");
        case "divider":
            return data.style ? `Divider (${data.style})` : "Divider";
        default:
            return "Explanation block";
    }
}

export function readExplanationBlockFormPayload(form) {
    const formData = new FormData(form);
    const type = normalizeType(formData.get("type"));
    const isVisible = formData.get("is_visible") === "on";
    const dataJson = normalizeExplanationBlockData(
        type,
        buildDataJsonFromForm(type, formData),
        "Explanation block"
    );

    return Object.freeze({
        type,
        is_visible: isVisible,
        data_json: dataJson,
    });
}

export function createExplanationBlockForm({
    draft,
    busy = false,
    submitLabel = "Save Block",
    cancelLabel = "Cancel",
    onSubmit,
    onCancel,
    onTypeChange,
    onError,
}) {
    const safeDraft = draft || createEmptyExplanationBlockDraft();
    const form = document.createElement("form");
    form.className = "admin-editor-form admin-explanation-form";
    form.noValidate = false;

    const grid = document.createElement("div");
    grid.className = "admin-editor-grid admin-explanation-form-grid";

    const typeField = createFieldWrapper("Block Type");
    const typeControl = document.createElement("span");
    typeControl.className = "admin-editor-field-control";
    const typeSelect = document.createElement("select");
    typeSelect.name = "type";
    typeSelect.className = "admin-editor-input";
    typeSelect.disabled = busy;

    getExplanationBlockTypeOptions().forEach((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        element.selected = option.value === safeDraft.type;
        typeSelect.appendChild(element);
    });
    typeSelect.addEventListener("change", () => {
        onTypeChange?.(normalizeType(typeSelect.value));
    });
    typeControl.appendChild(typeSelect);
    typeField.appendChild(typeControl);
    grid.appendChild(typeField);

    buildTypeSpecificFields(safeDraft, busy).forEach((field) => {
        appendField(grid, field);
    });

    grid.appendChild(
        createCheckboxField({
            name: "is_visible",
            labelText: "Visible on public pages",
            checked: safeDraft.is_visible !== false,
            disabled: busy,
        })
    );

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
            await onSubmit?.(readExplanationBlockFormPayload(form));
        } catch (error) {
            onError?.(error?.message || "Unable to save this explanation block.");
        }
    });

    return form;
}
