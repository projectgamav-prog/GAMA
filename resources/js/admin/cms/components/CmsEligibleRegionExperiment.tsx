import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CmsContainerEdgeAdderZone } from './CmsCompositionAdders';

export function CmsEligibleRegionExperiment({
    title,
    description,
    regionKey,
}: {
    title: string;
    description: string;
    regionKey: string;
}) {
    return (
        <Card className="border-dashed border-border/70 bg-muted/10 shadow-none">
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Universal CMS Region</Badge>
                    <Badge variant="secondary">Experiment</Badge>
                </div>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm leading-6 text-muted-foreground">
                    This region is intentionally blank. It is mounted through
                    the universal CMS layer so we can test content-aware adders
                    on a canonical page without mutating canonical structure.
                </div>

                <CmsContainerEdgeAdderZone
                    actionHref={null}
                    formKeyPrefix={`eligible-region-${regionKey}`}
                    insertionMode="end"
                    relativeContainerId={null}
                    isBlankRegion
                />
            </CardContent>
        </Card>
    );
}
