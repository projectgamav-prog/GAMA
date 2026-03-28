import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';

type PendingAction = 'move-up' | 'move-down' | null;

function BlockReorder({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    if (
        metadata === null ||
        management == null ||
        management.positionInRegion === undefined ||
        management.totalInRegion === undefined ||
        management.totalInRegion <= 1
    ) {
        return null;
    }

    const submitPost = (
        href: string,
        action: Exclude<PendingAction, null>,
        onSuccess?: () => void,
    ) => {
        setPendingAction(action);

        router.post(
            href,
            {},
            {
                preserveScroll: true,
                onSuccess,
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const regionLabel = management.regionLabel ?? 'this region';
    const isProcessing = pendingAction !== null;
    const reorderStatusLabel =
        pendingAction === 'move-up'
            ? 'Moving earlier'
            : pendingAction === 'move-down'
              ? 'Moving later'
              : `${management.positionInRegion} of ${management.totalInRegion}`;

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/20 px-1 py-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full"
                            onClick={() => {
                                if (!management.moveUpHref) {
                                    return;
                                }

                                submitPost(
                                    management.moveUpHref,
                                    'move-up',
                                    management.onMoveUpSuccess,
                                );
                            }}
                            disabled={
                                management.disabled ||
                                isProcessing ||
                                !management.moveUpHref
                            }
                        >
                            {pendingAction === 'move-up' ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                            ) : (
                                <ArrowUp className="size-3.5" />
                            )}
                            <span className="sr-only">Move block earlier</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {management.moveUpHref
                            ? `Move earlier in ${regionLabel}`
                            : `Already first in ${regionLabel}`}
                    </TooltipContent>
                </Tooltip>

                <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {reorderStatusLabel}
                </span>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full"
                            onClick={() => {
                                if (!management.moveDownHref) {
                                    return;
                                }

                                submitPost(
                                    management.moveDownHref,
                                    'move-down',
                                    management.onMoveDownSuccess,
                                );
                            }}
                            disabled={
                                management.disabled ||
                                isProcessing ||
                                !management.moveDownHref
                            }
                        >
                            {pendingAction === 'move-down' ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                            ) : (
                                <ArrowDown className="size-3.5" />
                            )}
                            <span className="sr-only">Move block later</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {management.moveDownHref
                            ? `Move later in ${regionLabel}`
                            : `Already last in ${regionLabel}`}
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

export const blockReorderModule = defineAdminModule({
    key: 'block-reorder',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['reorder'],
    EditorComponent: BlockReorder,
    order: 20,
    description:
        'Renders the existing move-earlier/move-later controls and position badge for eligible blocks.',
});


