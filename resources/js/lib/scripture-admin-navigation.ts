export const SCRIPTURE_ADMIN_TARGET_PARAM = 'admin_target' as const;
export const SCRIPTURE_ADMIN_ITEM_PARAM = 'admin_item' as const;

const SCRIPTURE_ADMIN_SECTION_IDS = {
    identity: 'identity-editor',
    details: 'details-editor',
    meta: 'meta-editor',
    translations: 'translations-editor',
    commentaries: 'commentaries-editor',
    content_blocks: 'content-blocks',
    media_slots: 'media-slots',
    canonical_browse: 'canonical-browse',
} as const;

type ScriptureAdminSectionIds = typeof SCRIPTURE_ADMIN_SECTION_IDS;

export type ScriptureAdminTargetSection = keyof ScriptureAdminSectionIds;
export type ScriptureAdminTargetItemType = 'block';

export type ScriptureAdminTargetItem = {
    type: ScriptureAdminTargetItemType;
    id: string | number;
};

export type ScriptureAdminNavigationTarget = {
    section: ScriptureAdminTargetSection;
    item?: ScriptureAdminTargetItem | null;
};

const BASE_URL = 'http://localhost';

function normalizeUrl(href: string): URL {
    return new URL(href, BASE_URL);
}

function isScriptureAdminTargetSection(
    value: string | null,
): value is ScriptureAdminTargetSection {
    return value !== null && value in SCRIPTURE_ADMIN_SECTION_IDS;
}

function parseItemParam(value: string | null): ScriptureAdminTargetItem | null {
    if (!value) {
        return null;
    }

    const [type, id] = value.split(':', 2);

    if (type !== 'block' || !id) {
        return null;
    }

    return {
        type,
        id,
    };
}

function formatHref(url: URL): string {
    const query = url.searchParams.toString();

    return `${url.pathname}${query ? `?${query}` : ''}`;
}

export function buildScriptureAdminTargetHref(
    href: string,
    target: ScriptureAdminNavigationTarget,
): string {
    const url = normalizeUrl(href);
    url.hash = '';
    url.searchParams.set(SCRIPTURE_ADMIN_TARGET_PARAM, target.section);

    if (target.item) {
        url.searchParams.set(
            SCRIPTURE_ADMIN_ITEM_PARAM,
            `${target.item.type}:${target.item.id}`,
        );
    } else {
        url.searchParams.delete(SCRIPTURE_ADMIN_ITEM_PARAM);
    }

    return formatHref(url);
}

export function buildScriptureAdminSectionHref(
    href: string,
    section: ScriptureAdminTargetSection,
): string {
    return buildScriptureAdminTargetHref(href, {
        section,
    });
}

export function buildScriptureAdminBlockHref(
    href: string,
    blockId: string | number,
): string {
    return buildScriptureAdminTargetHref(href, {
        section: 'content_blocks',
        item: {
            type: 'block',
            id: blockId,
        },
    });
}

export function parseScriptureAdminNavigationTarget(
    urlString: string,
): ScriptureAdminNavigationTarget | null {
    const url = normalizeUrl(urlString);
    const section = url.searchParams.get(SCRIPTURE_ADMIN_TARGET_PARAM);

    if (!isScriptureAdminTargetSection(section)) {
        return null;
    }

    const item = parseItemParam(url.searchParams.get(SCRIPTURE_ADMIN_ITEM_PARAM));

    return {
        section,
        item,
    };
}

export function clearScriptureAdminNavigationParams(urlString: string): string {
    const url = normalizeUrl(urlString);
    url.searchParams.delete(SCRIPTURE_ADMIN_TARGET_PARAM);
    url.searchParams.delete(SCRIPTURE_ADMIN_ITEM_PARAM);

    return formatHref(url);
}

export function getScriptureAdminSectionElementId(
    section: ScriptureAdminTargetSection,
): string {
    return SCRIPTURE_ADMIN_SECTION_IDS[section];
}

export function getScriptureAdminTargetItemId(
    type: ScriptureAdminTargetItemType,
    id: string | number,
): string {
    switch (type) {
        case 'block':
            return `block-${id}`;
    }
}

export function getScriptureAdminTargetItemAttribute(
    type: ScriptureAdminTargetItemType,
    id: string | number,
): string {
    return `${type}:${id}`;
}

export function getScriptureAdminTargetSelectors(
    target: ScriptureAdminNavigationTarget,
): string[] {
    const selectors: string[] = [];

    if (target.item) {
        selectors.push(
            `[data-admin-target-item="${getScriptureAdminTargetItemAttribute(target.item.type, target.item.id)}"]`,
            `#${getScriptureAdminTargetItemId(target.item.type, target.item.id)}`,
        );
    }

    selectors.push(
        `[data-admin-target-section="${target.section}"]`,
        `#${getScriptureAdminSectionElementId(target.section)}`,
    );

    return selectors;
}
