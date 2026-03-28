import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { resolveBlockCreatePrompt } from '@/admin/core/semantic-action-labels';
import { getBlockCreateMetadata } from '@/admin/surfaces/blocks/surface-types';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { ScriptureImageContentBlockInlineEditor } from '@/components/scripture/scripture-image-content-block-inline-editor';
import { ScriptureTextContentBlockInlineEditor } from '@/components/scripture/scripture-text-content-block-inline-editor';
import { Button } from '@/components/ui/button';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import {
    createInlineImageContentBlockCreateSession,
    isInlineImageContentBlockType,
} from '@/lib/scripture-inline-image-content-block';
import {
    createInlineTextContentBlockCreateSession,
    isInlineTextualContentBlockType,
} from '@/lib/scripture-inline-text-content-block';

function canCreateInlineBlock(surface: AdminSurfaceContract): boolean {
    const metadata = getBlockCreateMetadata(surface);

    return Boolean(
        metadata?.storeHref &&
            metadata.fullEditHref &&
            metadata.defaultRegion &&
            metadata.insertionPoint &&
            metadata.entityLabel,
    );
}

function BlockCreate({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getBlockCreateMetadata(surface);
    const [selectedBlockType, setSelectedBlockType] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!activation.isActive) {
            setSelectedBlockType(null);
        }
    }, [activation.isActive]);

    if (
        metadata === null ||
        metadata.blockTypes.length === 0 ||
        !activation.isActive
    ) {
        return null;
    }

    const supportsInlineCreate = canCreateInlineBlock(surface);
    const closeCreateFlow = () => {
        setSelectedBlockType(null);
        activation.deactivate();
    };

    if (
        selectedBlockType &&
        supportsInlineCreate &&
        metadata.storeHref &&
        metadata.fullEditHref &&
        metadata.defaultRegion &&
        metadata.insertionPoint &&
        metadata.entityLabel
    ) {
        if (isInlineImageContentBlockType(selectedBlockType)) {
            return (
                <div className="basis-full pt-2">
                    <ScriptureImageContentBlockInlineEditor
                        session={createInlineImageContentBlockCreateSession({
                            storeHref: metadata.storeHref,
                            fullEditHref: buildScriptureAdminSectionHref(
                                metadata.fullEditHref,
                                'content_blocks',
                            ),
                            defaultRegion: metadata.defaultRegion,
                            insertionPoint: metadata.insertionPoint,
                        })}
                        entityLabel={metadata.entityLabel}
                        onCancel={closeCreateFlow}
                        onSaveSuccess={closeCreateFlow}
                    />
                </div>
            );
        }

        return (
            <div className="basis-full pt-2">
                <ScriptureTextContentBlockInlineEditor
                    session={createInlineTextContentBlockCreateSession({
                        storeHref: metadata.storeHref,
                        fullEditHref: buildScriptureAdminSectionHref(
                            metadata.fullEditHref,
                            'content_blocks',
                        ),
                        defaultRegion: metadata.defaultRegion,
                        insertionPoint: metadata.insertionPoint,
                        blockType: selectedBlockType,
                    })}
                    entityLabel={metadata.entityLabel}
                    onCancel={closeCreateFlow}
                    onSaveSuccess={closeCreateFlow}
                />
            </div>
        );
    }

    const handleSelectType = (blockType: string) => {
        if (
            supportsInlineCreate &&
            metadata.blockTypes.includes(blockType) &&
            (isInlineTextualContentBlockType(blockType) ||
                isInlineImageContentBlockType(blockType))
        ) {
            setSelectedBlockType(blockType);

            return;
        }

        if (metadata.fullEditHref && metadata.blockTypes.includes(blockType)) {
            activation.deactivate();
            router.visit(
                buildScriptureAdminSectionHref(
                    metadata.fullEditHref,
                    'content_blocks',
                ),
            );
        }
    };

    return (
        <div className="basis-full pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold">Choose block type</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {resolveBlockCreatePrompt(surface)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {metadata.blockTypes.map((blockType) => (
                        <Button
                            key={blockType}
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-full px-3"
                            disabled={metadata.disabled ?? false}
                            onClick={() => handleSelectType(blockType)}
                        >
                            {scriptureAdminStartCase(blockType)}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={closeCreateFlow}
                    >
                        Cancel
                    </Button>
                    {metadata.placementLabel && (
                        <p className="text-xs leading-5 text-muted-foreground">
                            {metadata.placementLabel}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export const blockCreateModule = defineAdminModule({
    key: 'block-create',
    contractKeys: 'block_region',
    entityScope: ['book', 'chapter', 'verse'],
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['add_block'],
    actions: [
        {
            actionKey: 'create_block',
            placement: 'inline',
            openMode: 'inline',
            priority: 10,
            variant: 'outline',
            visibility: (surface) =>
                (getBlockCreateMetadata(surface)?.blockTypes.length ?? 0) > 0,
        },
    ],
    qualifies: (surface) =>
        (getBlockCreateMetadata(surface)?.blockTypes.length ?? 0) > 0,
    EditorComponent: BlockCreate,
    order: 10,
    description:
        'Resolves create-block actions from block-region contracts and opens the shared inline create flow when the surface supports it.',
});
