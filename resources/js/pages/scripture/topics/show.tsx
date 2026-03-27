import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureCopySection } from '@/components/scripture/scripture-copy-section';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureRelatedVersesSection } from '@/components/scripture/scripture-related-verses-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, TopicShowProps } from '@/types';

export default function TopicShow({
    topic,
    related_verses,
    content_blocks,
}: TopicShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Topics',
            href: '/topics',
        },
        {
            title: topic.name,
            href: topic.href,
        },
    ];
    const topicEntity = {
        entityType: 'topic' as const,
        entityId: topic.id,
        entityLabel: topic.name,
    };

    return (
        <ScriptureLayout title={topic.name} breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                entityMeta={{
                    ...topicEntity,
                    region: 'page_intro',
                    capabilityHint: 'intro',
                }}
                badges={<Badge variant="outline">Topic</Badge>}
                title={topic.name}
            />

            <ScriptureCopySection
                title="Description"
                description="Public overview text attached directly to this topic."
                body={topic.description}
                preserveWhitespace
                entityMeta={{
                    ...topicEntity,
                    region: 'description',
                    capabilityHint: 'copy',
                }}
            />

            <ScriptureContentBlocksSection
                title="Topic Content"
                description="Published editorial blocks attached to this topic."
                blocks={content_blocks}
                entityMeta={{
                    ...topicEntity,
                    region: 'content_blocks',
                    capabilityHint: 'content_blocks',
                }}
            />

            <ScriptureRelatedVersesSection
                verses={related_verses}
                description="Verses associated with this topic in the public study data."
                emptyDescription="This topic is public, but no verse assignments are currently available for it."
                entityMeta={{
                    ...topicEntity,
                    region: 'related_verses',
                    capabilityHint: 'relationships',
                }}
            />
        </ScriptureLayout>
    );
}
