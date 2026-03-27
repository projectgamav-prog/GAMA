import { router } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import { ScriptureContentBlockInsertControl } from '@/components/scripture/scripture-content-block-insert-control';
import { ScriptureContentBlockManagementControls } from '@/components/scripture/scripture-content-block-management-controls';
import {
    createAfterContentBlockInsertionPoint,
    createAfterLastContentBlockInsertionPoint,
    createBeforeFirstContentBlockInsertionPoint,
    createSectionStartContentBlockInsertionPoint,
    matchesContentBlockInsertionPoint,
} from '@/lib/scripture-content-block-insertion';
import type {
    ScriptureContentBlockManagementCapability,
    ScriptureContentBlockSectionCapabilities,
} from '@/lib/scripture-admin-capabilities';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import { cn } from '@/lib/utils';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionPoint,
    ScriptureContentBlockReorderMeta,
    ScriptureEntityRegionInput,
} from '@/types/scripture';
import { ScriptureSection } from './scripture-section';

type DropPosition = 'before' | 'after';

type DragState = {
    blockId: number;
    reorderHref: string;
    region: string;
    currentPosition: number;
    totalInRegion: number;
    onReorderSuccess?: (message: string) => void;
};

type DropTarget = {
    blockId: number;
    position: DropPosition;
    previewPosition: number;
};

/**
 * Shared public-page block section renderer for books, chapters, and verses.
 *
 * Responsibilities:
 * - render the published block list in page order
 * - derive add/edit/manage surfaces from shared block capability contracts
 * - expose start, between, and bottom insertion affordances automatically
 * - swap in inline create/edit UIs for the safe text-first flows
 * - keep drag reorder constrained to the same visible region and backend rules
 */
type Props = {
    title: string;
    description: string;
    blocks: ScriptureContentBlock[];
    id?: string;
    entityMeta?: ScriptureEntityRegionInput;
    capabilities?: ScriptureContentBlockSectionCapabilities | null;
    sectionAdminSurface?: ScriptureAdminSurfaceOptions | null;
    emptyStateAction?: ReactNode;
    renderBlockHeaderAction?: (block: ScriptureContentBlock) => ReactNode;
    renderBlockSurfaceActions?: (
        block: ScriptureContentBlock,
        reorderMeta: ScriptureContentBlockReorderMeta,
    ) => ReactNode;
    renderInlineBlockEditor?: (block: ScriptureContentBlock) => ReactNode;
    renderPendingInlineCreateEditor?: () => ReactNode;
    resolveBlockAdminSurface?: (
        block: ScriptureContentBlock,
    ) => ScriptureAdminSurfaceOptions | null;
    pendingInlineCreateInsertionPoint?: ScriptureContentBlockInsertionPoint | null;
    insertBlockTypes?: string[];
    onInsertBlockTypeSelected?: (
        position: ScriptureContentBlockInsertionPoint,
        blockType: string,
    ) => void;
    blockCreationDisabled?: boolean;
};

const getPreviewPosition = (
    currentPosition: number,
    anchorPosition: number,
    position: DropPosition,
): number =>
    position === 'before'
        ? anchorPosition < currentPosition
            ? anchorPosition
            : anchorPosition - 1
        : anchorPosition < currentPosition
          ? anchorPosition + 1
          : anchorPosition;

export function ScriptureContentBlocksSection({
    title,
    description,
    blocks,
    id,
    entityMeta,
    capabilities,
    sectionAdminSurface,
    emptyStateAction,
    renderBlockHeaderAction,
    renderBlockSurfaceActions,
    renderInlineBlockEditor,
    renderPendingInlineCreateEditor,
    resolveBlockAdminSurface,
    pendingInlineCreateInsertionPoint,
    insertBlockTypes = [],
    onInsertBlockTypeSelected,
    blockCreationDisabled = false,
}: Props) {
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const [pendingDragBlockId, setPendingDragBlockId] = useState<number | null>(
        null,
    );
    const resolvedSectionAdminSurface =
        capabilities?.sectionAdminSurface ?? sectionAdminSurface;
    const resolvedInsertBlockTypes =
        capabilities?.insertBlockTypes ?? insertBlockTypes;
    const resolvedBlockCreationDisabled =
        capabilities?.blockCreationDisabled ?? blockCreationDisabled;
    const resolvedOnInsertBlockTypeSelected =
        capabilities?.onInsertBlockTypeSelected ?? onInsertBlockTypeSelected;
    const resolvedResolveBlockAdminSurface =
        capabilities?.resolveBlockAdminSurface ?? resolveBlockAdminSurface;
    const resolvedResolveBlockManagement =
        capabilities?.resolveBlockManagement;
    const canInsertBlocks =
        resolvedInsertBlockTypes.length > 0 &&
        resolvedOnInsertBlockTypeSelected !== undefined;
    const totalBlocksByRegion = blocks.reduce<Record<string, number>>(
        (totals, block) => ({
            ...totals,
            [block.region]: (totals[block.region] ?? 0) + 1,
        }),
        {},
    );
    const seenBlocksByRegion = new Map<string, number>();

    const clearDragState = () => {
        setDragState(null);
        setDropTarget(null);
        setPendingDragBlockId(null);
    };

    const renderInsertionSurface = (
        insertionPoint: ScriptureContentBlockInsertionPoint,
    ) => {
        if (
            pendingInlineCreateInsertionPoint !== null &&
            pendingInlineCreateInsertionPoint !== undefined &&
            renderPendingInlineCreateEditor &&
            matchesContentBlockInsertionPoint(
                pendingInlineCreateInsertionPoint,
                insertionPoint,
            )
        ) {
            return renderPendingInlineCreateEditor();
        }

        if (
            !canInsertBlocks ||
            resolvedOnInsertBlockTypeSelected === undefined
        ) {
            return null;
        }

        return (
            <ScriptureContentBlockInsertControl
                blockTypes={resolvedInsertBlockTypes}
                disabled={resolvedBlockCreationDisabled}
                label="Add block"
                placementLabel={insertionPoint.label}
                onSelectType={(blockType) =>
                    resolvedOnInsertBlockTypeSelected(insertionPoint, blockType)
                }
            />
        );
    };

    const resolveDropPosition = (
        event: DragEvent<HTMLDivElement>,
    ): DropPosition => {
        const bounds = event.currentTarget.getBoundingClientRect();

        return event.clientY < bounds.top + bounds.height / 2
            ? 'before'
            : 'after';
    };

    const handleDragOver = (
        event: DragEvent<HTMLDivElement>,
        block: ScriptureContentBlock,
        reorderMeta: ScriptureContentBlockReorderMeta,
    ) => {
        if (!dragState || dragState.blockId === block.id) {
            return;
        }

        if (dragState.region !== block.region) {
            setDropTarget(null);

            return;
        }

        const position = resolveDropPosition(event);
        const previewPosition = getPreviewPosition(
            dragState.currentPosition,
            reorderMeta.positionInRegion,
            position,
        );

        if (previewPosition === dragState.currentPosition) {
            setDropTarget(null);

            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDropTarget({
            blockId: block.id,
            position,
            previewPosition,
        });
    };

    const handleDrop = (
        event: DragEvent<HTMLDivElement>,
        block: ScriptureContentBlock,
        reorderMeta: ScriptureContentBlockReorderMeta,
        management: ScriptureContentBlockManagementCapability | null,
    ) => {
        if (
            !dragState ||
            dragState.blockId === block.id ||
            dragState.region !== block.region
        ) {
            clearDragState();

            return;
        }

        const position = resolveDropPosition(event);
        const previewPosition = getPreviewPosition(
            dragState.currentPosition,
            reorderMeta.positionInRegion,
            position,
        );

        if (previewPosition === dragState.currentPosition) {
            clearDragState();

            return;
        }

        event.preventDefault();
        setPendingDragBlockId(dragState.blockId);

        router.post(
            dragState.reorderHref,
            {
                relative_block_id: block.id,
                position,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    dragState.onReorderSuccess?.(
                        `Moved to ${previewPosition} of ${dragState.totalInRegion}`,
                    );
                },
                onFinish: clearDragState,
            },
        );
    };

    if (blocks.length === 0) {
        const sectionStartInsertionPoint =
            createSectionStartContentBlockInsertionPoint(null);

        if (!canInsertBlocks && !pendingInlineCreateInsertionPoint) {
            return null;
        }

        return (
            <ScriptureSection
                id={id}
                title={title}
                description={description}
                entityMeta={entityMeta}
                adminSurface={resolvedSectionAdminSurface ?? undefined}
            >
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                This region does not have any published blocks
                                yet.
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Choose where to start, pick a block type, and
                                create the first note directly on this page.
                            </p>
                        </div>
                        {renderInsertionSurface(sectionStartInsertionPoint)}
                        {emptyStateAction}
                    </div>
                </div>
            </ScriptureSection>
        );
    }

    return (
        <ScriptureSection
            id={id}
            title={title}
            description={description}
            entityMeta={entityMeta}
            adminSurface={resolvedSectionAdminSurface ?? undefined}
        >
            <div className="space-y-4">
                {renderInsertionSurface(
                    createBeforeFirstContentBlockInsertionPoint(blocks[0]),
                )}

                {blocks.map((block, index) => {
                    const isLastBlock = index === blocks.length - 1;
                    const insertionPoint = isLastBlock
                        ? createAfterLastContentBlockInsertionPoint(block)
                        : createAfterContentBlockInsertionPoint(block);
                    const blockSurface =
                        resolvedResolveBlockAdminSurface?.(block) ?? null;
                    const positionInRegion =
                        (seenBlocksByRegion.get(block.region) ?? 0) + 1;
                    seenBlocksByRegion.set(block.region, positionInRegion);
                    const reorderMeta = {
                        positionInRegion,
                        totalInRegion: totalBlocksByRegion[block.region] ?? 1,
                        regionLabel: scriptureInlineRegionLabel(block.region),
                    };
                    const management =
                        resolvedResolveBlockManagement?.(block, reorderMeta) ??
                        null;
                    const canDragReorder = Boolean(
                        management?.reorderHref &&
                            !management.disabled &&
                            reorderMeta.totalInRegion > 1,
                    );
                    const isDragSource =
                        dragState?.blockId === block.id ||
                        pendingDragBlockId === block.id;
                    const actions =
                        management !== null ? (
                            <ScriptureContentBlockManagementControls
                                {...management}
                                isDragging={isDragSource}
                                dragHandleProps={
                                    canDragReorder
                                        ? {
                                              draggable: true,
                                              onDragStart: (event) => {
                                                  event.dataTransfer.effectAllowed =
                                                      'move';
                                                  setDragState({
                                                      blockId: block.id,
                                                      reorderHref:
                                                          management.reorderHref!,
                                                      region: block.region,
                                                      currentPosition:
                                                          reorderMeta.positionInRegion,
                                                      totalInRegion:
                                                          reorderMeta.totalInRegion,
                                                      onReorderSuccess:
                                                          management.onReorderSuccess,
                                                  });
                                              },
                                              onDragEnd: clearDragState,
                                          }
                                        : undefined
                                }
                            />
                        ) : (
                            renderBlockSurfaceActions?.(block, reorderMeta) ??
                            blockSurface?.actions
                        );

                    return (
                        <Fragment key={block.id}>
                            <div
                                className={cn(
                                    'relative transition-opacity',
                                    isDragSource && 'opacity-75',
                                )}
                                onDragOver={(event) =>
                                    handleDragOver(event, block, reorderMeta)
                                }
                                onDrop={(event) =>
                                    handleDrop(
                                        event,
                                        block,
                                        reorderMeta,
                                        management,
                                    )
                                }
                            >
                                {dropTarget?.blockId === block.id &&
                                    dropTarget.position === 'before' && (
                                        <div className="pointer-events-none absolute inset-x-4 top-0 z-20 -translate-y-1/2">
                                            <div className="rounded-full border border-primary/30 bg-primary/12 px-3 py-2 text-center text-[10px] font-semibold tracking-[0.18em] text-primary uppercase shadow-sm">
                                                Drop here to move to{' '}
                                                {dropTarget.previewPosition} of{' '}
                                                {reorderMeta.totalInRegion}
                                            </div>
                                        </div>
                                    )}

                                <ContentBlockRenderer
                                    block={block}
                                    headerAction={renderBlockHeaderAction?.(
                                        block,
                                    )}
                                    inlineEditor={renderInlineBlockEditor?.(
                                        block,
                                    )}
                                    adminSurface={
                                        blockSurface
                                            ? {
                                                  ...blockSurface,
                                                  actions,
                                              }
                                            : blockSurface
                                    }
                                />

                                {dropTarget?.blockId === block.id &&
                                    dropTarget.position === 'after' && (
                                        <div className="pointer-events-none absolute inset-x-4 bottom-0 z-20 translate-y-1/2">
                                            <div className="rounded-full border border-primary/30 bg-primary/12 px-3 py-2 text-center text-[10px] font-semibold tracking-[0.18em] text-primary uppercase shadow-sm">
                                                Drop here to move to{' '}
                                                {dropTarget.previewPosition} of{' '}
                                                {reorderMeta.totalInRegion}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {renderInsertionSurface(insertionPoint)}
                        </Fragment>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
