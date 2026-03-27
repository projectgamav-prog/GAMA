import { router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    GripVertical,
    LoaderCircle,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Compact block-local management controls for the live public-page admin flow.
 *
 * Current rules:
 * - reorder controls stay attached to blocks within multi-block regions
 * - unavailable directions are shown as disabled so boundaries stay obvious
 * - duplicate is limited to the safe text-block paths
 * - delete requires an explicit local confirmation and currently has no undo
 */
type Props = {
    moveUpHref?: string;
    moveDownHref?: string;
    duplicateHref?: string;
    deleteHref?: string;
    positionInRegion?: number;
    totalInRegion?: number;
    regionLabel?: string;
    isDragging?: boolean;
    dragHandleProps?: ComponentProps<'button'>;
    disabled?: boolean;
    onMoveUpSuccess?: () => void;
    onMoveDownSuccess?: () => void;
    onDuplicateSuccess?: () => void;
    onDeleteSuccess?: () => void;
};

type PendingAction = 'move-up' | 'move-down' | 'duplicate' | 'delete' | null;

export function ScriptureContentBlockManagementControls({
    moveUpHref,
    moveDownHref,
    duplicateHref,
    deleteHref,
    positionInRegion,
    totalInRegion,
    regionLabel = 'this region',
    isDragging = false,
    dragHandleProps,
    disabled = false,
    onMoveUpSuccess,
    onMoveDownSuccess,
    onDuplicateSuccess,
    onDeleteSuccess,
}: Props) {
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const isProcessing = pendingAction !== null;
    const showReorderControls =
        positionInRegion !== undefined &&
        totalInRegion !== undefined &&
        totalInRegion > 1;
    const reorderStatusLabel =
        isDragging
            ? 'Dragging'
            : pendingAction === 'move-up'
            ? 'Moving earlier'
            : pendingAction === 'move-down'
              ? 'Moving later'
              : showReorderControls
                ? `${positionInRegion} of ${totalInRegion}`
                : null;

    const submitPost = (
        href: string,
        action: Exclude<PendingAction, 'delete' | null>,
        onSuccess?: () => void,
    ) => {
        setPendingAction(action);

        router.post(
            href,
            {},
            {
                preserveScroll: true,
                onSuccess,
                onFinish: () => {
                    setPendingAction(null);
                },
            },
        );
    };

    const submitDelete = (href: string) => {
        setPendingAction('delete');

        router.delete(href, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDelete(false);
                onDeleteSuccess?.();
            },
            onFinish: () => {
                setPendingAction(null);
            },
        });
    };

    if (confirmDelete && deleteHref) {
        return (
            <div className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/5 p-1">
                <span className="px-2 text-[10px] font-semibold tracking-[0.18em] text-destructive uppercase">
                    Delete block?
                </span>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full px-3"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isProcessing}
                >
                    <X className="size-3.5" />
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-8 rounded-full px-3"
                    onClick={() => submitDelete(deleteHref)}
                    disabled={disabled || isProcessing}
                >
                    {pendingAction === 'delete' ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="size-3.5" />
                    )}
                    Delete
                </Button>
            </div>
        );
    }

    if (
        !showReorderControls &&
        !moveUpHref &&
        !moveDownHref &&
        !duplicateHref &&
        !deleteHref
    ) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex items-center gap-1">
                {showReorderControls && (
                    <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/20 px-1 py-1">
                        {dragHandleProps && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="size-8 cursor-grab rounded-full active:cursor-grabbing"
                                        aria-label={`Drag to reorder within ${regionLabel}`}
                                        disabled={disabled || isProcessing}
                                        {...dragHandleProps}
                                    >
                                        <GripVertical className="size-3.5" />
                                        <span className="sr-only">
                                            Drag to reorder block
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Drag to reorder within {regionLabel}
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 rounded-full"
                                    onClick={() => {
                                        if (!moveUpHref) {
                                            return;
                                        }

                                        submitPost(
                                            moveUpHref,
                                            'move-up',
                                            onMoveUpSuccess,
                                        );
                                    }}
                                    disabled={
                                        disabled ||
                                        isProcessing ||
                                        !moveUpHref
                                    }
                                >
                                    {pendingAction === 'move-up' ? (
                                        <LoaderCircle className="size-3.5 animate-spin" />
                                    ) : (
                                        <ArrowUp className="size-3.5" />
                                    )}
                                    <span className="sr-only">
                                        Move block earlier
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {moveUpHref
                                    ? `Move earlier in ${regionLabel}`
                                    : `Already first in ${regionLabel}`}
                            </TooltipContent>
                        </Tooltip>

                        {reorderStatusLabel && (
                            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                {reorderStatusLabel}
                            </span>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 rounded-full"
                                    onClick={() => {
                                        if (!moveDownHref) {
                                            return;
                                        }

                                        submitPost(
                                            moveDownHref,
                                            'move-down',
                                            onMoveDownSuccess,
                                        );
                                    }}
                                    disabled={
                                        disabled ||
                                        isProcessing ||
                                        !moveDownHref
                                    }
                                >
                                    {pendingAction === 'move-down' ? (
                                        <LoaderCircle className="size-3.5 animate-spin" />
                                    ) : (
                                        <ArrowDown className="size-3.5" />
                                    )}
                                    <span className="sr-only">
                                        Move block later
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {moveDownHref
                                    ? `Move later in ${regionLabel}`
                                    : `Already last in ${regionLabel}`}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {duplicateHref && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8 rounded-full"
                                onClick={() =>
                                    submitPost(
                                        duplicateHref,
                                        'duplicate',
                                        onDuplicateSuccess,
                                    )
                                }
                                disabled={disabled || isProcessing}
                            >
                                {pendingAction === 'duplicate' ? (
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                ) : (
                                    <Copy className="size-3.5" />
                                )}
                                <span className="sr-only">
                                    Duplicate block
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate text block</TooltipContent>
                    </Tooltip>
                )}

                {deleteHref && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8 rounded-full text-destructive hover:text-destructive"
                                onClick={() => setConfirmDelete(true)}
                                disabled={disabled || isProcessing}
                            >
                                <Trash2 className="size-3.5" />
                                <span className="sr-only">Delete block</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete block</TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
