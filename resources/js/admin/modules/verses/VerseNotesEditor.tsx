import { ScriptureVerseNotesInlineEditor } from '@/components/scripture/scripture-verse-notes-inline-editor';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type InlineVerseNotesSession = Extract<
    ScriptureVerseAdminEditSession,
    { kind: 'verse_meta' }
>;

type VerseNotesSurfaceMetadata = {
    session: InlineVerseNotesSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): VerseNotesSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<VerseNotesSurfaceMetadata>;

    return typeof candidate.onCancel === 'function'
        ? (candidate as VerseNotesSurfaceMetadata)
        : null;
};

function VerseNotesEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureVerseNotesInlineEditor
            session={metadata.session}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const verseNotesEditorModule = defineAdminModule({
    key: 'verse-notes-editor',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    regionScope: ['page_intro', 'study_notes'],
    requiredCapabilities: ['edit'],
    EditorComponent: VerseNotesEditor,
    order: 10,
    description:
        'Renders the current inline verse-notes editor for intro and study-note surfaces.',
});
