import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';

function QuoteBlockEditor(_: AdminModuleComponentProps) {
    // Quote blocks still use the shared sheet fallback in the current phase.
    return null;
}

export const quoteBlockEditorModule = defineAdminModule({
    key: 'quote-block-editor',
    entityScope: ['book', 'chapter', 'verse', 'content_block'],
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'quote',
    EditorComponent: QuoteBlockEditor,
    order: 21,
    description:
        'Registers quote blocks with the module engine while keeping their existing sheet fallback behavior.',
});
