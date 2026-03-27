import { ScriptureVerseNotesInlineEditor } from '@/components/scripture/scripture-verse-notes-inline-editor';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getInlineEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

type InlineVerseNotesSession = Extract<
    ScriptureVerseAdminEditSession,
    { kind: 'verse_meta' }
>;

function VerseNotesEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getInlineEditorSurfaceMetadata<InlineVerseNotesSession, () => void>(
            surface,
        );

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
