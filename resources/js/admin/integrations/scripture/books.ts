import { bookIdentityEditorModule } from '@/admin/modules/books/BookIdentityEditor';
import { bookIntroEditorModule } from '@/admin/modules/books/BookIntroEditor';
import { mediaSlotsEditorModule } from '@/admin/modules/books/MediaSlotsEditor';
import type { AdminSurfacePresentation } from '@/admin/surfaces/core/surface-contracts';
import {
    createBookActionsSurface,
    createBookIdentitySurface,
    createBookIntroSurface,
    createBookMediaSlotsSurface,
} from '@/admin/surfaces/scripture/books/surface-builders';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureBookCardAdmin,
} from '@/types';

export {
    bookIdentityEditorModule,
    bookIntroEditorModule,
    mediaSlotsEditorModule,
};

export const bookAdminModules = [
    bookIdentityEditorModule,
    bookIntroEditorModule,
    mediaSlotsEditorModule,
] as const;

function canResolveBookIdentitySurface(
    admin: ScriptureBookAdmin | ScriptureBookCardAdmin | null | undefined,
): admin is ScriptureBookAdmin {
    return (
        admin !== null &&
        admin !== undefined &&
        'identity_update_href' in admin &&
        typeof admin.identity_update_href === 'string'
    );
}

export function resolveBookHeaderSurfaces({
    book,
    admin,
    enabled = true,
    presentation = null,
}: {
    book: ScriptureBook;
    admin?: ScriptureBookAdmin | null;
    enabled?: boolean;
    presentation?: AdminSurfacePresentation | null;
}) {
    if (!enabled || !admin) {
        return {
            identitySurface: null,
            introSurface: null,
            actionsSurface: null,
        };
    }

    return {
        identitySurface: canResolveBookIdentitySurface(admin)
            ? createBookIdentitySurface({
                  book,
                  updateHref: admin.identity_update_href,
                  fullEditHref: admin.canonical_edit_href,
              })
            : null,
        introSurface: createBookIntroSurface({
            book,
            updateHref: admin.details_update_href,
            fullEditHref: admin.full_edit_href,
            presentation,
        }),
        actionsSurface: createBookActionsSurface({
            book,
            destroyHref: admin.destroy_href ?? null,
        }),
    };
}

export function resolveBookCardIntroSurface({
    book,
    enabled = true,
    presentation = {
        placement: 'inline',
        variant: 'compact',
    },
}: {
    book: ScriptureBook;
    enabled?: boolean;
    presentation?: AdminSurfacePresentation | null;
}) {
    if (!enabled || !book.admin) {
        return null;
    }

    return createBookIntroSurface({
        book,
        updateHref: book.admin.details_update_href,
        fullEditHref: book.admin.full_edit_href,
        presentation,
    });
}

export function resolveBookMediaSurface({
    book,
    admin,
    enabled = true,
}: {
    book: ScriptureBook;
    admin?: ScriptureBookAdmin | null;
    enabled?: boolean;
}) {
    if (
        !enabled ||
        (!admin?.media_assignment_attach_href &&
            !admin?.media_assignment_store_href) ||
        !admin.media_assignments ||
        !admin.available_media ||
        admin.next_media_assignment_sort_order === undefined
    ) {
        return null;
    }

    return createBookMediaSlotsSurface({
        book,
        attachHref:
            admin.media_assignment_attach_href ??
            admin.media_assignment_store_href!,
        fullEditHref: admin.full_edit_href,
        assignments: admin.media_assignments,
        availableMedia: admin.available_media,
        nextSortOrder: admin.next_media_assignment_sort_order,
    });
}
