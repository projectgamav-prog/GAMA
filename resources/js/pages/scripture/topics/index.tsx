import { ScriptureEmptyState } from '@/components/scripture/scripture-empty-state';
import { ScriptureLinkCard } from '@/components/scripture/scripture-link-card';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, TopicsIndexProps } from '@/types';

export default function TopicsIndex({ topics }: TopicsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Topics',
            href: '/topics',
        },
    ];

    return (
        <ScriptureLayout title="Topics" breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Study Guide</Badge>
                        <Badge variant="secondary">
                            {`${topics.length} ${
                                topics.length === 1 ? 'topic' : 'topics'
                            }`}
                        </Badge>
                    </>
                }
                title="Topics"
                description="Browse recurring themes and open each topic for its public overview and linked verses."
            />

            <ScriptureSection
                title="Available Topics"
                description="Explore the public topic library in browse order."
            >
                {topics.length > 0 ? (
                    <div className="space-y-3">
                        {topics.map((topic) => (
                            <ScriptureLinkCard
                                key={topic.id}
                                href={topic.href}
                                title={topic.name}
                                description={topic.description ?? undefined}
                                ctaLabel="Open topic"
                                titleClassName="text-lg font-semibold"
                            />
                        ))}
                    </div>
                ) : (
                    <ScriptureEmptyState
                        title="No Topics Yet"
                        description="Public topics will appear here once they are available for browsing."
                    />
                )}
            </ScriptureSection>
        </ScriptureLayout>
    );
}
