import { ScriptureBookAdminEditSheet } from '@/components/scripture/scripture-book-admin-edit-sheet';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getSheetEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

function BookSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getSheetEditorSurfaceMetadata<ScriptureBookAdminEditSession>(surface);

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
