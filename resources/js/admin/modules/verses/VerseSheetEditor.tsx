import { ScriptureVerseAdminEditSheet } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type VerseSheetSurfaceMetadata = {
    session: ScriptureVerseAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): VerseSheetSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<VerseSheetSurfaceMetadata>;

    return typeof candidate.onOpenChange === 'function'
        ? (candidate as VerseSheetSurfaceMetadata)
        : null;
};

function VerseSheetEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

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
