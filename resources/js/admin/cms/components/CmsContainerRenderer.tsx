import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CmsAdminBlock, CmsAdminContainer, CmsPublicBlock, CmsPublicContainer } from '@/types';
import { CmsBlockRenderer } from './CmsBlockRenderer';

type RenderableContainer = {
    id: number;
    label: string | null;
    container_type: string;
    sort_order: number;
    blocks: Array<CmsAdminBlock | CmsPublicBlock>;
};

type Props = {
    container: RenderableContainer | CmsAdminContainer | CmsPublicContainer;
    mode?: 'admin' | 'public';
};

export function CmsContainerRenderer({
    container,
    mode = 'public',
}: Props) {
    const isCard = container.container_type === 'card';

    return (
        <section
            className={cn(
                'space-y-5',
                isCard
                    ? 'rounded-[1.75rem] border border-border/70 bg-background/85 p-6 shadow-sm'
                    : 'rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 p-6',
            )}
        >
            {(mode === 'admin' || container.label) && (
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isCard ? 'secondary' : 'outline'}>
                        {isCard ? 'Card container' : 'Section container'}
                    </Badge>
                    {container.label && (
                        <p className="text-sm font-medium text-foreground">
                            {container.label}
                        </p>
                    )}
                </div>
            )}

            {container.blocks.length > 0 ? (
                <div className="space-y-5">
                    {container.blocks.map((block) => (
                        <CmsBlockRenderer
                            key={block.id}
                            block={block}
                            mode={mode}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-5 text-sm text-muted-foreground">
                    This container does not contain any blocks yet.
                </div>
            )}
        </section>
    );
}
