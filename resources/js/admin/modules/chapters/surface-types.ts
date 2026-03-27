import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';
import { isSurfaceMetadataObject } from '@/admin/modules/shared/surface-metadata';
import type { ScriptureChapter, ScriptureContentBlock } from '@/types';

export type ChapterIntroSurfaceMetadata = {
    chapter: ScriptureChapter;
    chapterTitle: string;
    block: ScriptureContentBlock | null;
    updateHref: string | null;
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

export function getChapterIntroMetadata(
    surface: AdminSurfaceContract,
): ChapterIntroSurfaceMetadata | null {
    return getSurfaceMetadata<ChapterIntroSurfaceMetadata>(
        surface,
        (metadata) =>
            typeof metadata.chapterTitle === 'string' &&
            typeof metadata.fullEditHref === 'string' &&
            typeof metadata.chapter === 'object' &&
            metadata.chapter !== null,
    );
}
