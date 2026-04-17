import { Layers3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { CmsPage } from '@/types';

type Props = {
    page: CmsPage;
    mode: 'workspace' | 'live';
};

export function CmsWorkspaceStatusCard({ page, mode }: Props) {
    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">CMS Composition</Badge>
                    <Badge variant="secondary">
                        {page.container_count} containers
                    </Badge>
                    <Badge variant="secondary">
                        {page.block_count} blocks
                    </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                    <Layers3 className="size-5" />
                    {mode === 'live'
                        ? 'Live Page Composition'
                        : 'Page Containers and Blocks'}
                </CardTitle>
                <CardDescription>
                    {mode === 'live'
                        ? 'Compose this published page in place. Create a new container when content should become a new card or layout section, and add a block inside a container when the content belongs in the same card.'
                        : 'Pages own ordered containers, and containers own ordered blocks. This workspace mirrors that structure for support editing, while routine composition should stay on the real page layout when available.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
                <p>
                    This structure is what gives the CMS clean placement
                    control: above a card, below a card, inside a card, and
                    between blocks inside the same card.
                </p>
                <p>
                    {mode === 'live'
                        ? 'These controls now appear directly on the live page for permitted users instead of forcing record-hunting through the dashboard first.'
                        : 'Use this support view for management and utility edits without turning it into a separate builder shell.'}
                </p>
            </CardContent>
        </Card>
    );
}
