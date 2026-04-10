import type { CmsExposedRegion as CmsExposedRegionPayload } from '@/types';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import { CmsContainerEdgeAdderZone } from './CmsCompositionAdders';
import {
    CmsLivePageComposer,
    CmsPublicContainerStack,
} from './CmsLivePageComposer';

export function CmsExposedRegion({
    region,
}: {
    region: CmsExposedRegionPayload;
}) {
    const showAdminControls = useVisibleAdminControls();

    if (showAdminControls && region.admin) {
        if (region.admin.page) {
            return (
                <CmsLivePageComposer
                    page={region.admin.page}
                    containers={region.admin.containers}
                    returnTo={region.admin.return_to}
                />
            );
        }

        return (
            <CmsContainerEdgeAdderZone
                actionHref={region.admin.bootstrap_store_href}
                formKeyPrefix={`exposed-region-${region.key}`}
                insertionMode="end"
                relativeContainerId={null}
                isBlankRegion
                compact
                returnTo={region.admin.return_to}
            />
        );
    }

    if (region.containers.length === 0) {
        return null;
    }

    return <CmsPublicContainerStack containers={region.containers} />;
}
