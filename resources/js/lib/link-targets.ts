import type {
    LinkTarget,
    LinkTargetType,
    RouteTargetKey,
    SharedLinkTargetOptions,
    ScriptureTargetKind,
} from '@/types';

export function createDefaultLinkTarget(
    type: LinkTargetType = 'url',
): LinkTarget {
    return type === 'cms_page'
        ? {
              type,
              value: { slug: null },
              behavior: { new_tab: false },
          }
        : type === 'route'
          ? {
                type,
                value: { key: null },
                behavior: { new_tab: false },
            }
          : type === 'scripture'
            ? {
                  type,
                  value: {
                      kind: null,
                      book_slug: null,
                      book_section_slug: null,
                      chapter_slug: null,
                      chapter_section_slug: null,
                      verse_slug: null,
                      entry_slug: null,
                  },
                  behavior: { new_tab: false },
              }
            : {
                  type: 'url',
                  value: { url: '' },
                  behavior: { new_tab: false },
              };
}

export function normalizeLinkTarget(value: unknown): LinkTarget | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const raw = value as Record<string, unknown>;
    const type = raw.type;

    if (type === 'cms_page') {
        return {
            type,
            value: {
                slug: normalizeString((raw.value as Record<string, unknown> | undefined)?.slug),
            },
            behavior: {
                new_tab: Boolean((raw.behavior as Record<string, unknown> | undefined)?.new_tab),
            },
        };
    }

    if (type === 'route') {
        return {
            type,
            value: {
                key: normalizeString((raw.value as Record<string, unknown> | undefined)?.key) as RouteTargetKey | null,
            },
            behavior: {
                new_tab: Boolean((raw.behavior as Record<string, unknown> | undefined)?.new_tab),
            },
        };
    }

    if (type === 'scripture') {
        const scripturalValue = (raw.value as Record<string, unknown> | undefined) ?? {};

        return {
            type,
            value: {
                kind: normalizeString(scripturalValue.kind) as ScriptureTargetKind | null,
                book_slug: normalizeString(scripturalValue.book_slug),
                book_section_slug: normalizeString(scripturalValue.book_section_slug),
                chapter_slug: normalizeString(scripturalValue.chapter_slug),
                chapter_section_slug: normalizeString(scripturalValue.chapter_section_slug),
                verse_slug: normalizeString(scripturalValue.verse_slug),
                entry_slug: normalizeString(scripturalValue.entry_slug),
            },
            behavior: {
                new_tab: Boolean((raw.behavior as Record<string, unknown> | undefined)?.new_tab),
            },
        };
    }

    if (type === 'url') {
        return {
            type,
            value: {
                url: normalizeString((raw.value as Record<string, unknown> | undefined)?.url),
            },
            behavior: {
                new_tab: Boolean((raw.behavior as Record<string, unknown> | undefined)?.new_tab),
            },
        };
    }

    return null;
}

export function resolveLinkTargetHref(target: LinkTarget | null): string | null {
    if (!target) {
        return null;
    }

    if (target.type === 'url') {
        return target.value.url;
    }

    if (target.type === 'cms_page') {
        return target.value.slug ? `/pages/${target.value.slug}` : null;
    }

    if (target.type === 'route') {
        return resolveRouteTargetHref(target.value.key);
    }

    return resolveScriptureTargetHref(target.value);
}

export function describeLinkTarget(
    target: LinkTarget | null,
    options?: SharedLinkTargetOptions | null,
): string | null {
    if (!target) {
        return null;
    }

    if (target.type === 'url') {
        return target.value.url;
    }

    if (target.type === 'cms_page') {
        if (!target.value.slug) {
            return null;
        }

        const pageTitle = options?.cms_pages.find(
            (page) => page.slug === target.value.slug,
        )?.title;

        return pageTitle
            ? `CMS page: ${pageTitle}`
            : `CMS page: ${target.value.slug}`;
    }

    if (target.type === 'route') {
        if (!target.value.key) {
            return null;
        }

        const routeLabel = options?.route_options[target.value.key] ?? target.value.key;

        return `Internal route: ${routeLabel}`;
    }

    return describeScriptureTarget(target.value, options);
}

export function getLinkTargetNewTab(target: LinkTarget | null): boolean {
    return Boolean(target?.behavior?.new_tab);
}

export function updateLinkTargetType(
    _current: LinkTarget | null,
    type: LinkTargetType,
    options?: SharedLinkTargetOptions | null,
): LinkTarget {
    if (options) {
        return createSuggestedLinkTarget(type, options);
    }

    return createDefaultLinkTarget(type);
}

export function createSuggestedLinkTarget(
    type: LinkTargetType,
    options: SharedLinkTargetOptions,
): LinkTarget {
    if (type === 'cms_page') {
        return {
            type,
            value: {
                slug: options.cms_pages[0]?.slug ?? null,
            },
            behavior: { new_tab: false },
        };
    }

    if (type === 'route') {
        const firstRouteKey = Object.keys(options.route_options)[0] as
            | RouteTargetKey
            | undefined;

        return {
            type,
            value: {
                key: firstRouteKey ?? null,
            },
            behavior: { new_tab: false },
        };
    }

    if (type === 'scripture') {
        return {
            type,
            value: {
                kind: 'book',
                book_slug: options.books[0]?.slug ?? null,
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: null,
            },
            behavior: { new_tab: false },
        };
    }

    return createDefaultLinkTarget(type);
}

export function parseLinkTargetInput(input: string): LinkTarget | null {
    const raw = input.trim();

    if (raw === '') {
        return null;
    }

    if (/^[a-z]+:\/\//i.test(raw) || /^(mailto:|tel:)/i.test(raw)) {
        return {
            type: 'url',
            value: {
                url: raw,
            },
            behavior: { new_tab: /^https?:\/\//i.test(raw) },
        };
    }

    const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
    const pathname = normalizedPath.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';

    if (pathname === '/') {
        return {
            type: 'route',
            value: {
                key: 'home',
            },
            behavior: { new_tab: false },
        };
    }

    if (pathname === '/books') {
        return {
            type: 'route',
            value: {
                key: 'scripture.books.index',
            },
            behavior: { new_tab: false },
        };
    }

    if (pathname === '/dictionary') {
        return {
            type: 'route',
            value: {
                key: 'scripture.dictionary.index',
            },
            behavior: { new_tab: false },
        };
    }

    if (pathname === '/topics') {
        return {
            type: 'route',
            value: {
                key: 'scripture.topics.index',
            },
            behavior: { new_tab: false },
        };
    }

    if (pathname === '/characters') {
        return {
            type: 'route',
            value: {
                key: 'scripture.characters.index',
            },
            behavior: { new_tab: false },
        };
    }

    const cmsMatch = pathname.match(/^\/pages\/([^/]+)$/);

    if (cmsMatch) {
        return {
            type: 'cms_page',
            value: {
                slug: cmsMatch[1],
            },
            behavior: { new_tab: false },
        };
    }

    const verseMatch = pathname.match(
        /^\/books\/([^/]+)\/sections\/([^/]+)\/chapters\/([^/]+)\/sections\/([^/]+)\/verses\/([^/]+)$/,
    );

    if (verseMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'verse',
                book_slug: verseMatch[1],
                book_section_slug: verseMatch[2],
                chapter_slug: verseMatch[3],
                chapter_section_slug: verseMatch[4],
                verse_slug: verseMatch[5],
                entry_slug: null,
            },
            behavior: { new_tab: false },
        };
    }

    const chapterMatch = pathname.match(
        /^\/books\/([^/]+)\/sections\/([^/]+)\/chapters\/([^/]+)$/,
    );

    if (chapterMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'chapter',
                book_slug: chapterMatch[1],
                book_section_slug: chapterMatch[2],
                chapter_slug: chapterMatch[3],
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: null,
            },
            behavior: { new_tab: false },
        };
    }

    const bookMatch = pathname.match(/^\/books\/([^/]+)$/);

    if (bookMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'book',
                book_slug: bookMatch[1],
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: null,
            },
            behavior: { new_tab: false },
        };
    }

    const dictionaryMatch = pathname.match(/^\/dictionary\/([^/]+)$/);

    if (dictionaryMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'dictionary_entry',
                book_slug: null,
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: dictionaryMatch[1],
            },
            behavior: { new_tab: false },
        };
    }

    const topicMatch = pathname.match(/^\/topics\/([^/]+)$/);

    if (topicMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'topic',
                book_slug: null,
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: topicMatch[1],
            },
            behavior: { new_tab: false },
        };
    }

    const characterMatch = pathname.match(/^\/characters\/([^/]+)$/);

    if (characterMatch) {
        return {
            type: 'scripture',
            value: {
                kind: 'character',
                book_slug: null,
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: characterMatch[1],
            },
            behavior: { new_tab: false },
        };
    }

    return null;
}

function resolveRouteTargetHref(routeKey: RouteTargetKey | null): string | null {
    switch (routeKey) {
        case 'home':
            return '/';
        case 'scripture.books.index':
            return '/books';
        case 'scripture.dictionary.index':
            return '/dictionary';
        case 'scripture.topics.index':
            return '/topics';
        case 'scripture.characters.index':
            return '/characters';
        default:
            return null;
    }
}

function resolveScriptureTargetHref(
    value: Extract<LinkTarget, { type: 'scripture' }>['value'],
): string | null {
    switch (value.kind) {
        case 'book':
            return value.book_slug ? `/books/${value.book_slug}` : null;
        case 'chapter':
            return value.book_slug && value.book_section_slug && value.chapter_slug
                ? `/books/${value.book_slug}/sections/${value.book_section_slug}/chapters/${value.chapter_slug}`
                : null;
        case 'verse':
            return value.book_slug &&
                value.book_section_slug &&
                value.chapter_slug &&
                value.chapter_section_slug &&
                value.verse_slug
                ? `/books/${value.book_slug}/sections/${value.book_section_slug}/chapters/${value.chapter_slug}/sections/${value.chapter_section_slug}/verses/${value.verse_slug}`
                : null;
        case 'dictionary_entry':
            return value.entry_slug ? `/dictionary/${value.entry_slug}` : null;
        case 'topic':
            return value.entry_slug ? `/topics/${value.entry_slug}` : null;
        case 'character':
            return value.entry_slug ? `/characters/${value.entry_slug}` : null;
        default:
            return null;
    }
}

function describeScriptureTarget(
    value: Extract<LinkTarget, { type: 'scripture' }>['value'],
    options?: SharedLinkTargetOptions | null,
): string | null {
    switch (value.kind) {
        case 'book': {
            if (!value.book_slug) {
                return null;
            }

            const title = options?.books.find(
                (book) => book.slug === value.book_slug,
            )?.title;

            return title ? `Book: ${title}` : `Book: ${value.book_slug}`;
        }
        case 'chapter':
            return describeStructuredScripturePath(
                'Chapter',
                options?.books.find((book) => book.slug === value.book_slug)?.title ??
                    value.book_slug,
                value.book_section_slug,
                value.chapter_slug,
            );
        case 'verse':
            return describeStructuredScripturePath(
                'Verse',
                options?.books.find((book) => book.slug === value.book_slug)?.title ??
                    value.book_slug,
                value.book_section_slug,
                value.chapter_slug,
                value.chapter_section_slug,
                value.verse_slug,
            );
        case 'dictionary_entry': {
            if (!value.entry_slug) {
                return null;
            }

            const title = options?.dictionary_entries.find(
                (entry) => entry.slug === value.entry_slug,
            )?.title;

            return title
                ? `Dictionary entry: ${title}`
                : `Dictionary entry: ${value.entry_slug}`;
        }
        case 'topic': {
            if (!value.entry_slug) {
                return null;
            }

            const title = options?.topics.find(
                (entry) => entry.slug === value.entry_slug,
            )?.title;

            return title ? `Topic: ${title}` : `Topic: ${value.entry_slug}`;
        }
        case 'character': {
            if (!value.entry_slug) {
                return null;
            }

            const title = options?.characters.find(
                (entry) => entry.slug === value.entry_slug,
            )?.title;

            return title
                ? `Character: ${title}`
                : `Character: ${value.entry_slug}`;
        }
        default:
            return null;
    }
}

function describeStructuredScripturePath(
    label: string,
    ...parts: Array<string | null | undefined>
): string | null {
    const cleaned = parts
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter((part) => part !== '');

    if (cleaned.length === 0) {
        return null;
    }

    return `${label}: ${cleaned.join(' / ')}`;
}

function normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}
