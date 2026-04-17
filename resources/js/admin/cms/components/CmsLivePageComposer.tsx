import type {
    CmsAdminContainer,
    CmsPage,
    CmsPublicContainer,
} from '@/types';
import {
    CmsContainerEdgeAdderZone,
} from './CmsCompositionAdders';
import { CmsContainerRenderer } from './CmsContainerRenderer';
import { CmsLiveContainerCard } from './live-composer/CmsLiveContainerCard';

type Props = {
    page: CmsPage;
    containers: CmsAdminContainer[];
    returnTo?: string;
};

export function CmsLivePageComposer({
    page,
    containers,
    returnTo,
}: Props) {
    const redirectTarget = returnTo ?? page.public_href;

    if (containers.length === 0) {
        return (
            <CmsContainerEdgeAdderZone
                actionHref={page.container_store_href}
                formKeyPrefix="live-page-container-empty"
                insertionMode="end"
                relativeContainerId={null}
                isBlankRegion
                compact
                returnTo={redirectTarget}
            />
        );
    }

    return (
        <div className="space-y-6">
            {containers.map((container) => (
                <CmsLiveContainerCard
                    key={container.id}
                    container={container}
                    returnTo={redirectTarget}
                />
            ))}
        </div>
    );
}

export function CmsPublicContainerStack({
    containers,
}: {
    containers: CmsPublicContainer[];
}) {
    if (containers.length === 0) {
        return (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/85 p-8 text-sm leading-7 text-muted-foreground">
                This page is published, but it does not have any containers yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {containers.map((container) => (
                <CmsContainerRenderer
                    key={container.id}
                    container={container}
                />
            ))}
        </div>
    );
}
