import { Link } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
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
            <VerseSupportPanel
                title="Related Topics"
                eyebrow="Themes"
                icon={Tag}
                contentClassName="space-y-3"
            >
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
                                index > 0 &&
                                    'border-t border-[color:var(--chronicle-border)] pt-3',
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-1.5">
                                {assignment.topic?.href ? (
                                    <Link
                                        href={assignment.topic.href}
                                        className="font-medium text-[color:var(--chronicle-ink)] underline-offset-4 hover:text-[color:var(--chronicle-gold)] hover:underline"
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
                                <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                                    {assignment.notes}
                                </p>
                            )}
                        </div>
                    </ScriptureEntityRegion>
                ))}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
