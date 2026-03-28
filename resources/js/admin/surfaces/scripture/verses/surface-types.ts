import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/surfaces/core/surface-metadata';
import type {
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

