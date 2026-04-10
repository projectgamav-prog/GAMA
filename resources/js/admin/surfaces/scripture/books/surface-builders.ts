import {
    BOOK_CONTENT_BLOCKS_SURFACE_KEY,
    BOOK_IDENTITY_SURFACE_KEY,
    BOOK_INTRO_SURFACE_KEY,
    BOOK_MEDIA_SLOTS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import {
    createInlineEditorSurface,
} from '@/admin/surfaces/core/surface-builders';
import type {
    AdminSurfaceContract,
    AdminSurfacePresentation,
} from '@/admin/surfaces/core/surface-contracts';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureBook,
    ScriptureCmsPageOption,
} from '@/types';
import type {
    EntityActionsContractMetadata,
    IdentityContractMetadata,
    IntroContractMetadata,
    MediaSlotsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';

type BookIdentitySurfaceArgs = {
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
};

type BookIntroSurfaceArgs = {
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
    overviewPageId: number | null;
    overviewPageOptions: ScriptureCmsPageOption[];
    cmsPagesIndexHref: string | null;
    presentation?: AdminSurfacePresentation | null;
};

type BookActionsSurfaceArgs = {
    book: ScriptureBook;
    destroyHref: string | null;
};

type BookMediaSlotsSurfaceArgs = {
    book: ScriptureBook;
    storeHref: string;
    fullEditHref: string;
    assignments: ScriptureAdminMediaAssignment[];
    availableMedia: ScriptureAdminMediaSummary[];
    nextSortOrder: number;
};

export function createBookIdentitySurface({
    book,
    updateHref,
    fullEditHref,
}: BookIdentitySurfaceArgs): AdminSurfaceContract<IdentityContractMetadata<ScriptureBook>> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_IDENTITY_SURFACE_KEY,
        contractKey: 'identity',
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_identity',
        capabilities: ['edit', 'full_edit'],
        metadata: {
            entityRecord: book,
            updateHref,
            fullEditHref,
        },
    });
}

export function createBookIntroSurface({
    book,
    updateHref,
    fullEditHref,
    overviewPageId,
    overviewPageOptions,
    cmsPagesIndexHref,
    presentation,
}: BookIntroSurfaceArgs): AdminSurfaceContract<IntroContractMetadata<ScriptureBook>> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_INTRO_SURFACE_KEY,
        contractKey: 'intro',
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_intro',
        capabilities: ['edit', 'full_edit'],
        presentation,
        metadata: {
            introKind: 'field',
            entityRecord: book,
            entityLabel: book.title,
            textValue: book.description ?? null,
            block: null,
            blockTypes: [],
            updateHref,
            storeHref: null,
            fullEditHref,
            overviewPageId,
            overviewPageOptions,
            cmsPagesIndexHref,
        },
    });
}

export function createBookActionsSurface({
    book,
    destroyHref,
}: BookActionsSurfaceArgs): AdminSurfaceContract<EntityActionsContractMetadata> {
    return createInlineEditorSurface({
        contractKey: 'entity_actions',
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_actions',
        capabilities: destroyHref ? ['delete'] : [],
        presentation: {
            placement: 'inline',
            variant: 'compact',
        },
        metadata: {
            entityLabel: book.title,
            parentLabel: null,
            createHref: null,
            destroyHref,
            fullEditHref: null,
        },
    });
}

export function createBookMediaSlotsSurface({
    book,
    storeHref,
    fullEditHref,
    assignments,
    availableMedia,
    nextSortOrder,
}: BookMediaSlotsSurfaceArgs): AdminSurfaceContract<MediaSlotsContractMetadata> {
    return createInlineEditorSurface({
        surfaceKey: BOOK_MEDIA_SLOTS_SURFACE_KEY,
        contractKey: 'media_slots',
        entity: 'book',
        entityId: book.id,
        regionKey: 'book_media_slots',
        capabilities: ['edit', 'full_edit', 'manage_media'],
        metadata: {
            entityLabel: book.title,
            storeHref,
            fullEditHref,
            assignments,
            availableMedia,
            nextSortOrder,
        },
    });
}

