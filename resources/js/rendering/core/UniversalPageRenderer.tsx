import { cn } from '@/lib/utils';
import type {
    PageDescriptor,
    UniversalRegionDescriptor,
} from './descriptor-types';
import type { UniversalRegionSlot, UniversalRenderContext } from './render-context';
import { UniversalSectionRenderer } from './UniversalSectionRenderer';

type Props = {
    page: PageDescriptor;
};

const regionOrder: UniversalRegionSlot[] = ['main', 'rail', 'cms', 'footer'];

function getRegionsBySlot(
    regions: readonly UniversalRegionDescriptor[],
    slot: UniversalRegionSlot,
): UniversalRegionDescriptor[] {
    return regions.filter((region) => region.slot === slot);
}

function RenderRegion({
    region,
    renderContext,
}: {
    region: UniversalRegionDescriptor;
    renderContext: UniversalRenderContext;
}) {
    return (
        <div data-universal-region={region.key}>
            {region.sections.map((section) => (
                <UniversalSectionRenderer
                    key={section.id}
                    section={section}
                    renderContext={renderContext}
                />
            ))}
        </div>
    );
}

export function UniversalPageRenderer({ page }: Props) {
    const renderContext: UniversalRenderContext = {
        page: page.context,
    };

    const mainRegions = getRegionsBySlot(page.regions, 'main');
    const railRegions = getRegionsBySlot(page.regions, 'rail');

    if (
        page.layout.kind === 'editorial_grid' ||
        page.layout.kind === 'feature_with_rail'
    ) {
        return (
            <div
                className={cn(
                    'grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_19rem]',
                    page.layout.contentClassName,
                )}
                data-universal-page={page.context.pageKey}
            >
                <main className={cn('space-y-5', page.layout.mainClassName)}>
                    {mainRegions.map((region) => (
                        <RenderRegion
                            key={region.key}
                            region={region}
                            renderContext={renderContext}
                        />
                    ))}
                </main>

                {railRegions.length > 0 && (
                    <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                        {railRegions.map((region) => (
                            <RenderRegion
                                key={region.key}
                                region={region}
                                renderContext={renderContext}
                            />
                        ))}
                    </aside>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn('space-y-5', page.layout.contentClassName)}
            data-universal-page={page.context.pageKey}
        >
            {regionOrder.flatMap((slot) =>
                getRegionsBySlot(page.regions, slot).map((region) => (
                    <RenderRegion
                        key={region.key}
                        region={region}
                        renderContext={renderContext}
                    />
                )),
            )}
        </div>
    );
}
