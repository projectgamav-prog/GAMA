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
    dictionaryTerms: VerseShowProps['dictionary_terms'];
};

export function VerseDictionaryTermsSection({
    entityMeta,
    dictionaryTerms,
}: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'dictionary_terms',
                capabilityHint: 'relationships',
            }}
            asChild
        >
            <VerseSupportPanel
                title="Dictionary Terms"
                eyebrow="Word Study"
                icon={Tag}
                contentClassName="space-y-3"
            >
                {dictionaryTerms.map((term, index) => {
                    const termLabel =
                        term.dictionary_entry?.headword ??
                        term.matched_text ??
                        'Untitled term';
                    const matchedText =
                        term.matched_text && term.matched_text !== termLabel
                            ? term.matched_text
                            : null;

                    return (
                        <ScriptureEntityRegion
                            key={term.id}
                            meta={{
                                entityType: 'verse_dictionary_term',
                                entityId: term.id,
                                entityLabel: termLabel,
                                region: 'dictionary_term',
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
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                    {term.dictionary_entry?.href ? (
                                        <Link
                                            href={term.dictionary_entry.href}
                                            className="inline-flex leading-none font-medium text-[color:var(--chronicle-ink)] underline-offset-4 hover:text-[color:var(--chronicle-gold)] hover:underline"
                                        >
                                            {termLabel}
                                        </Link>
                                    ) : (
                                        <p className="leading-none font-medium">
                                            {termLabel}
                                        </p>
                                    )}
                                    {term.dictionary_entry?.transliteration && (
                                        <p className="text-sm text-[color:var(--chronicle-brown)]">
                                            {
                                                term.dictionary_entry
                                                    .transliteration
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {term.language_code && (
                                        <Badge variant="outline">
                                            {term.language_code}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary">
                                        {term.match_type}
                                    </Badge>
                                </div>
                                {matchedText && (
                                    <p className="text-sm text-[color:var(--chronicle-brown)]">
                                        Matched in verse: {matchedText}
                                    </p>
                                )}
                                {term.dictionary_entry?.short_meaning && (
                                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                                        {term.dictionary_entry.short_meaning}
                                    </p>
                                )}
                            </div>
                        </ScriptureEntityRegion>
                    );
                })}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
