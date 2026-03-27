import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureVerse,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
} from '@/types';

export type VerseIdentitySurfaceMetadata = {
    verse: ScriptureVerse;
    updateHref: string;
    fullEditHref: string;
};

export type VerseMetaSurfaceMetadata = {
    verseMeta: ScriptureVerseMeta | null;
    updateHref: string;
    fullEditHref: string;
    characters: ScriptureVerseCharacterAssignment[];
};

export type VerseNoteBlockSurfaceMetadata = {
    entityLabel: string;
    block: ScriptureContentBlock;
    updateHref: string;
    fullEditHref: string;
};

export type VerseBlockRegionSurfaceMetadata = {
    entityLabel: string;
    storeHref: string;
    fullEditHref: string;
    defaultRegion: string;
    blockTypes: string[];
    insertionPoint: ScriptureContentBlockInsertionPoint;
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

export function getVerseIdentityMetadata(
    surface: AdminSurfaceContract,
): VerseIdentitySurfaceMetadata | null {
    return getSurfaceMetadata<VerseIdentitySurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.verse === 'object' &&
            metadata.verse !== null,
    );
}

export function getVerseMetaMetadata(
    surface: AdminSurfaceContract,
): VerseMetaSurfaceMetadata | null {
    return getSurfaceMetadata<VerseMetaSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            Array.isArray(metadata.characters),
    );
}

export function getVerseNoteBlockMetadata(
    surface: AdminSurfaceContract,
): VerseNoteBlockSurfaceMetadata | null {
    return getSurfaceMetadata<VerseNoteBlockSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.block === 'object' &&
            metadata.block !== null,
    );
}

export function getVerseBlockRegionMetadata(
    surface: AdminSurfaceContract,
): VerseBlockRegionSurfaceMetadata | null {
    return getSurfaceMetadata<VerseBlockRegionSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.entityLabel === 'string' &&
            typeof metadata.storeHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.defaultRegion === 'string' &&
            Array.isArray(metadata.blockTypes) &&
            typeof metadata.insertionPoint === 'object' &&
            metadata.insertionPoint !== null,
    );
}
