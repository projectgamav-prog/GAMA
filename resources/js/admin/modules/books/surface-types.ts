import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureBook,
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
} from '@/types';

export type BookIdentitySurfaceMetadata = {
    editor: 'book_identity';
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
};

export type BookIntroSurfaceMetadata = {
    editor: 'book_intro';
    book: ScriptureBook;
    updateHref: string;
    fullEditHref: string;
};

export type BookContentBlockSurfaceMetadata = {
    editor: 'book_content_block';
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

export type BookBlockRegionSurfaceMetadata = {
    editor: 'book_block_region';
    entityLabel: string;
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
    insertionPoint: ScriptureContentBlockInsertionPoint;
    label?: string;
    placementLabel?: string;
    onSelectType: (blockType: string) => void;
};

export type BookMediaSlotsSurfaceMetadata = {
    editor: 'book_media_slots';
    bookTitle: string;
    storeHref: string;
    fullEditHref: string;
    assignments: ScriptureAdminMediaAssignment[];
    availableMedia: ScriptureAdminMediaSummary[];
    nextSortOrder: number;
};

function getSurfaceMetadata<TMetadata>(
    surface: AdminSurfaceContract,
    isValid: (metadata: Record<string, unknown>) => boolean,
): TMetadata | null {
    if (!isSurfaceMetadataObject(surface.metadata)) {
        return null;
    }

    return isValid(surface.metadata)
        ? (surface.metadata as TMetadata)
        : null;
}

export function getBookIdentityMetadata(
    surface: AdminSurfaceContract,
): BookIdentitySurfaceMetadata | null {
    return getSurfaceMetadata<BookIdentitySurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'book_identity' &&
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.book === 'object' &&
            metadata.book !== null,
    );
}

export function getBookIntroMetadata(
    surface: AdminSurfaceContract,
): BookIntroSurfaceMetadata | null {
    return getSurfaceMetadata<BookIntroSurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'book_intro' &&
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.book === 'object' &&
            metadata.book !== null,
    );
}

export function getBookContentBlockMetadata(
    surface: AdminSurfaceContract,
): BookContentBlockSurfaceMetadata | null {
    return getSurfaceMetadata<BookContentBlockSurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'book_content_block' &&
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.block === 'object' &&
            metadata.block !== null,
    );
}

export function getBookBlockRegionMetadata(
    surface: AdminSurfaceContract,
): BookBlockRegionSurfaceMetadata | null {
    return getSurfaceMetadata<BookBlockRegionSurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'book_block_region' &&
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.storeHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.defaultRegion === 'string' &&
            Array.isArray(metadata.blockTypes) &&
            typeof metadata.insertionPoint === 'object' &&
            metadata.insertionPoint !== null &&
            typeof metadata.onSelectType === 'function',
    );
}

export function getBookMediaSlotsMetadata(
    surface: AdminSurfaceContract,
): BookMediaSlotsSurfaceMetadata | null {
    return getSurfaceMetadata<BookMediaSlotsSurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'book_media_slots' &&
            typeof metadata.bookTitle === 'string' &&
            typeof metadata.storeHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            Array.isArray(metadata.assignments) &&
            Array.isArray(metadata.availableMedia) &&
            typeof metadata.nextSortOrder === 'number',
    );
}
