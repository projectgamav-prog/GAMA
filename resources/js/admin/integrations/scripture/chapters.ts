import { chapterIdentityEditorModule } from '@/admin/modules/chapters/ChapterIdentityEditor';
import { chapterIntroEditorModule } from '@/admin/modules/chapters/ChapterIntroEditor';
import {
    createChapterActionsSurface,
    createChapterIdentitySurface,
    createChapterIntroSurface,
} from '@/admin/surfaces/scripture/chapters/surface-builders';
import type {
    ScriptureChapter,
    ScriptureChapterAdmin,
    ScriptureChapterRowAdmin,
} from '@/types';

export {
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
};

export const chapterAdminModules = [
    chapterIdentityEditorModule,
    chapterIntroEditorModule,
] as const;

export function resolveChapterHeaderSurfaces({
    chapter,
    chapterTitle,
    admin,
    enabled = true,
}: {
    chapter: ScriptureChapter;
    chapterTitle: string;
    admin?: ScriptureChapterAdmin | ScriptureChapterRowAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            actionsSurface: null,
        };
    }

    return {
        identitySurface: createChapterIdentitySurface({
            chapter,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
        }),
        introSurface: createChapterIntroSurface({
            chapter,
            chapterTitle,
            block: admin.primary_intro_block,
            blockTypes: admin.intro_block_types,
            updateHref: admin.primary_intro_update_href,
            destroyHref: admin.primary_intro_destroy_href,
            storeHref: admin.intro_store_href,
            fullEditHref: admin.full_edit_href,
        }),
        actionsSurface: createChapterActionsSurface({
            chapter,
            chapterTitle,
            destroyHref: admin.destroy_href ?? null,
        }),
    };
}
