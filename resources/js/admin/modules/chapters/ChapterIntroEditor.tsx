import { ScriptureChapterIntroInlineEditor } from '@/components/scripture/scripture-chapter-intro-inline-editor';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getInlineEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';

function ChapterIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata =
        getInlineEditorSurfaceMetadata<ScriptureChapterAdminEditSession, () => void>(
            surface,
        );

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureChapterIntroInlineEditor
            session={metadata.session}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const chapterIntroEditorModule = defineAdminModule({
    key: 'chapter-intro-editor',
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    regionScope: 'page_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: ChapterIntroEditor,
    order: 10,
    description:
        'Renders the live inline chapter intro editor for the page-intro surface.',
});
