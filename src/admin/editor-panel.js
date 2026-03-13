import { hasPermission } from "../permissions/access.js";
import { createAdminApi } from "./api.js";
import {
    getContentEntityConfig,
    getContentEntityFields,
} from "./content-config.js";
import {
    getContentRecord,
    listContentRecords,
} from "./content-state.js";

function isTextAreaField(field) {
    return field.type === "textarea";
}

function isSelectField(field) {
    return field.type === "select" || field.type === "select-from-state";
}

function getRecordLabel(entity, record) {
    const config = getContentEntityConfig(entity);
    return config?.getRecordLabel?.(record) || config?.label || "Record";
}

function getPanelTitle(state) {
    const config = getContentEntityConfig(state.entity);
    if (!config) {
        return "Inline Editor";
    }

    if (state.mode === "create") {
        return config.createActionLabel || `New ${config.label}`;
    }

    return `${config.editActionLabel || `Edit ${config.label}`}: ${getRecordLabel(state.entity, state.record)}`;
}

function getPanelSubtitle(state) {
    if (state.fieldScope === "explanations") {
        return "This explanation view writes back to the current verse record without creating a separate explanations table.";
    }

    if (state.mode === "create") {
        return "Create a new record inline, save through the existing CRUD API, and refresh the current shared page.";
    }

    return "Edit the current record inline, save through the existing CRUD API, and refresh the current shared page.";
}

function getFieldValue(field, values) {
    const rawValue = values?.[field.name];

    if (field.type === "checkbox") {
        return Boolean(rawValue);
    }

    return rawValue == null ? "" : rawValue;
}

function getFieldOptions(field, context) {
    if (field.type === "select") {
        return field.options || [];
    }

    if (field.type !== "select-from-state") {
        return [];
    }

    return listContentRecords(field.source).filter((record) => {
        if (typeof field.optionFilter === "function") {
            return field.optionFilter(record, context) !== false;
        }

        return true;
    });
}

function getOptionLabel(field, option) {
    if (typeof field.optionLabel === "function") {
        return field.optionLabel(option);
    }

    if (typeof field.optionLabel === "string" && option?.[field.optionLabel] != null) {
        return String(option[field.optionLabel]);
    }

    return String(option?.label ?? option?.title ?? option?.name ?? option?.id ?? "");
}

function getOptionValue(field, option) {
    if (typeof field.optionValue === "function") {
        return field.optionValue(option);
    }

    if (typeof field.optionValue === "string" && option?.[field.optionValue] != null) {
        return String(option[field.optionValue]);
    }

    return String(option?.value ?? option?.id ?? "");
}

function serializeValue(field, input) {
    if (!(input instanceof HTMLElement)) {
        return undefined;
    }

    if (field.type === "checkbox") {
        return Boolean(input.checked);
    }

    if (field.type === "number") {
        const rawValue = "value" in input ? String(input.value || "").trim() : "";
        return rawValue ? Number.parseInt(rawValue, 10) : null;
    }

    if (isSelectField(field) || field.type === "text" || isTextAreaField(field)) {
        const rawValue = "value" in input ? String(input.value || "").trim() : "";
        return rawValue || null;
    }

    return undefined;
}

function shouldDisableField(field, permissionContext, loading) {
    if (loading) {
        return true;
    }

    if (!field.permissionKey) {
        return false;
    }

    return !hasPermission(permissionContext, field.permissionKey);
}

function getFieldHint(field, permissionContext) {
    if (field.permissionKey && !hasPermission(permissionContext, field.permissionKey)) {
        return field.description || "You do not have permission to edit this field.";
    }

    return field.description || "";
}

function createFieldElement(field, values, context, permissionContext, loading) {
    const wrapper = document.createElement("label");
    wrapper.className = "admin-editor-field";

    const label = document.createElement("span");
    label.className = "admin-editor-field-label";
    label.textContent = field.label;

    const controlWrap = document.createElement("span");
    controlWrap.className = "admin-editor-field-control";

    let input;
    if (isTextAreaField(field)) {
        input = document.createElement("textarea");
        input.rows = 4;
    } else if (isSelectField(field)) {
        input = document.createElement("select");
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = `Select ${field.label}`;
        input.appendChild(placeholder);

        getFieldOptions(field, context).forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = getOptionValue(field, option);
            optionElement.textContent = getOptionLabel(field, option);
            input.appendChild(optionElement);
        });
    } else {
        input = document.createElement("input");
        input.type = field.type === "number" ? "number" : "text";
    }

    input.name = field.name;
    input.className = "admin-editor-input";
    input.disabled = shouldDisableField(field, permissionContext, loading);

    if (field.required === true && field.type !== "checkbox") {
        input.required = true;
    }

    if (field.type === "number" && Number.isInteger(field.min)) {
        input.min = String(field.min);
    }

    if (field.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.name = field.name;
        input.className = "admin-editor-checkbox";
        input.checked = Boolean(getFieldValue(field, values));
        input.disabled = shouldDisableField(field, permissionContext, loading);
        controlWrap.classList.add("is-checkbox");
    } else if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
        input.value = String(getFieldValue(field, values));
    }

    const hint = getFieldHint(field, permissionContext);

    controlWrap.appendChild(input);
    wrapper.append(label, controlWrap);

    if (hint) {
        const hintElement = document.createElement("span");
        hintElement.className = "admin-editor-field-hint";
        hintElement.textContent = hint;
        wrapper.appendChild(hintElement);
    }

    return wrapper;
}

export function createAdminEditorPanel({
    host,
    getPermissionContext,
    getPageContext,
    onStatusChange,
}) {
    const api = createAdminApi();
    const state = {
        entity: "",
        mode: "create",
        recordId: "",
        record: null,
        values: null,
        fieldScope: "default",
        isOpen: false,
        loading: false,
        saving: false,
        deleting: false,
        message: "",
        tone: "muted",
        openContext: null,
        refreshTimerId: null,
        allowDelete: true,
    };

    const panel = document.createElement("section");
    panel.className = "admin-editor-panel";
    panel.setAttribute("data-admin-editor-panel", "");
    panel.hidden = true;
    host.appendChild(panel);

    function clearRefreshTimer() {
        if (state.refreshTimerId) {
            window.clearTimeout(state.refreshTimerId);
            state.refreshTimerId = null;
        }
    }

    function setMessage(message, tone = "muted") {
        state.message = message ? String(message) : "";
        state.tone = tone || "muted";
    }

    function buildHelpers() {
        return {
            listRecords: listContentRecords,
            getRecord: getContentRecord,
        };
    }

    function render() {
        if (!state.isOpen) {
            panel.hidden = true;
            panel.replaceChildren();
            return;
        }

        panel.hidden = false;
        panel.replaceChildren();

        const permissionContext = getPermissionContext?.() || null;
        const config = getContentEntityConfig(state.entity);
        const card = document.createElement("div");
        card.className = "admin-editor-card";

        const header = document.createElement("div");
        header.className = "admin-editor-header";

        const copy = document.createElement("div");
        copy.className = "admin-editor-copy";

        const eyebrow = document.createElement("p");
        eyebrow.className = "admin-inline-bar-label";
        eyebrow.textContent = state.mode === "create" ? "Create Record" : "Edit Record";

        const title = document.createElement("h2");
        title.className = "admin-editor-title";
        title.textContent = getPanelTitle(state);

        const subtitle = document.createElement("p");
        subtitle.className = "admin-editor-subtitle";
        subtitle.textContent = getPanelSubtitle(state);

        copy.append(eyebrow, title, subtitle);

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "admin-inline-bar-link";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => {
            close();
        });

        header.append(copy, closeButton);
        card.appendChild(header);

        const message = document.createElement("p");
        message.className = `admin-editor-message is-${state.tone}`;
        message.textContent = state.message || "Fields marked required must be completed before saving.";
        card.appendChild(message);

        if (state.loading || !config || !state.values) {
            const loading = document.createElement("div");
            loading.className = "admin-editor-loading";
            loading.textContent = "Loading editor...";
            card.appendChild(loading);
            panel.appendChild(card);
            return;
        }

        const fields = getContentEntityFields(state.entity, state.fieldScope);
        const form = document.createElement("form");
        form.className = "admin-editor-form";
        form.noValidate = false;

        const grid = document.createElement("div");
        grid.className = "admin-editor-grid";

        fields.forEach((field) => {
            grid.appendChild(
                createFieldElement(
                    field,
                    state.values,
                    state.openContext,
                    permissionContext,
                    state.saving || state.deleting
                )
            );
        });

        const footer = document.createElement("div");
        footer.className = "admin-editor-footer";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "admin-inline-bar-link";
        cancelButton.disabled = state.saving || state.deleting;
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", () => close());

        footer.appendChild(cancelButton);

        if (
            state.mode === "edit"
            && state.allowDelete !== false
            && hasPermission(permissionContext, config.deletePermissionKey || "content.delete")
        ) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "admin-inline-bar-link admin-editor-delete";
            deleteButton.disabled = state.saving || state.deleting;
            deleteButton.textContent = state.deleting ? "Deleting..." : (config.deleteActionLabel || `Delete ${config.label}`);
            deleteButton.addEventListener("click", async () => {
                const confirmed = window.confirm(`Delete ${getRecordLabel(state.entity, state.record)}? This action cannot be undone.`);
                if (!confirmed) {
                    return;
                }

                state.deleting = true;
                setMessage(`Deleting ${getRecordLabel(state.entity, state.record)}...`);
                onStatusChange?.(`Deleting ${getRecordLabel(state.entity, state.record)}...`);
                render();

                try {
                    await api.deleteRecord(state.entity, state.recordId);
                    setMessage(`${getRecordLabel(state.entity, state.record)} deleted. Refreshing...`, "success");
                    onStatusChange?.(`${getRecordLabel(state.entity, state.record)} deleted. Refreshing...`, "success");
                    render();
                    clearRefreshTimer();
                    state.refreshTimerId = window.setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } catch (error) {
                    setMessage(error.message || `Unable to delete ${config.label}.`, "error");
                    onStatusChange?.(error.message || `Unable to delete ${config.label}.`, "error");
                    state.deleting = false;
                    render();
                }
            });
            footer.appendChild(deleteButton);
        }

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.className = "admin-inline-bar-link is-primary";
        submitButton.disabled = state.saving || state.deleting;
        submitButton.textContent = state.saving
            ? (state.mode === "create" ? "Creating..." : "Saving...")
            : (state.mode === "create" ? `Create ${config.label}` : `Save ${config.label}`);
        footer.appendChild(submitButton);

        form.append(grid, footer);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!form.reportValidity()) {
                setMessage("Please complete the required fields before saving.", "error");
                onStatusChange?.("Please complete the required fields before saving.", "error");
                render();
                return;
            }

            const payload = {};
            fields.forEach((field) => {
                const input = form.elements.namedItem(field.name);
                payload[field.name] = serializeValue(field, input);
            });

            state.saving = true;
            setMessage(state.mode === "create" ? `Creating ${config.label.toLowerCase()}...` : `Saving ${config.label.toLowerCase()}...`);
            onStatusChange?.(state.message);
            render();

            try {
                const result = state.mode === "create"
                    ? await api.createRecord(state.entity, payload)
                    : await api.updateRecord(state.entity, state.recordId, payload);

                state.record = result;
                setMessage(`${getRecordLabel(state.entity, result)} saved. Refreshing...`, "success");
                onStatusChange?.(`${getRecordLabel(state.entity, result)} saved. Refreshing...`, "success");
                render();
                clearRefreshTimer();
                state.refreshTimerId = window.setTimeout(() => {
                    window.location.reload();
                }, 500);
            } catch (error) {
                state.saving = false;
                setMessage(error.message || `Unable to save ${config.label.toLowerCase()}.`, "error");
                onStatusChange?.(error.message || `Unable to save ${config.label.toLowerCase()}.`, "error");
                render();
            }
        });

        card.appendChild(form);
        panel.appendChild(card);
    }

    async function loadEditorState({ entity, mode, recordId = "", fieldScope = "default", allowDelete = true }) {
        const config = getContentEntityConfig(entity);
        if (!config) {
            throw new Error(`Unsupported admin entity "${entity}".`);
        }

        state.entity = entity;
        state.mode = mode;
        state.recordId = recordId;
        state.fieldScope = fieldScope || "default";
        state.allowDelete = allowDelete !== false;
        state.isOpen = true;
        state.loading = true;
        state.saving = false;
        state.deleting = false;
        state.record = null;
        state.values = null;
        state.openContext = getPageContext?.() || null;
        setMessage(mode === "create" ? `Preparing ${config.label.toLowerCase()} form...` : `Loading ${config.label.toLowerCase()}...`);
        render();

        try {
            if (mode === "edit") {
                const record = await api.getRecord(entity, recordId);
                state.record = record;
                state.values = { ...record };
            } else {
                const defaults = config.getCreateDefaults?.(state.openContext, buildHelpers()) || {};
                state.record = null;
                state.values = { ...defaults };
            }

            state.loading = false;
            setMessage(
                mode === "create"
                    ? `Creating a new ${config.label.toLowerCase()}.`
                    : `Editing ${getRecordLabel(entity, state.record)}.`
            );
            render();
        } catch (error) {
            setMessage(error.message || `Unable to open the ${config.label.toLowerCase()} editor.`, "error");
            state.loading = false;
            render();
        }
    }

    function close() {
        clearRefreshTimer();
        state.isOpen = false;
        state.loading = false;
        state.saving = false;
        state.deleting = false;
        state.values = null;
        state.record = null;
        state.entity = "";
        state.recordId = "";
        state.fieldScope = "default";
        state.openContext = null;
        state.allowDelete = true;
        setMessage("");
        render();
    }

    return {
        async open(options) {
            await loadEditorState(options);
        },
        close,
        rerender() {
            render();
        },
        isOpen() {
            return state.isOpen;
        },
        getElement() {
            return panel;
        },
    };
}
