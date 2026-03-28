import { GripVertical } from 'lucide-react';
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

function BlockDragReorder({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;

    if (
        metadata === null ||
        !metadata.dragHandleProps ||
        !management?.reorderHref
    ) {
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
                        className="size-8 cursor-grab rounded-full active:cursor-grabbing"
                        aria-label={`Drag to reorder within ${management.regionLabel ?? 'this region'}`}
                        disabled={management.disabled ?? false}
                        {...metadata.dragHandleProps}
                    >
                        <GripVertical className="size-3.5" />
                        <span className="sr-only">Drag to reorder block</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Drag to reorder within {management.regionLabel ?? 'this region'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export const blockDragReorderModule = defineAdminModule({
    key: 'block-drag-reorder',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['drag_reorder'],
    EditorComponent: BlockDragReorder,
    order: 10,
    description:
        'Renders the drag handle for same-region block reordering when the surface qualifies.',
});


