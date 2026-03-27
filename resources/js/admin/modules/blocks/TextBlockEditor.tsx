import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getTextBlockEditorMetadata } from './surface-types';

function TextBlockEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getTextBlockEditorMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureTextContentBlockInlineEditor
            session={metadata.session}
            entityLabel={metadata.entityLabel}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const textBlockEditorModule = defineAdminModule({
    key: 'text-block-editor',
    entityScope: ['book', 'chapter', 'verse', 'content_block'],
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'text',
    EditorComponent: TextBlockEditor,
    order: 20,
    description:
        'Renders the current inline text-block editor for existing blocks and new inline text-block creation.',
});
