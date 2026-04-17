import { Link } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: ScriptureEntityRegionInput;
    topics: VerseShowProps['topics'];
};

export function VerseTopicsSection({ entityMeta, topics }: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'related_topics',
                capabilityHint: 'relationships',
            }}
            asChild
        >
            <Card>
                <CardHeader className="gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Tag className="size-5" />
                        Related Topics
                    </CardTitle>
                    <CardDescription>
                        Editorial topic links associated with this verse.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {topics.map((assignment, index) => (
                        <ScriptureEntityRegion
                            key={assignment.id}
                            meta={{
                                entityType: 'verse_topic_assignment',
                                entityId: assignment.id,
                                entityLabel:
                                    assignment.topic?.name ?? 'Untitled topic',
                                region: 'topic_assignment',
                                capabilityHint: 'relationships',
                            }}
                            asChild
                        >
                            <div
                                className={cn(
                                    'space-y-2',
                                    index > 0 && 'border-t pt-4',
                                )}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {assignment.topic?.href ? (
                                        <Link
                                            href={assignment.topic.href}
                                            className="font-medium underline-offset-4 hover:text-primary hover:underline"
                                        >
                                            {assignment.topic.name}
                                        </Link>
                                    ) : (
                                        <span className="font-medium">
                                            {assignment.topic?.name ??
                                                'Untitled topic'}
                                        </span>
                                    )}
                                    {assignment.weight !== null && (
                                        <Badge variant="outline">
                                            Weight {assignment.weight}
                                        </Badge>
                                    )}
                                </div>
                                {assignment.notes && (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {assignment.notes}
                                    </p>
                                )}
                            </div>
                        </ScriptureEntityRegion>
                    ))}
                </CardContent>
            </Card>
        </ScriptureEntityRegion>
    );
}
