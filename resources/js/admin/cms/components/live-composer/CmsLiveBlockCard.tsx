import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CmsAdminBlock } from '@/types';
import { CmsDeleteActionButton } from '../CmsActionButtons';
import { CmsBlockRenderer } from '../CmsBlockRenderer';
import { CmsLiveBlockEditDialog } from './CmsLiveBlockEditDialog';

type Props = {
    block: CmsAdminBlock;
    returnTo: string;
};

export function CmsLiveBlockCard({ block, returnTo }: Props) {
    return (
        <div
            className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4"
            data-cms-live-block={block.id}
            data-cms-live-block-module={block.module_key}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {block.module_key.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">Block {block.sort_order}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <CmsLiveBlockEditDialog block={block} returnTo={returnTo} />
                    <CmsDeleteActionButton
                        href={block.destroy_href}
                        label="Delete"
                        confirmMessage="Delete this block from the current container?"
                        icon={Trash2}
                        size="sm"
                        data={{ return_to: returnTo }}
                    />
                </div>
            </div>

            <div className="pl-1">
                <CmsBlockRenderer block={block} />
            </div>
        </div>
    );
}
