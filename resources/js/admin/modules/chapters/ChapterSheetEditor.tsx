import { ScriptureChapterAdminEditSheet } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type ChapterSheetSurfaceMetadata = {
    session: ScriptureChapterAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): ChapterSheetSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<ChapterSheetSurfaceMetadata>;

    return typeof candidate.onOpenChange === 'function'
        ? (candidate as ChapterSheetSurfaceMetadata)
        : null;
};

function ChapterSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

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
