import { verseCommentariesEditorModule } from '@/admin/modules/verses/VerseCommentariesEditor';
import { verseIntroEditorModule } from '@/admin/modules/verses/VerseIntroEditor';
import { verseIdentityEditorModule } from '@/admin/modules/verses/VerseIdentityEditor';
import { verseMetaEditorModule } from '@/admin/modules/verses/VerseMetaEditor';
import {
    verseFullEditLauncherModule,
    verseNearbyCreateModule,
} from '@/admin/modules/verses/VerseRowActions';
import { verseTranslationsEditorModule } from '@/admin/modules/verses/VerseTranslationsEditor';
import {
    createVerseCommentariesSurface,
    createVerseIdentitySurface,
    createVerseIntroSurface,
    createVerseMetaSurface,
    createVerseRowActionsSurface,
    createVerseTranslationsSurface,
} from '@/admin/surfaces/scripture/verses/surface-builders';
import {
    resolveVerseIdentitySurfaceContext,
    type VerseIdentitySurfaceContext,
} from './identity-surface-context';
import type {
    ScriptureChapterVerseSharedAdmin,
    ScriptureReaderVerseAdmin,
    ScriptureVerse,
    ScriptureVerseAdmin,
    ScriptureVerseCommentariesAdmin,
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
    ScriptureVerseTranslationsAdmin,
} from '@/types';

export {
    verseCommentariesEditorModule,
    verseFullEditLauncherModule,
    verseIntroEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseNearbyCreateModule,
    verseTranslationsEditorModule,
};

export const verseAdminModules = [
    verseCommentariesEditorModule,
    verseFullEditLauncherModule,
    verseIntroEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseNearbyCreateModule,
    verseTranslationsEditorModule,
] as const;

export function resolveVerseHeaderSurfaces({
    verse,
    verseTitle,
    verseMeta,
    characters,
    admin,
    context = 'verse_page',
    returnToHref = null,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseTitle: string;
    verseMeta: ScriptureVerseMeta | null;
    characters: ScriptureVerseCharacterAssignment[];
    admin?: ScriptureVerseAdmin | ScriptureReaderVerseAdmin | null;
    context?: VerseIdentitySurfaceContext;
    returnToHref?: string | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            metaSurface: null,
        };
    }

    const identityContext = resolveVerseIdentitySurfaceContext(context);

    return {
        identitySurface: createVerseIdentitySurface({
            verse,
            updateHref: admin.identity_update_href,
            fullEditHref: admin.full_edit_href,
            regionKey: identityContext.regionKey,
            returnToHref,
            editorDescription: identityContext.editorDescription,
            semanticContext: identityContext.semanticContext,
        }),
        introSurface: createVerseIntroSurface({
            verse,
            verseTitle,
            block: admin.primary_intro_block,
            blockTypes: admin.intro_block_types,
            updateHref: admin.primary_intro_update_href,
            destroyHref: admin.primary_intro_destroy_href,
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

export function resolveVerseRowActionSurface({
    verse,
    verseTitle,
    parentLabel,
    admin,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseTitle: string;
    parentLabel: string | null;
    admin?: ScriptureReaderVerseAdmin | null;
    enabled?: boolean;
}) {
    if (!enabled || !admin) {
        return null;
    }

    return createVerseRowActionsSurface({
        verse,
        verseTitle,
        parentLabel,
        createHref: admin.nearby_create_href,
        destroyHref: admin.destroy_href,
        fullEditHref: admin.full_edit_href,
    });
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

export function resolveVerseReaderRelationSurfaces({
    verse,
    verseTitle,
    translationsAdmin,
    commentariesAdmin,
    sharedAdmin,
    fullEditHref = null,
    enabled = true,
}: {
    verse: ScriptureVerse;
    verseTitle: string;
    translationsAdmin?: ScriptureReaderVerseAdmin['translations'] | null;
    commentariesAdmin?: ScriptureReaderVerseAdmin['commentaries'] | null;
    sharedAdmin?: ScriptureChapterVerseSharedAdmin | null;
    fullEditHref?: string | null;
    enabled?: boolean;
}) {
    if (!enabled || !sharedAdmin) {
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
                  admin: {
                      ...translationsAdmin,
                      sources: sharedAdmin.translations.sources,
                      fields: sharedAdmin.translations.fields,
                  },
                  fullEditHref,
              })
            : null,
        commentariesSurface: commentariesAdmin
            ? createVerseCommentariesSurface({
                  verse,
                  verseTitle,
                  admin: {
                      ...commentariesAdmin,
                      sources: sharedAdmin.commentaries.sources,
                      fields: sharedAdmin.commentaries.fields,
                  },
                  fullEditHref,
              })
            : null,
    };
}
