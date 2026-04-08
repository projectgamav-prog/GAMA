import { router } from '@inertiajs/react';
import { LoaderCircle, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getEntityActionsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import { Button } from '@/components/ui/button';

function entityTypeLabel(entity: AdminModuleComponentProps['surface']['entity']): string {
    switch (entity) {
        case 'book':
            return 'Book';
        case 'book_section':
            return 'Book Section';
        case 'chapter':
            return 'Chapter';
        case 'chapter_section':
            return 'Chapter Section';
        case 'verse':
            return 'Verse';
        default:
            return 'Item';
    }
}

function EntityDeleteAction({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getEntityActionsContractMetadata(surface);
    const [processing, setProcessing] = useState(false);

    if (
        metadata === null ||
        metadata.destroyHref === null ||
        !activation.isActive
    ) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-destructive/20 bg-destructive/5 p-1">
                <span className="px-2 text-[10px] font-semibold tracking-[0.18em] text-destructive uppercase">
                    Delete {metadata.entityLabel.toLowerCase()}?
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

                        router.delete(metadata.destroyHref!, {
                            preserveScroll: true,
                            onSuccess: () => activation.deactivate(),
                            onFinish: () => setProcessing(false),
                        });
                    }}
                    disabled={processing}
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

export const entityDeleteActionModule = defineAdminModule({
    key: 'entity-delete-action',
    contractKeys: 'entity_actions',
    entityScope: ['book', 'book_section', 'chapter', 'chapter_section', 'verse'],
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['delete'],
    actions: [
        {
            actionKey: 'delete_entity',
            placement: 'dropdown',
            openMode: 'inline',
            priority: 50,
            variant: 'destructive',
            dynamicLabel: (surface) =>
                `Delete ${entityTypeLabel(surface.entity)}`,
        },
    ],
    qualifies: (surface) =>
        Boolean(getEntityActionsContractMetadata(surface)?.destroyHref),
    EditorComponent: EntityDeleteAction,
    order: 50,
    description:
        'Provides the shared confirmation flow for entity delete actions on surface-owned admin controls.',
});
