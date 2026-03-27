import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureBook,
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
