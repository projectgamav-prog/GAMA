import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';

function VideoBlockEditor(_: AdminModuleComponentProps) {
    // Video blocks remain on the sheet/full-edit path for now.
    return null;
}

export const videoBlockEditorModule = defineAdminModule({
    key: 'video-block-editor',
    entityScope: ['book', 'chapter', 'verse', 'content_block'],
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'video',
    EditorComponent: VideoBlockEditor,
    order: 23,
    description:
        'Registers video blocks with the module engine while preserving the current sheet fallback.',
});
