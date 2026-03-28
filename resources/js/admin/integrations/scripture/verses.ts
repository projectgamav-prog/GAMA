import { verseCommentariesEditorModule } from '@/admin/modules/verses/VerseCommentariesEditor';
import { verseIntroEditorModule } from '@/admin/modules/verses/VerseIntroEditor';
import { verseIdentityEditorModule } from '@/admin/modules/verses/VerseIdentityEditor';
import { verseMetaEditorModule } from '@/admin/modules/verses/VerseMetaEditor';
import { verseTranslationsEditorModule } from '@/admin/modules/verses/VerseTranslationsEditor';
import {
    createVerseCommentariesSurface,
    createVerseIdentitySurface,
    createVerseIntroSurface,
    createVerseMetaSurface,
    createVerseTranslationsSurface,
} from '@/admin/surfaces/scripture/verses/surface-builders';
import type {
    ScriptureVerse,
    ScriptureVerseAdmin,
    ScriptureVerseCommentariesAdmin,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
    ScriptureVerseTranslationsAdmin,
} from '@/types';

export {
    verseCommentariesEditorModule,
    verseIntroEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseTranslationsEditorModule,
};

export const verseAdminModules = [
    verseCommentariesEditorModule,
    verseIntroEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseTranslationsEditorModule,
] as const;

export function resolveVerseHeaderSurfaces({
    verse,
    verseTitle,
    verseMeta,
    characters,
    admin,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseTitle: string;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    admin?: ScriptureVerseAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            metaSurface: null,
        };
    }

    return {
        identitySurface: createVerseIdentitySurface({
            verse,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
        }),
        introSurface: createVerseIntroSurface({
            verse,
            verseTitle,
            block: admin.primary_intro_block,
            blockTypes: admin.intro_block_types,
            updateHref: admin.primary_intro_update_href,
            storeHref: admin.intro_store_href,
            fullEditHref: admin.full_edit_href,
        }),
        metaSurface: createVerseMetaSurface({
            verse,
            verseMeta,
            characters,
            updateHref: admin.meta_update_href,
            fullEditHref: admin.full_edit_href,
        }),
    };
}

export function resolveVerseRelationSurfaces({
    verse,
    verseTitle,
    translationsAdmin,
    commentariesAdmin,
    fullEditHref = null,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseTitle: string;
    translationsAdmin?: ScriptureVerseTranslationsAdmin | null;
    commentariesAdmin?: ScriptureVerseCommentariesAdmin | null;
    fullEditHref?: string | null;
    enabled?: boolean;
}) {
    if (!enabled) {
        return {
            translationsSurface: null,
            commentariesSurface: null,
        };
    }

    return {
        translationsSurface: translationsAdmin
            ? createVerseTranslationsSurface({
                  verse,
                  verseTitle,
                  admin: translationsAdmin,
                  fullEditHref,
              })
            : null,
        commentariesSurface: commentariesAdmin
            ? createVerseCommentariesSurface({
                  verse,
                  verseTitle,
                  admin: commentariesAdmin,
                  fullEditHref,
              })
            : null,
    };
}
