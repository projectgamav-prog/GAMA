import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getVerseNoteBlockMetadata } from './surface-types';

function VerseNotesEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getVerseNoteBlockMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);

    if (metadata === null) {
        return null;
    }

    if (!isOpen) {
        return (
            <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3"
                onClick={() => setIsOpen(true)}
            >
                Edit
            </Button>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureTextContentBlockInlineEditor
                session={{
                    updateHref: metadata.updateHref,
                    fullEditHref: metadata.fullEditHref,
                    block: metadata.block,
                    values: {
                        title: metadata.block.title ?? '',
                        body: metadata.block.body ?? '',
                        region: metadata.block.region,
                        sort_order: metadata.block.sort_order,
                        status: 'published',
                    },
                }}
                entityLabel={metadata.entityLabel}
                onCancel={() => setIsOpen(false)}
            />
        </div>
    );
}

export const verseNotesEditorModule = defineAdminModule({
    key: 'verse-notes-editor',
    entityScope: 'content_block',
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'text',
    requiredCapabilities: ['edit'],
    EditorComponent: VerseNotesEditor,
    order: 30,
    description:
        'Renders the attached verse note editor for text blocks on the verse page.',
});
