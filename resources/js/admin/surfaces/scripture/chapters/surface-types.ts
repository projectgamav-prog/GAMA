import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/surfaces/core/surface-metadata';
import type { ScriptureChapter, ScriptureContentBlock } from '@/types';

export type ChapterIdentitySurfaceMetadata = {
    editor: 'chapter_identity';
    chapter: ScriptureChapter;
    updateHref: string;
    fullEditHref: string;
};

export type ChapterIntroSurfaceMetadata = {
    editor: 'chapter_intro';
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    storeHref: string | null;
    fullEditHref: string;
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

export function getChapterIdentityMetadata(
    surface: AdminSurfaceContract,
): ChapterIdentitySurfaceMetadata | null {
    return getSurfaceMetadata<ChapterIdentitySurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'chapter_identity' &&
            typeof metadata.updateHref === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.chapter === 'object' &&
            metadata.chapter !== null,
    );
}

export function getChapterIntroMetadata(
    surface: AdminSurfaceContract,
): ChapterIntroSurfaceMetadata | null {
    return getSurfaceMetadata<ChapterIntroSurfaceMetadata>(
        surface,
        (metadata) =>
            metadata.editor === 'chapter_intro' &&
            typeof metadata.chapterTitle === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            Array.isArray(metadata.blockTypes) &&
            (typeof metadata.storeHref === 'string' ||
                metadata.storeHref === null) &&
            typeof metadata.chapter === 'object' &&
            metadata.chapter !== null,
    );
}

