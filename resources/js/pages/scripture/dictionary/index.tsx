import { ScriptureEmptyState } from '@/components/scripture/scripture-empty-state';
import { ScriptureLinkCard } from '@/components/scripture/scripture-link-card';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, DictionaryIndexProps } from '@/types';

export default function DictionaryIndex({
    dictionary_entries,
}: DictionaryIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dictionary',
            href: '/dictionary',
        },
    ];

    return (
        <ScriptureLayout title="Dictionary" breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Reference</Badge>
                        <Badge variant="secondary">
                            {`${dictionary_entries.length} ${
                                dictionary_entries.length === 1
                                    ? 'entry'
                                    : 'entries'
                            }`}
                        </Badge>
                    </>
                }
                title="Dictionary"
                description="Browse published scripture terms and open each entry for fuller meaning and verse context."
            />

            <ScriptureSection
                title="Entries"
                description="Public dictionary entries ordered for steady browsing."
            >
                {dictionary_entries.length > 0 ? (
                    <div className="space-y-3">
                        {dictionary_entries.map((entry) => (
                            <ScriptureLinkCard
                                key={entry.id}
                                href={entry.href}
                                title={entry.headword}
                                meta={
                                    <>
                                        {entry.transliteration && (
                                            <p className="text-sm text-muted-foreground italic">
                                                {entry.transliteration}
                                            </p>
                                        )}
                                        {entry.root_headword && (
                                            <p className="text-sm text-muted-foreground">
                                                Root headword:{' '}
                                                <span className="font-medium text-foreground">
                                                    {entry.root_headword}
                                                </span>
                                            </p>
                                        )}
                                    </>
                                }
                                description={entry.short_meaning ?? undefined}
                                ctaLabel="Open entry"
                                titleClassName="text-lg font-semibold"
                            />
                        ))}
                    </div>
                ) : (
                    <ScriptureEmptyState
                        title="No Public Entries Yet"
                        description="Published dictionary entries will appear here once they are available for browsing."
                    />
                )}
            </ScriptureSection>
        </ScriptureLayout>
    );
}
