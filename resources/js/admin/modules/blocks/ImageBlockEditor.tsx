import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScriptureImageContentBlockInlineEditor } from '@/components/scripture/scripture-image-content-block-inline-editor';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminBlockHref } from '@/lib/scripture-admin-navigation';
import { getRegisteredBlockEditorMetadata } from '@/admin/surfaces/blocks/surface-types';

function ImageBlockEditor({ surface }: AdminModuleComponentProps) {
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

    const mediaUrl = metadata.block.data_json?.['url'];
    const altText = metadata.block.data_json?.['alt'];

    return (
        <div className="basis-full pt-2">
            <ScriptureImageContentBlockInlineEditor
                session={{
                    updateHref: metadata.updateHref,
                    fullEditHref,
                    block: metadata.block,
                    values: {
                        title: metadata.block.title ?? '',
                        body: metadata.block.body ?? '',
                        region: metadata.block.region,
                        sort_order: metadata.block.sort_order,
                        status: 'published',
                        media_url:
                            typeof mediaUrl === 'string' ? mediaUrl : '',
                        alt_text: typeof altText === 'string' ? altText : '',
                    },
                }}
                entityLabel={metadata.entityLabel}
                onCancel={() => setIsOpen(false)}
            />
        </div>
    );
}

export const imageBlockEditorModule = defineAdminModule({
    key: 'image-block-editor',
    contractKeys: 'registered_block',
    entityScope: 'content_block',
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: 'image',
    requiredCapabilities: ['edit'],
    EditorComponent: ImageBlockEditor,
    order: 22,
    description:
        'Renders the shared inline editor for registered image blocks on active scripture surfaces.',
});


