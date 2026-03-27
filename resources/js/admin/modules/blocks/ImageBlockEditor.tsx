import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';

function ImageBlockEditor(_: AdminModuleComponentProps) {
    // Image blocks still edit through the existing sheet/full-edit flow.
    return null;
}

export const imageBlockEditorModule = defineAdminModule({
    key: 'image-block-editor',
    entityScope: ['book', 'chapter', 'verse', 'content_block'],
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'image',
    EditorComponent: ImageBlockEditor,
    order: 22,
    description:
        'Registers image blocks with the module engine while preserving the current sheet fallback.',
});
