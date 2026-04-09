import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PublicContentBlock } from '@/types/content-blocks';
import { ScriptureEntityRegion } from './scripture-entity-region';

type Props = {
    block: PublicContentBlock;
    headerAction?: ReactNode;
    inlineEditor?: ReactNode;
};

const getDataValue = (
    data: Record<string, unknown> | null,
    key: string,
): string | null => {
    if (!data) {
        return null;
    }

    const value = data[key];

    return typeof value === 'string' && value.length > 0 ? value : null;
};

export function ContentBlockRenderer({
    block,
    headerAction,
    inlineEditor,
}: Props) {
    const mediaUrl = getDataValue(block.data_json, 'url');
    const altText = getDataValue(block.data_json, 'alt');
    const caption = getDataValue(block.data_json, 'caption');
    const poster = getDataValue(block.data_json, 'poster');
    const entityMeta = {
        entityType: 'content_block' as const,
        entityId: block.id,
        entityLabel: block.title ?? block.region,
        region: block.region,
        capabilityHint: 'content_block',
    };

    const renderCard = (card: ReactNode) => (
        <ScriptureEntityRegion meta={entityMeta} asChild>
            {card}
        </ScriptureEntityRegion>
    );

    if (block.block_type === 'quote') {
        return renderCard(
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Quote</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {block.title && <CardTitle>{block.title}</CardTitle>}
                </CardHeader>
                {block.body && (
                    <CardContent>
                        <blockquote className="text-lg leading-8 italic">
                            {block.body}
                        </blockquote>
                    </CardContent>
                )}
            </Card>,
        );
    }

    if (block.block_type === 'image') {
        return renderCard(
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Image</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {block.title && <CardTitle>{block.title}</CardTitle>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {mediaUrl && (
                        <img
                            src={mediaUrl}
                            alt={altText ?? block.title ?? 'Scripture image'}
                            className="w-full rounded-lg border object-cover"
                        />
                    )}
                    {(block.body ?? caption) && (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {block.body ?? caption}
                        </p>
                    )}
                </CardContent>
            </Card>,
        );
    }

    if (block.block_type === 'video') {
        return renderCard(
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Video</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {block.title && <CardTitle>{block.title}</CardTitle>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {mediaUrl && (
                        <video
                            controls
                            className="w-full rounded-lg border"
                            poster={poster ?? undefined}
                            src={mediaUrl}
                        />
                    )}
                    {block.body && (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {block.body}
                        </p>
                    )}
                </CardContent>
            </Card>,
        );
    }

    return renderCard(
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.region}</Badge>
                        <Badge variant="secondary">Text</Badge>
                    </div>
                    {headerAction}
                </div>
                {!inlineEditor && block.title && (
                    <CardTitle>{block.title}</CardTitle>
                )}
            </CardHeader>
            {inlineEditor ? (
                <CardContent>
                    {inlineEditor}
                </CardContent>
            ) : block.body ? (
                <CardContent>
                    <p className="leading-7 text-muted-foreground">
                        {block.body}
                    </p>
                </CardContent>
            ) : null}
        </Card>,
    );
}
