import { router } from '@inertiajs/react';
import { Copy, LoaderCircle } from 'lucide-react';
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
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';

function BlockDuplicate({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;
    const [processing, setProcessing] = useState(false);
    const blockTypeLabel = surface.blockType
        ? scriptureAdminStartCase(surface.blockType)
        : null;

    if (metadata === null || !management?.duplicateHref) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-full"
                        onClick={() => {
                            setProcessing(true);

                            router.post(
                                management.duplicateHref!,
                                {},
                                {
                                    preserveScroll: true,
                                    onSuccess: management.onDuplicateSuccess,
                                    onFinish: () => setProcessing(false),
                                },
                            );
                        }}
                        disabled={management.disabled || processing}
                    >
                        {processing ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                        ) : (
                            <Copy className="size-3.5" />
                        )}
                        <span className="sr-only">Duplicate block</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {blockTypeLabel
                        ? `Duplicate ${blockTypeLabel.toLowerCase()} block`
                        : 'Duplicate block'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export const blockDuplicateModule = defineAdminModule({
    key: 'block-duplicate',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['duplicate'],
    EditorComponent: BlockDuplicate,
    order: 30,
    description:
        'Renders the shared duplicate action for eligible registered textual blocks.',
});


