import { ScriptureBookIntroInlineEditor } from '@/components/scripture/scripture-book-intro-inline-editor';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getInlineEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

type InlineBookIntroSession = Extract<
    ScriptureBookAdminEditSession,
    { kind: 'entity_details' }
>;

function BookIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getInlineEditorSurfaceMetadata<InlineBookIntroSession, () => void>(
            surface,
        );

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureBookIntroInlineEditor
            session={metadata.session}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const bookIntroEditorModule = defineAdminModule({
    key: 'book-intro-editor',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    regionScope: 'page_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: BookIntroEditor,
    order: 10,
    description:
        'Renders the current inline book intro editor when the page-intro surface qualifies.',
});
