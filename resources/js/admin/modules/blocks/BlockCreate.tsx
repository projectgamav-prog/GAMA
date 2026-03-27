import { useState } from 'react';
import { ScriptureContentBlockInsertControl } from '@/components/scripture/scripture-content-block-insert-control';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import {
    createInlineTextContentBlockCreateSession,
    isInlineTextualContentBlockType,
} from '@/lib/scripture-inline-text-content-block';
import { getBlockCreateMetadata } from './surface-types';

function BlockCreate({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockCreateMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedBlockType, setSelectedBlockType] = useState('text');

    if (metadata === null) {
        return null;
    }

    const canCreateInlineBlock = Boolean(
        metadata.storeHref &&
            metadata.fullEditHref &&
            metadata.defaultRegion &&
            metadata.insertionPoint &&
            metadata.entityLabel,
    );

    if (isOpen && canCreateInlineBlock) {
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
                        fullEditHref: buildScriptureAdminSectionHref(
                            fullEditHref,
                            'content_blocks',
                        ),
                        defaultRegion,
                        insertionPoint,
                        blockType: selectedBlockType,
                    })}
                    entityLabel={entityLabel}
                    onCancel={() => setIsOpen(false)}
                    onSaveSuccess={() => setIsOpen(false)}
                />
            </div>
        );
    }

    const openInlineCreate = (blockType: string) => {
        setSelectedBlockType(blockType);
        setIsOpen(true);
    };

    return (
        <ScriptureContentBlockInsertControl
            blockTypes={metadata.blockTypes}
            disabled={metadata.disabled ?? false}
            label={metadata.label}
            placementLabel={metadata.placementLabel}
            onSelectType={(blockType) => {
                if (
                    canCreateInlineBlock &&
                    metadata.blockTypes.includes(blockType) &&
                    isInlineTextualContentBlockType(blockType)
                ) {
                    openInlineCreate(blockType);

                    return;
                }

                metadata.onSelectType(blockType);
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
        'Renders the shared block-type picker and inline textual create flow at valid insertion points in block-backed scripture regions.',
});
