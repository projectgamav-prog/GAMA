import { ScriptureCopySection } from '@/components/scripture/scripture-copy-section';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureRelatedVersesSection } from '@/components/scripture/scripture-related-verses-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, DictionaryEntryShowProps } from '@/types';

export default function DictionaryEntryShow({
    dictionary_entry,
    related_verses,
}: DictionaryEntryShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dictionary',
            href: '/dictionary',
        },
        {
            title: dictionary_entry.headword,
            href: dictionary_entry.href,
        },
    ];

    return (
        <ScriptureLayout
            title={dictionary_entry.headword}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Dictionary Entry</Badge>
                        {dictionary_entry.entry_type && (
                            <Badge variant="secondary">
                                {dictionary_entry.entry_type}
                            </Badge>
                        )}
                    </>
                }
                title={dictionary_entry.headword}
                description={
                    dictionary_entry.transliteration ? (
                        <span className="italic">
                            {dictionary_entry.transliteration}
                        </span>
                    ) : undefined
                }
                contentClassName="pt-0"
            >
                {dictionary_entry.root_headword && (
                    <p className="text-sm text-muted-foreground">
                        Root headword:{' '}
                        <span className="font-medium text-foreground">
                            {dictionary_entry.root_headword}
                        </span>
                    </p>
                )}
            </ScripturePageIntroCard>

            <ScriptureCopySection
                title="Meaning"
                description="Primary public meaning attached to this term."
                body={dictionary_entry.meaning}
            />

            <ScriptureCopySection
                title="Explanation"
                description="Additional editorial notes published for this entry."
                body={dictionary_entry.explanation}
                preserveWhitespace
            />

            <ScriptureRelatedVersesSection
                verses={related_verses}
                description="Verses where this dictionary term appears in the study companion data."
                emptyDescription="This term is public, but no verse dictionary assignments are currently available for it."
            />
        </ScriptureLayout>
    );
}
