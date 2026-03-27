import { useState } from 'react';
import { ScriptureContentBlockInsertControl } from '@/components/scripture/scripture-content-block-insert-control';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { createInlineTextContentBlockCreateSession } from '@/lib/scripture-inline-text-content-block';
import { getBlockCreateMetadata } from './surface-types';

function BlockCreate({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockCreateMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);

    if (metadata === null) {
        return null;
    }

    const canCreateInlineTextBlock =
        metadata.storeHref &&
        metadata.fullEditHref &&
        metadata.defaultRegion &&
        metadata.insertionPoint &&
        metadata.entityLabel &&
        metadata.blockTypes.includes('text');

    if (isOpen && canCreateInlineTextBlock) {
        const {
            storeHref,
            fullEditHref,
            defaultRegion,
            insertionPoint,
            entityLabel,
        } = metadata;

        if (
            !storeHref ||
            !fullEditHref ||
            !defaultRegion ||
            !insertionPoint ||
            !entityLabel
        ) {
            return null;
        }

        return (
            <div className="basis-full pt-2">
                <ScriptureTextContentBlockInlineEditor
                    session={createInlineTextContentBlockCreateSession({
                        storeHref,
                        fullEditHref,
                        defaultRegion,
                        insertionPoint,
                        blockType: 'text',
                    })}
                    entityLabel={entityLabel}
                    onCancel={() => setIsOpen(false)}
                    onSaveSuccess={() => setIsOpen(false)}
                />
            </div>
        );
    }

    return (
        <ScriptureContentBlockInsertControl
            blockTypes={metadata.blockTypes}
            disabled={metadata.disabled ?? false}
            label={metadata.label}
            placementLabel={metadata.placementLabel}
            onSelectType={(blockType) => {
                metadata.onSelectType(blockType);

                if (blockType === 'text' && canCreateInlineTextBlock) {
                    setIsOpen(true);
                }
            }}
        />
    );
}

export const blockCreateModule = defineAdminModule({
    key: 'block-create',
    entityScope: ['book', 'chapter', 'verse'],
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['add_block'],
    EditorComponent: BlockCreate,
    order: 10,
    description:
        'Renders the existing block-type picker at valid insertion points in block-backed scripture regions.',
});
