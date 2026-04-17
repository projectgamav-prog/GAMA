import {
    Card,
    CardContent,
} from '@/components/ui/card';
import type {
    CmsAdminContainer,
    CmsPage,
} from '@/types';
import {
    CmsContainerEdgeAdderZone,
} from '../components/CmsCompositionAdders';
import { CmsWorkspaceContainerEditorCard } from './editor/CmsWorkspaceContainerEditorCard';
import { CmsWorkspaceStatusCard } from './editor/CmsWorkspaceStatusCard';

type Props = {
    page: CmsPage;
    containers: CmsAdminContainer[];
    mode?: 'workspace' | 'live';
};

export function CmsCompositionEditor({
    page,
    containers,
    mode = 'workspace',
}: Props) {
    return (
        <div className="space-y-6">
            <CmsWorkspaceStatusCard page={page} mode={mode} />

            <CmsContainerEdgeAdderZone
                actionHref={page.container_store_href}
                formKeyPrefix={
                    containers.length > 0
                        ? 'page-container-edge-start'
                        : 'page-container-edge-empty'
                }
                insertionMode={containers.length > 0 ? 'start' : 'end'}
                relativeContainerId={null}
                isBlankRegion={containers.length === 0}
            />

            {containers.length > 0 ? (
                <div className="space-y-6">
                    {containers.map((container) => (
                        <div key={container.id} className="space-y-6">
                            <CmsWorkspaceContainerEditorCard container={container} />
                            <CmsContainerEdgeAdderZone
                                actionHref={page.container_store_href}
                                formKeyPrefix={`page-container-edge-after-${container.id}`}
                                insertionMode="after"
                                relativeContainerId={container.id}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
                    <CardContent className="pt-6">
                        <p className="text-sm leading-6 text-muted-foreground">
                            This page does not have any containers yet. Create
                            the first container above, then compose inside it
                            with rich text, button groups, or media blocks.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
