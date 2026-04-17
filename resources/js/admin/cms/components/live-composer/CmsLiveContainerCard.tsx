import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CmsAdminContainer } from '@/types';
import { CmsDeleteActionButton } from '../CmsActionButtons';
import {
    CmsInsideContainerAdderZone,
} from '../CmsCompositionAdders';
import { CmsLiveBlockCard } from './CmsLiveBlockCard';
import { CmsLiveContainerEditDialog } from './CmsLiveContainerEditDialog';

type Props = {
    container: CmsAdminContainer;
    returnTo: string;
};

export function CmsLiveContainerCard({ container, returnTo }: Props) {
    return (
        <section className="space-y-4 rounded-[1.75rem] border border-border/70 bg-background/85 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant={
                            container.container_type === 'card'
                                ? 'secondary'
                                : 'outline'
                        }
                    >
                        {container.container_type === 'card'
                            ? 'Card container'
                            : 'Section container'}
                    </Badge>
                    <Badge variant="outline">
                        Container {container.sort_order}
                    </Badge>
                    {container.label && (
                        <p className="text-sm font-medium text-foreground">
                            {container.label}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <CmsLiveContainerEditDialog
                        container={container}
                        returnTo={returnTo}
                    />
                    <CmsDeleteActionButton
                        href={container.destroy_href}
                        label="Delete"
                        confirmMessage="Delete this container and every block inside it?"
                        icon={Trash2}
                        size="sm"
                        data={{ return_to: returnTo }}
                    />
                </div>
            </div>

            <CmsInsideContainerAdderZone
                actionHref={container.block_store_href}
                formKeyPrefix={`live-container-${container.id}-top`}
                insertionMode="start"
                relativeBlockId={null}
                placementLabel="Top of card"
                compact
                returnTo={returnTo}
            />

            {container.blocks.length > 0 ? (
                <div className="space-y-4">
                    {container.blocks.map((block) => (
                        <CmsLiveBlockCard
                            key={block.id}
                            block={block}
                            returnTo={returnTo}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-5 text-sm text-muted-foreground">
                    This container does not contain any blocks yet.
                </div>
            )}

            <CmsInsideContainerAdderZone
                actionHref={container.block_store_href}
                formKeyPrefix={`live-container-${container.id}-bottom`}
                insertionMode="after"
                relativeBlockId={
                    container.blocks[container.blocks.length - 1]?.id ?? null
                }
                placementLabel="Bottom of card"
                compact
                returnTo={returnTo}
            />
        </section>
    );
}
