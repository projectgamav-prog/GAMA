import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type BookSheetSurfaceMetadata = {
    session: ScriptureBookAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): BookSheetSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<BookSheetSurfaceMetadata>;

    return typeof candidate.onOpenChange === 'function'
        ? (candidate as BookSheetSurfaceMetadata)
        : null;
};

function BookSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureBookAdminEditSheet
            session={metadata.session}
            onOpenChange={metadata.onOpenChange}
        />
    );
}

export const bookSheetEditorModule = defineAdminModule({
    key: 'book-sheet-editor',
    entityScope: 'book',
    surfaceSlots: 'sheet_editor',
    EditorComponent: BookSheetEditor,
    order: 90,
    description:
        'Preserves the existing book sheet fallback while the public-page editors migrate to module hosting.',
});
