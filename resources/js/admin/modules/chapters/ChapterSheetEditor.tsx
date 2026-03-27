import { ScriptureChapterAdminEditSheet } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getSheetEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

function ChapterSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getSheetEditorSurfaceMetadata<ScriptureChapterAdminEditSession>(
            surface,
        );

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureChapterAdminEditSheet
            session={metadata.session}
            onOpenChange={metadata.onOpenChange}
        />
    );
}

export const chapterSheetEditorModule = defineAdminModule({
    key: 'chapter-sheet-editor',
    entityScope: 'chapter',
    surfaceSlots: 'sheet_editor',
    EditorComponent: ChapterSheetEditor,
    order: 90,
    description:
        'Preserves the existing chapter sheet fallback while the page attaches modules automatically.',
});
