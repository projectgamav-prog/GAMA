import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScriptureContentBlock } from '@/types/scripture';

type Props = {
    block: ScriptureContentBlock;
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

export function ContentBlockRenderer({ block }: Props) {
    const mediaUrl = getDataValue(block.data_json, 'url');
    const altText = getDataValue(block.data_json, 'alt');
    const caption = getDataValue(block.data_json, 'caption');
    const poster = getDataValue(block.data_json, 'poster');

    if (block.block_type === 'quote') {
        return (
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.region}</Badge>
                        <Badge variant="secondary">Quote</Badge>
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
            </Card>
        );
    }

    if (block.block_type === 'image') {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.region}</Badge>
                        <Badge variant="secondary">Image</Badge>
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
            </Card>
        );
    }

    if (block.block_type === 'video') {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.region}</Badge>
                        <Badge variant="secondary">Video</Badge>
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
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{block.region}</Badge>
                    <Badge variant="secondary">Text</Badge>
                </div>
                {block.title && <CardTitle>{block.title}</CardTitle>}
            </CardHeader>
            {block.body && (
                <CardContent>
                    <p className="leading-7 text-muted-foreground">
                        {block.body}
                    </p>
                </CardContent>
            )}
        </Card>
    );
}
