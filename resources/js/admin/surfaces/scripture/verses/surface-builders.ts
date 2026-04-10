import {
    VERSE_COMMENTARIES_SURFACE_KEY,
    VERSE_IDENTITY_SURFACE_KEY,
    VERSE_INTRO_SURFACE_KEY,
    VERSE_META_SURFACE_KEY,
    VERSE_ROW_ACTIONS_SURFACE_KEY,
    VERSE_TRANSLATIONS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createInlineEditorSurface,
} from '@/admin/surfaces/core/surface-builders';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    ScriptureContentBlock,
    ScriptureVerseCommentariesAdmin,
    ScriptureVerse,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
    ScriptureVerseTranslationsAdmin,
} from '@/types';
import type {
    IdentityContractMetadata,
    IntroContractMetadata,
    VerseCommentariesContractMetadata,
    EntityActionsContractMetadata,
    StructuredMetaContractMetadata,
    VerseTranslationsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';

type VerseIdentitySurfaceArgs = {
    verse: ScriptureVerse;
    updateHref: string;
    fullEditHref: string;
    regionKey?: string;
    returnToHref?: string | null;
    editorDescription?: string | null;
    semanticContext?: 'page' | 'row' | null;
};

type VerseIntroSurfaceArgs = {
    verse: ScriptureVerse;
    verseTitle: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    destroyHref?: string | null;
    storeHref: string | null;
    fullEditHref: string;
};

type VerseRowActionsSurfaceArgs = {
    verse: ScriptureVerse;
    verseTitle: string;
    parentLabel: string | null;
    createHref?: string | null;
    destroyHref?: string | null;
    fullEditHref?: string | null;
};

type VerseMetaSurfaceArgs = {
    verse: ScriptureVerse;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    updateHref: string;
    fullEditHref: string;
};

type VerseTranslationsSurfaceArgs = {
    verse: ScriptureVerse;
    verseTitle: string;
    admin: ScriptureVerseTranslationsAdmin;
    fullEditHref?: string | null;
};

type VerseCommentariesSurfaceArgs = {
    verse: ScriptureVerse;
    verseTitle: string;
    admin: ScriptureVerseCommentariesAdmin;
    fullEditHref?: string | null;
};

export function createVerseIdentitySurface({
    verse,
    updateHref,
    fullEditHref,
    regionKey = 'verse_identity',
    returnToHref = null,
    editorDescription = null,
    semanticContext = 'page',
}: VerseIdentitySurfaceArgs): AdminSurfaceContract<IdentityContractMetadata<ScriptureVerse>> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_IDENTITY_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'verse',
        entityId: verse.id,
        regionKey,
        capabilities: ['edit', 'full_edit'],
        metadata: {
            entityRecord: verse,
            updateHref,
            fullEditHref,
            returnToHref,
            editorDescription,
            semanticContext,
        },
    });
}

export function createVerseIntroSurface({
    verse,
    verseTitle,
    block,
    blockTypes,
    updateHref,
    destroyHref = null,
    storeHref,
    fullEditHref,
}: VerseIntroSurfaceArgs): AdminSurfaceContract<IntroContractMetadata<ScriptureVerse>> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_INTRO_SURFACE_KEY,
        contractKey: 'intro',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'page_intro',
        capabilities:
            updateHref !== null
                ? ['edit', 'full_edit']
                : ['add_block', 'full_edit'],
        metadata: {
            introKind: 'registered_block',
            entityRecord: verse,
            entityLabel: verseTitle,
            textValue: null,
            block,
            blockTypes,
            updateHref,
            destroyHref,
            storeHref,
            fullEditHref,
        },
    });
}

export function createVerseRowActionsSurface({
    verse,
    verseTitle,
    parentLabel,
    createHref = null,
    destroyHref = null,
    fullEditHref = null,
}: VerseRowActionsSurfaceArgs): AdminSurfaceContract<EntityActionsContractMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_ROW_ACTIONS_SURFACE_KEY,
        contractKey: 'entity_actions',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_row_actions',
        capabilities: [
            ...(createHref ? (['create_row'] as const) : []),
            ...(destroyHref ? (['delete'] as const) : []),
            ...(fullEditHref ? (['full_edit'] as const) : []),
        ],
        presentation: {
            placement: 'inline',
            variant: 'compact',
        },
        metadata: {
            entityLabel: verseTitle,
            parentLabel,
            createHref,
            destroyHref,
            fullEditHref,
        },
    });
}

export function createVerseMetaSurface({
    verse,
    verseMeta,
    characters,
    updateHref,
    fullEditHref,
}: VerseMetaSurfaceArgs): AdminSurfaceContract<
    StructuredMetaContractMetadata<
        ScriptureVerseMeta,
        { characters: ScriptureVerseCharacterAssignment[]; verse: ScriptureVerse }
    >
> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_META_SURFACE_KEY,
        contractKey: 'structured_meta',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'verse_notes',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            value: verseMeta,
            options: {
                characters,
                verse,
            },
            updateHref,
            fullEditHref,
        },
    });
}

export function createVerseTranslationsSurface({
    verse,
    verseTitle,
    admin,
    fullEditHref = null,
}: VerseTranslationsSurfaceArgs): AdminSurfaceContract<VerseTranslationsContractMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_TRANSLATIONS_SURFACE_KEY,
        contractKey: 'relation_rows',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'translations',
        capabilities: ['edit', 'full_edit', 'manage_relations'],
        metadata: {
            relationKey: 'translations',
            relationLabel: 'Translations',
            entityLabel: verseTitle,
            storeHref: admin.store_href,
            fullEditHref,
            rows: admin.rows,
            sourceOptions: admin.sources,
            nextSortOrder: admin.next_sort_order,
            fields: admin.fields,
        },
    });
}

export function createVerseCommentariesSurface({
    verse,
    verseTitle,
    admin,
    fullEditHref = null,
}: VerseCommentariesSurfaceArgs): AdminSurfaceContract<VerseCommentariesContractMetadata> {
    return createInlineEditorSurface({
        surfaceKey: VERSE_COMMENTARIES_SURFACE_KEY,
        contractKey: 'relation_rows',
        entity: 'verse',
        entityId: verse.id,
        regionKey: 'commentaries',
        capabilities: ['edit', 'full_edit', 'manage_relations'],
        metadata: {
            relationKey: 'commentaries',
            relationLabel: 'Commentaries',
            entityLabel: verseTitle,
            storeHref: admin.store_href,
            fullEditHref,
            rows: admin.rows,
            sourceOptions: admin.sources,
            nextSortOrder: admin.next_sort_order,
            fields: admin.fields,
        },
    });
}

