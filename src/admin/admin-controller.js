import {
    BOOKS_QUERY_API,
} from "../content/books/queries.js";
import { createAdminApi } from "./api.js";
import { getContentEntityConfig } from "./content-config.js";
import { canAccessAdmin, canEditEntity, hasPermission } from "../permissions/access.js";

const DEFAULT_BOOK_SLUG = "bhagavad-gita";
const DEFAULT_COVER_IMAGE = "/assets/images/lotus_background_4k.png";
const FLASH_KEY = "admin:flash-message";

const api = createAdminApi();
const EDITABLE_PAGE_CONFIG = Object.freeze({
    books: Object.freeze({
        editableEntities: Object.freeze(["books"]),
        createActions: Object.freeze([
            Object.freeze({ selector: ".book-list-section", entity: "books", label: "Create Book" }),
        ]),
    }),
    chapters: Object.freeze({
        editableEntities: Object.freeze(["books", "chapters"]),
        createActions: Object.freeze([
            Object.freeze({ selector: ".chapter-list-section", entity: "book_sections", label: "Create Book Section" }),
            Object.freeze({ selector: ".chapter-list-section", entity: "chapters", label: "Create Chapter" }),
        ]),
    }),
    verses: Object.freeze({
        editableEntities: Object.freeze(["chapters", "verses"]),
        createActions: Object.freeze([
            Object.freeze({ selector: ".verse-context", entity: "chapter_sections", label: "Create Chapter Section" }),
            Object.freeze({ selector: ".verse-context", entity: "verses", label: "Create Verse" }),
        ]),
    }),
});

const state = {
    queryApi: BOOKS_QUERY_API,
    pageKind: getPageKind(),
    pageContext: null,
    permissionContext: null,
    editMode: false,
    selectedElement: null,
};

const ui = {};

if (window.APP_CONTEXT?.mode === "admin") {
    initializeAdminController();
}

async function initializeAdminController() {
    await window.authStorage?.ready;
    state.permissionContext = window.authStorage?.getPermissionContext?.() || null;
    state.pageContext = getPageContext();
    document.body.classList.add("admin-mode-page");
    createDockAndDrawer();
    bindDockEvents();
    consumeFlashMessage();
    renderDock();
    window.requestAnimationFrame(() => {
        attachEditableUi();
    });
    window.addEventListener(window.authStorage?.AUTH_STATE_EVENT || "auth:statechange", () => {
        state.permissionContext = window.authStorage?.getPermissionContext?.() || null;
        if (!canAccessAdmin(state.permissionContext) && state.editMode) {
            setEditMode(false);
        }
        renderDock();
        attachEditableUi();
    });
}

function getPageKind() {
    return document.body?.dataset.pageId || "other";
}

function renderDockNav() {
    const routes = window.APP_ROUTES;
    return `
        <a href="${routes.home}">Home</a>
        <a href="${routes.books.index}">Books</a>
        <a href="${routes.chapters.index}">Chapters</a>
        <a href="${routes.verses.index}">Verses</a>
        <a href="${routes.characters.index}">Characters</a>
        <a href="${routes.topics.index}">Topics</a>
        <a href="${routes.places.index}">Places</a>
        <a href="${routes.profile.index}">Profile</a>
    `;
}

function canManagePermissionsUi() {
    return hasPermission(state.permissionContext, "permissions.manage")
        || hasPermission(state.permissionContext, "users.manage");
}

function getCurrentBook() {
    if (state.pageKind !== "chapters" && state.pageKind !== "verses") {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedBookSlug = params.get("book") || DEFAULT_BOOK_SLUG;
    return state.queryApi.getBookBySlug(requestedBookSlug)
        || state.queryApi.getBookBySlug(DEFAULT_BOOK_SLUG)
        || state.queryApi.books[0]
        || null;
}

function getCurrentChapter(book) {
    if (state.pageKind !== "verses" || !book) {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedChapterSlug = params.get("chapter");
    return (requestedChapterSlug ? state.queryApi.getChapterBySlug(book.slug, requestedChapterSlug) : null)
        || state.queryApi.getFirstChapterForBook(book.id)
        || null;
}

function resolveSourceBook(book) {
    if (!book) {
        return state.queryApi.books.find((record) => record.book_type === "source") || null;
    }

    if (book.book_type === "source") {
        return book;
    }

    const firstSection = state.queryApi.listBookSections(book.id)[0];
    return state.queryApi.books.find((record) => record.id === firstSection?.source_book_id)
        || state.queryApi.books.find((record) => record.book_type === "source")
        || null;
}

function getPageContext() {
    const firstBook = state.queryApi.books[0] || null;
    const book = getCurrentBook();
    const sourceBook = resolveSourceBook(book) || state.queryApi.books.find((record) => record.book_type === "source") || firstBook;
    const chapter = getCurrentChapter(book);

    return {
        firstBook,
        book,
        sourceBook,
        chapter,
    };
}

function isEditablePage() {
    return Boolean(EDITABLE_PAGE_CONFIG[state.pageKind]);
}

function hasEditableSurface() {
    const editableEntities = EDITABLE_PAGE_CONFIG[state.pageKind]?.editableEntities || [];
    return editableEntities.some((entity) => canEditEntity(state.permissionContext, entity));
}

function getDockState() {
    const currentUser = window.authStorage?.getCurrentUser?.();

    if (!currentUser) {
        return {
            copy: "This admin route is the same public page, but you need to sign in before any authoring tools can attach to it.",
            status: "Sign in from the shared header to unlock admin controls.",
            statusTone: "muted",
            editToggleDisabled: true,
        };
    }

    if (!canAccessAdmin(state.permissionContext)) {
        return {
            copy: "Your session can view this shared page in admin mode, but no authoring permissions are assigned to this account yet.",
            status: "Read-only admin view for this account.",
            statusTone: "muted",
            editToggleDisabled: true,
        };
    }

    if (!isEditablePage()) {
        return {
            copy: "This shared route already runs in admin mode, but its content model is still read-only in v1. The public UI remains the source of truth.",
            status: "Read-only shared page.",
            statusTone: "muted",
            editToggleDisabled: true,
        };
    }

    if (!hasEditableSurface()) {
        return {
            copy: "You can access admin, but this page does not expose any editable entities for your current permission set.",
            status: "No editable controls available on this page for your role.",
            statusTone: "muted",
            editToggleDisabled: true,
        };
    }

    return {
        copy: state.editMode
            ? "Edit Mode is on. The page stays visually identical to public while contextual admin controls attach to the rendered content."
            : "Edit Mode is off. You are viewing the exact public page with only this floating admin dock added.",
        status: ui.status?.textContent.trim()
            ? ""
            : "Shared page is live. Turn on Edit Mode to attach authoring controls.",
        statusTone: "muted",
        editToggleDisabled: false,
    };
}

function createDockAndDrawer() {
    const dock = document.createElement("section");
    dock.className = "admin-dock";
    dock.innerHTML = `
        <div class="admin-dock-inner">
            <p class="admin-dock-eyebrow">Admin Mode</p>
            <h2 class="admin-dock-title">Shared Public UI + Authoring Layer</h2>
            <div class="admin-dock-nav">
                ${renderDockNav()}
                ${canManagePermissionsUi()
                    ? `<a href="${window.APP_ROUTES?.admin?.permissions || "/admin/permissions/index.html"}">Permissions</a>`
                    : ""}
            </div>
            <p class="admin-dock-copy" id="adminDockCopy"></p>
            <div class="admin-dock-controls">
                <label class="admin-switch">
                    <input id="adminEditToggle" type="checkbox" aria-label="Toggle edit mode">
                    <span>Edit Mode</span>
                </label>
                <button class="admin-dock-close" id="adminCloseDrawerButton" type="button" hidden>Close Editor</button>
            </div>
            <p class="admin-dock-status is-muted" id="adminDockStatus"></p>
        </div>
    `;

    const backdrop = document.createElement("div");
    backdrop.className = "admin-drawer-backdrop";
    backdrop.hidden = true;

    const drawer = document.createElement("aside");
    drawer.className = "admin-drawer";
    drawer.setAttribute("aria-hidden", "true");

    document.body.append(dock, backdrop, drawer);

    ui.dock = dock;
    ui.copy = dock.querySelector("#adminDockCopy");
    ui.status = dock.querySelector("#adminDockStatus");
    ui.editToggle = dock.querySelector("#adminEditToggle");
    ui.closeDrawerButton = dock.querySelector("#adminCloseDrawerButton");
    ui.backdrop = backdrop;
    ui.drawer = drawer;
}

function bindDockEvents() {
    ui.editToggle?.addEventListener("change", () => {
        setEditMode(Boolean(ui.editToggle.checked));
    });

    ui.closeDrawerButton?.addEventListener("click", () => {
        closeDrawer();
    });

    ui.backdrop?.addEventListener("click", () => {
        closeDrawer();
    });
}

function consumeFlashMessage() {
    const raw = window.sessionStorage.getItem(FLASH_KEY);
    if (!raw) return;

    window.sessionStorage.removeItem(FLASH_KEY);

    try {
        const payload = JSON.parse(raw);
        setDockStatus(payload.message, payload.tone || "success");
    } catch {
        setDockStatus(raw, "success");
    }
}

function renderDock() {
    const dockState = getDockState();
    ui.editToggle.checked = state.editMode;
    ui.editToggle.disabled = dockState.editToggleDisabled;
    ui.copy.textContent = dockState.copy;

    if (dockState.status) {
        setDockStatus(dockState.status, dockState.statusTone);
    }
}

function setDockStatus(message, tone = "muted") {
    ui.status.textContent = message;
    ui.status.className = `admin-dock-status is-${tone}`;
}

function setEditMode(nextState) {
    if (nextState && (!canAccessAdmin(state.permissionContext) || !hasEditableSurface())) {
        setDockStatus("This page is read-only for your current account.", "muted");
        ui.editToggle.checked = false;
        return;
    }

    state.editMode = nextState;
    document.body.classList.toggle("admin-edit-mode", nextState);

    if (!nextState) {
        closeDrawer();
    } else {
        setDockStatus("Edit Mode is on. Select a rendered content block or use a contextual create action.", "muted");
    }

    renderDock();
}

function attachEditableUi() {
    resetAdminAttachments();

    if (!canAccessAdmin(state.permissionContext) || !hasEditableSurface()) {
        return;
    }

    attachNodeControls();
    attachCreateActions();
}

function resetAdminAttachments() {
    document.querySelectorAll(".admin-node-controls").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll(".admin-context-actions").forEach((element) => {
        element.remove();
    });
    document.querySelectorAll(".admin-managed-node").forEach((element) => {
        if (element instanceof HTMLElement) {
            element.classList.remove("admin-managed-node", "is-admin-selected", "admin-context-target");
        }
    });
    clearSelection();
}

function getEntityRecords(entity) {
    const config = getContentEntityConfig(entity);
    if (!config) return [];
    return state.queryApi[config.collectionKey] || [];
}

function findRecord(entity, recordId) {
    return getEntityRecords(entity).find((record) => record.id === recordId) || null;
}

function attachNodeControls() {
    document.querySelectorAll("[data-admin-entity][data-admin-id]").forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        const entity = node.dataset.adminEntity || "";
        const config = getContentEntityConfig(entity);
        if (!config || !canEditEntity(state.permissionContext, entity)) return;
        if (!findRecord(entity, node.dataset.adminId || "")) return;
        if (node.querySelector(":scope > .admin-node-controls")) return;

        node.classList.add("admin-managed-node");

        const controls = document.createElement("div");
        controls.className = "admin-node-controls";
        controls.innerHTML = `<button class="admin-action-btn" type="button">Edit ${config.label}</button>`;

        controls.querySelector("button")?.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openDrawer({
                entity,
                mode: "edit",
                recordId: node.dataset.adminId || "",
                anchor: node,
            });
        });

        node.appendChild(controls);
    });
}

function canCreateEntity(entity) {
    return canEditEntity(state.permissionContext, entity) && hasPermission(state.permissionContext, "content.create");
}

function attachCreateActions() {
    (EDITABLE_PAGE_CONFIG[state.pageKind]?.createActions || []).forEach((action) => {
        if (!canCreateEntity(action.entity)) return;
        const target = document.querySelector(action.selector);
        if (!(target instanceof HTMLElement)) return;
        target.classList.add("admin-managed-node", "admin-context-target");

        let actionBar = target.querySelector(":scope > .admin-context-actions");
        if (!(actionBar instanceof HTMLElement)) {
            actionBar = document.createElement("div");
            actionBar.className = "admin-context-actions";
            target.appendChild(actionBar);
        }

        if (actionBar.querySelector(`[data-admin-create-entity="${action.entity}"]`)) return;

        const button = document.createElement("button");
        button.className = "admin-action-btn is-primary";
        button.type = "button";
        button.dataset.adminCreateEntity = action.entity;
        button.textContent = action.label;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            openDrawer({
                entity: action.entity,
                mode: "create",
                defaults: buildContextualDefaults(action.entity),
                anchor: target,
            });
        });

        actionBar.appendChild(button);
    });
}

function buildContextualDefaults(entity) {
    const book = state.pageContext.book || state.pageContext.firstBook;
    const sourceBook = state.pageContext.sourceBook || state.pageContext.firstBook;
    const chapter = state.pageContext.chapter || state.queryApi.chapters[0] || null;

    if (entity === "books") {
        return {
            book_type: "collection",
            ui_order: getNextUiOrder(state.queryApi.books),
            is_published: false,
            cover_image: DEFAULT_COVER_IMAGE,
            theme_key: "",
            meta_title: "",
            meta_description: "",
            insight_title: "",
            insight_media: "",
            insight_caption: "",
        };
    }

    if (entity === "book_sections") {
        const bookSections = state.queryApi.bookSections.filter((record) => record.book_id === book?.id);
        const nextChapterNumber = getNextChapterNumber(sourceBook?.id);
        return {
            book_id: book?.id || state.pageContext.firstBook?.id || "",
            source_book_id: sourceBook?.id || state.pageContext.firstBook?.id || "",
            ui_order: getNextUiOrder(bookSections),
            chapter_start: nextChapterNumber,
            chapter_end: nextChapterNumber,
            cover_image: book?.cover_image || DEFAULT_COVER_IMAGE,
            badge_text: "",
            insight_title: "",
            insight_media: "",
            insight_caption: "",
            summary: "",
        };
    }

    if (entity === "chapters") {
        const nextChapterNumber = getNextChapterNumber(sourceBook?.id);
        return {
            source_book_id: sourceBook?.id || state.pageContext.firstBook?.id || "",
            chapter_number: nextChapterNumber,
            ui_order: nextChapterNumber,
            hero_image: DEFAULT_COVER_IMAGE,
            audio_intro_url: "",
            insight_title: "",
            insight_media: "",
            insight_caption: "",
            summary: "",
        };
    }

    if (entity === "chapter_sections") {
        const chapterSections = state.queryApi.chapterSections.filter((record) => record.chapter_id === chapter?.id);
        const nextSectionNumber = getNextSectionNumber(chapter?.id);
        const nextVerseNumber = getNextVerseNumber(chapter?.id);
        return {
            chapter_id: chapter?.id || state.queryApi.chapters[0]?.id || "",
            section_number: nextSectionNumber,
            ui_order: getNextUiOrder(chapterSections),
            verse_start: nextVerseNumber,
            verse_end: nextVerseNumber,
            card_variant: "",
            accent_key: "",
            insight_title: "",
            insight_media: "",
            insight_caption: "",
            summary: "",
        };
    }

    const nextVerseNumber = getNextVerseNumber(chapter?.id);
    return {
        chapter_id: chapter?.id || state.queryApi.chapters[0]?.id || "",
        verse_number: nextVerseNumber,
        slug: `verse-${nextVerseNumber}`,
        sanskrit_text: "",
        transliteration_text: "",
        english_text: "",
        hindi_text: "",
        audio_url: "",
        is_featured: false,
        insight_title: "",
        insight_media: "",
        insight_caption: "",
    };
}

function openDrawer({ entity, mode, recordId = "", defaults = {}, anchor = null }) {
    if (!state.editMode) {
        setDockStatus("Turn on Edit Mode to open authoring controls.", "muted");
        return;
    }

    const config = getContentEntityConfig(entity);
    if (!config || !canEditEntity(state.permissionContext, entity)) return;

    const existingRecord = mode === "edit" ? findRecord(entity, recordId) : null;
    const draft = mode === "create"
        ? { ...buildEmptyRecord(config.fields), ...defaults }
        : { ...buildEmptyRecord(config.fields), ...(existingRecord || {}) };

    if (mode === "edit" && !existingRecord) {
        setDockStatus(`Unable to find that ${config.label.toLowerCase()} in the current content snapshot.`, "error");
        return;
    }

    selectElement(anchor);

    const sortState = mode === "edit" && config.sortable ? getSortState(entity, existingRecord) : null;
    const canDelete = mode === "edit" && hasPermission(state.permissionContext, "content.delete");

    ui.drawer.innerHTML = `
        <header class="admin-drawer-header">
            <p class="admin-drawer-eyebrow">${mode === "create" ? "Create Content" : "Edit Content"}</p>
            <h2>${mode === "create" ? `Create ${config.label}` : `Edit ${config.label}`}</h2>
            <p class="admin-drawer-copy">${getDrawerDescription(entity, mode, draft)}</p>
        </header>
        <p class="admin-drawer-status" id="adminDrawerStatus" hidden></p>
        <form class="admin-editor-form" id="adminEditorForm" data-entity="${entity}" data-mode="${mode}" data-record-id="${recordId}">
            ${renderFieldGroups(config.fields, draft)}
        </form>
        <footer class="admin-drawer-footer">
            <div class="admin-drawer-secondary">
                ${sortState?.canMoveUp ? '<button class="admin-btn admin-btn-secondary" type="button" id="adminMoveUpButton">Move Up</button>' : ""}
                ${sortState?.canMoveDown ? '<button class="admin-btn admin-btn-secondary" type="button" id="adminMoveDownButton">Move Down</button>' : ""}
                <button class="admin-btn admin-btn-secondary" type="button" id="adminCancelButton">Cancel</button>
                ${canDelete ? '<button class="admin-btn admin-btn-danger" type="button" id="adminDeleteButton">Delete</button>' : ""}
            </div>
            <div class="admin-drawer-actions">
                <button class="admin-btn admin-btn-primary" type="submit" form="adminEditorForm">${mode === "create" ? `Save ${config.label}` : "Save Changes"}</button>
            </div>
        </footer>
    `;

    const drawerStatus = ui.drawer.querySelector("#adminDrawerStatus");
    const form = ui.drawer.querySelector("#adminEditorForm");

    form?.addEventListener("submit", handleSubmit);
    ui.drawer.querySelector("#adminCancelButton")?.addEventListener("click", closeDrawer);
    ui.drawer.querySelector("#adminDeleteButton")?.addEventListener("click", () => {
        handleDelete(entity, recordId, drawerStatus);
    });
    ui.drawer.querySelector("#adminMoveUpButton")?.addEventListener("click", () => {
        handleReorder(entity, recordId, -1, drawerStatus);
    });
    ui.drawer.querySelector("#adminMoveDownButton")?.addEventListener("click", () => {
        handleReorder(entity, recordId, 1, drawerStatus);
    });

    ui.closeDrawerButton.hidden = false;
    ui.backdrop.hidden = false;
    ui.backdrop.classList.add("is-open");
    ui.drawer.classList.add("is-open");
    ui.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-drawer-open");
}

function closeDrawer() {
    ui.drawer.classList.remove("is-open");
    ui.drawer.setAttribute("aria-hidden", "true");
    ui.backdrop.classList.remove("is-open");
    ui.backdrop.hidden = true;
    ui.closeDrawerButton.hidden = true;
    document.body.classList.remove("admin-drawer-open");
    ui.drawer.innerHTML = "";
    clearSelection();
}

function selectElement(element) {
    clearSelection();
    if (!(element instanceof HTMLElement)) return;
    state.selectedElement = element;
    if (state.editMode) {
        element.classList.add("is-admin-selected");
    }
}

function clearSelection() {
    if (state.selectedElement instanceof HTMLElement) {
        state.selectedElement.classList.remove("is-admin-selected");
    }
    state.selectedElement = null;
}

function renderFieldGroups(fields, record) {
    const groups = [];
    for (let index = 0; index < fields.length; index += 2) {
        groups.push(fields.slice(index, index + 2));
    }

    return groups.map((group) => `
        <div class="admin-editor-grid">
            ${group.map((field) => createFieldMarkup(field, record[field.name])).join("")}
        </div>
    `).join("");
}

function createFieldMarkup(field, value) {
    const fieldId = `admin-field-${field.name}`;
    const required = field.required ? " required" : "";

    if (field.type === "checkbox") {
        return `
            <label class="admin-editor-checkbox" for="${fieldId}">
                <input id="${fieldId}" name="${field.name}" type="checkbox"${value ? " checked" : ""}>
                <span>${field.label}</span>
            </label>
        `;
    }

    if (field.type === "textarea") {
        return `
            <label class="admin-editor-field" for="${fieldId}">
                <span>${field.label}</span>
                <textarea id="${fieldId}" name="${field.name}"${required}>${escapeHtml(value)}</textarea>
            </label>
        `;
    }

    if (field.type === "select" || field.type === "select-from-state") {
        const options = resolveOptions(field);
        return `
            <label class="admin-editor-field" for="${fieldId}">
                <span>${field.label}</span>
                <select id="${fieldId}" name="${field.name}"${required}>
                    <option value="">Select ${field.label.toLowerCase()}</option>
                    ${options.map((option) => `
                        <option value="${escapeHtml(option.value)}"${String(option.value) === String(value ?? "") ? " selected" : ""}>${escapeHtml(option.label)}</option>
                    `).join("")}
                </select>
            </label>
        `;
    }

    const min = field.min != null ? ` min="${field.min}"` : "";
    return `
        <label class="admin-editor-field" for="${fieldId}">
            <span>${field.label}</span>
            <input id="${fieldId}" name="${field.name}" type="${field.type || "text"}" value="${escapeHtml(value)}"${required}${min}>
        </label>
    `;
}

function resolveOptions(field) {
    if (field.type === "select") {
        return field.options || [];
    }

    const records = sortRecords(field.source, [...(state.queryApi[field.source === "books" ? "books" : "chapters"] || [])]);
    return records.map((record) => ({
        value: record[field.optionValue || "id"],
        label: typeof field.optionLabel === "function"
            ? field.optionLabel(record)
            : record[field.optionLabel || "title"] || record.id,
    }));
}

function sortRecords(sourceKey, records) {
    return records.sort((left, right) => {
        if (sourceKey === "books") {
            return Number(left.ui_order || 0) - Number(right.ui_order || 0);
        }
        if (sourceKey === "chapters") {
            if (left.source_book_id !== right.source_book_id) {
                return String(left.source_book_id).localeCompare(String(right.source_book_id));
            }
            return Number(left.chapter_number || 0) - Number(right.chapter_number || 0);
        }
        return String(left.title || left.id).localeCompare(String(right.title || right.id));
    });
}

function buildEmptyRecord(fields) {
    return fields.reduce((record, field) => {
        record[field.name] = field.type === "checkbox" ? false : "";
        return record;
    }, {});
}

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const entity = form.dataset.entity || "";
    const mode = form.dataset.mode || "edit";
    const recordId = form.dataset.recordId || "";
    const config = getContentEntityConfig(entity);
    const drawerStatus = ui.drawer.querySelector("#adminDrawerStatus");
    if (!config || !(drawerStatus instanceof HTMLElement)) return;

    setDrawerStatus(drawerStatus, "Saving changes...", "muted");

    try {
        const payload = collectPayload(form, config.fields);
        if (mode === "create") {
            await api.createRecord(entity, payload);
            flashAndReload(`${config.label} created successfully.`);
            return;
        }

        await api.updateRecord(entity, recordId, payload);
        flashAndReload(`${config.label} updated successfully.`);
    } catch (error) {
        setDrawerStatus(drawerStatus, error.message, "error");
        setDockStatus(error.message, "error");
    }
}

async function handleDelete(entity, recordId, drawerStatus) {
    const config = getContentEntityConfig(entity);
    if (!config || !recordId || !(drawerStatus instanceof HTMLElement)) return;
    if (!window.confirm(`Delete this ${config.label.toLowerCase()}? This cannot be undone.`)) return;

    setDrawerStatus(drawerStatus, `Deleting ${config.label.toLowerCase()}...`, "muted");

    try {
        await api.deleteRecord(entity, recordId);
        flashAndReload(`${config.label} deleted successfully.`);
    } catch (error) {
        setDrawerStatus(drawerStatus, error.message, "error");
        setDockStatus(error.message, "error");
    }
}

async function handleReorder(entity, recordId, direction, drawerStatus) {
    const config = getContentEntityConfig(entity);
    const record = findRecord(entity, recordId);
    if (!config?.sortable || !record || !(drawerStatus instanceof HTMLElement)) return;

    const sortState = getSortState(entity, record);
    const targetRecord = direction < 0 ? sortState.previousRecord : sortState.nextRecord;
    if (!targetRecord) return;

    setDrawerStatus(drawerStatus, "Updating order...", "muted");

    try {
        await api.updateRecord(entity, record.id, { [config.orderField]: targetRecord[config.orderField] });
        await api.updateRecord(entity, targetRecord.id, { [config.orderField]: record[config.orderField] });
        flashAndReload(`${config.label} order updated.`);
    } catch (error) {
        setDrawerStatus(drawerStatus, error.message, "error");
        setDockStatus(error.message, "error");
    }
}

function getSortState(entity, record) {
    const config = getContentEntityConfig(entity);
    if (!config?.sortable || !config.orderField) return null;

    let siblings = [];
    if (entity === "books") {
        siblings = [...state.queryApi.books];
    } else if (entity === "book_sections") {
        siblings = state.queryApi.bookSections.filter((candidate) => candidate.book_id === record.book_id);
    } else if (entity === "chapter_sections") {
        siblings = state.queryApi.chapterSections.filter((candidate) => candidate.chapter_id === record.chapter_id);
    } else {
        return null;
    }

    siblings.sort((left, right) => Number(left[config.orderField] || 0) - Number(right[config.orderField] || 0));
    const index = siblings.findIndex((candidate) => candidate.id === record.id);
    return {
        canMoveUp: index > 0,
        canMoveDown: index >= 0 && index < siblings.length - 1,
        previousRecord: index > 0 ? siblings[index - 1] : null,
        nextRecord: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
    };
}

function collectPayload(form, fields) {
    const formData = new FormData(form);
    const payload = {};

    fields.forEach((field) => {
        if (field.type === "checkbox") {
            payload[field.name] = form.elements[field.name].checked;
            return;
        }

        const rawValue = formData.get(field.name);
        if (field.type === "number") {
            payload[field.name] = rawValue === "" ? null : Number(rawValue);
            return;
        }

        payload[field.name] = rawValue == null ? "" : String(rawValue).trim();
    });

    return payload;
}

function flashAndReload(message, tone = "success") {
    window.sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, tone }));
    window.location.reload();
}

function setDrawerStatus(element, message, tone = "") {
    element.hidden = !message;
    element.textContent = message || "";
    element.className = `admin-drawer-status${tone ? ` is-${tone}` : ""}`;
}

function getDrawerDescription(entity, mode, record) {
    const config = getContentEntityConfig(entity);
    const displayName = getRecordDisplayName(entity, record);
    if (!config) return "";

    if (mode === "create") {
        return `Create a new ${config.label.toLowerCase()} while keeping the shared public layout intact behind this drawer.`;
    }

    return `Editing ${config.label.toLowerCase()} "${displayName}" from the exact rendered public page.`;
}

function getRecordDisplayName(entity, record) {
    if (!record) return "Untitled";
    if (entity === "books") return record.title || record.slug || record.id || "Untitled";
    if (entity === "book_sections" || entity === "chapter_sections") return record.title || record.id || "Untitled";
    if (entity === "chapters") return record.title || record.slug || record.id || "Untitled";
    if (entity === "verses") return `Verse ${record.verse_number || "?"}`;
    return record.id || "Untitled";
}

function getNextUiOrder(records) {
    if (!records.length) return 1;
    return Math.max(...records.map((record) => Number(record.ui_order || 0))) + 1;
}

function getNextChapterNumber(sourceBookId) {
    const records = state.queryApi.chapters.filter((record) => record.source_book_id === sourceBookId);
    if (!records.length) return 1;
    return Math.max(...records.map((record) => Number(record.chapter_number || 0))) + 1;
}

function getNextSectionNumber(chapterId) {
    const records = state.queryApi.chapterSections.filter((record) => record.chapter_id === chapterId);
    if (!records.length) return 1;
    return Math.max(...records.map((record) => Number(record.section_number || 0))) + 1;
}

function getNextVerseNumber(chapterId) {
    const records = state.queryApi.verses.filter((record) => record.chapter_id === chapterId);
    if (!records.length) return 1;
    return Math.max(...records.map((record) => Number(record.verse_number || 0))) + 1;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
