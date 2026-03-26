import { chapterLabel, verseLabel } from '@/lib/scripture';
import type {
    ScriptureEntityRegionInput,
    ScriptureRelatedVerse,
} from '@/types/scripture';
import { ScriptureEmptyState } from './scripture-empty-state';
import { ScriptureLinkCard } from './scripture-link-card';
import { ScriptureSection } from './scripture-section';

type Props = {
    verses: ScriptureRelatedVerse[];
    description: string;
    emptyDescription: string;
    emptyTitle?: string;
    entityMeta?: ScriptureEntityRegionInput;
};

export function ScriptureRelatedVersesSection({
    verses,
    description,
    emptyDescription,
    emptyTitle = 'No Related Verses Yet',
    entityMeta,
}: Props) {
    return (
        <ScriptureSection
            title="Related Verses"
            description={description}
            entityMeta={entityMeta}
        >
            {verses.length > 0 ? (
                <div className="space-y-3">
                    {verses.map((verse) => (
                        <ScriptureLinkCard
                            key={verse.id}
                            href={verse.href}
                            title={`${chapterLabel(verse.chapter_number, null)} - ${verseLabel(verse.number)}`}
                            meta={
                                <p className="text-sm text-muted-foreground">
                                    {verse.book_slug} / {verse.chapter_slug} /{' '}
                                    {verse.slug}
                                </p>
                            }
                            ctaLabel="Open verse"
                            entityMeta={{
                                entityType: 'verse',
                                entityId: verse.id,
                                entityLabel: verseLabel(verse.number),
                                region: 'related_verse',
                                capabilityHint: 'relationships',
                            }}
                        />
                    ))}
                </div>
            ) : (
                <ScriptureEmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                />
            )}
        </ScriptureSection>
    );
}
