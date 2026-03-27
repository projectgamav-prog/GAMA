import { ScriptureVerseAdminEditSheet } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getSheetEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

function VerseSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getSheetEditorSurfaceMetadata<ScriptureVerseAdminEditSession>(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureVerseAdminEditSheet
            session={metadata.session}
            onOpenChange={metadata.onOpenChange}
        />
    );
}

export const verseSheetEditorModule = defineAdminModule({
    key: 'verse-sheet-editor',
    entityScope: 'verse',
    surfaceSlots: 'sheet_editor',
    EditorComponent: VerseSheetEditor,
    order: 90,
    description:
        'Preserves the existing verse sheet fallback while module-driven inline surfaces take over page rendering.',
});
