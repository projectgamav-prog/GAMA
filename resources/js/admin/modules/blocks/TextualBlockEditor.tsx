import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminBlockHref } from '@/lib/scripture-admin-navigation';
import { getRegisteredBlockEditorMetadata } from '@/admin/surfaces/blocks/surface-types';

function TextualBlockEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getRegisteredBlockEditorMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);

    if (metadata === null) {
        return null;
    }

    const fullEditHref = buildScriptureAdminBlockHref(
        metadata.fullEditHref,
        metadata.block.id,
    );

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
                    fullEditHref,
                    block: metadata.block,
                    values: {
                        block_type: metadata.block.block_type,
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

export const textualBlockEditorModule = defineAdminModule({
    key: 'textual-block-editor',
    contractKeys: 'registered_block',
    entityScope: 'content_block',
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: ['text', 'quote'],
    requiredCapabilities: ['edit'],
    EditorComponent: TextualBlockEditor,
    order: 30,
    description:
        'Renders the shared inline editor for registered text and quote blocks on active scripture surfaces.',
});


