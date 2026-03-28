import { router } from '@inertiajs/react';
import { LoaderCircle, Trash2, X } from 'lucide-react';
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

function BlockDelete({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (metadata === null || !management?.deleteHref) {
        return null;
    }

    if (confirmDelete) {
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
                    disabled={processing}
                >
                    <X className="size-3.5" />
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        setProcessing(true);

                        router.delete(management.deleteHref!, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setConfirmDelete(false);
                                management.onDeleteSuccess?.();
                            },
                            onFinish: () => setProcessing(false),
                        });
                    }}
                    disabled={management.disabled || processing}
                >
                    {processing ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="size-3.5" />
                    )}
                    Delete
                </Button>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-full text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelete(true)}
                        disabled={management.disabled || processing}
                    >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete block</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete block</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export const blockDeleteModule = defineAdminModule({
    key: 'block-delete',
    contractKeys: 'block_actions',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['delete'],
    EditorComponent: BlockDelete,
    order: 40,
    description:
        'Renders the current safe delete control with local confirmation for eligible blocks.',
});


