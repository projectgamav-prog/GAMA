import { router } from '@inertiajs/react';
import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { Button } from '@/components/ui/button';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';

function BlockDelete({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;
    const [processing, setProcessing] = useState(false);

    if (
        metadata === null ||
        !activation.isActive ||
        !management?.deleteHref
    ) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-destructive/20 bg-destructive/5 p-1">
                <span className="px-2 text-[10px] font-semibold tracking-[0.18em] text-destructive uppercase">
                    Delete block?
                </span>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full px-3"
                    onClick={activation.deactivate}
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
                                management.onDeleteSuccess?.();
                                activation.deactivate();
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
        </div>
    );
}

export const blockDeleteModule = defineAdminModule({
    key: 'block-delete',
    contractKeys: 'block_actions',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['delete'],
    actions: [
        {
            actionKey: 'delete_block',
            defaultLabel: 'Delete',
            placement: 'dropdown',
            openMode: 'inline',
            priority: 50,
            variant: 'destructive',
        },
    ],
    qualifies: (surface) =>
        Boolean(getBlockActionMetadata(surface)?.management?.deleteHref),
    EditorComponent: BlockDelete,
    order: 50,
    description:
        'Provides the shared delete confirmation flow as a module-owned action on semantic block-action surfaces.',
});
