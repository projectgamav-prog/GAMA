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
            <Card>
                <CardHeader className="gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Tag className="size-5" />
                        Dictionary Terms
                    </CardTitle>
                    <CardDescription>
                        Linked study terms matched to this verse.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                        'space-y-3',
                                        index > 0 && 'border-t pt-4',
                                    )}
                                >
                                    <div className="space-y-1">
                                        {term.dictionary_entry?.href ? (
                                            <Link
                                                href={term.dictionary_entry.href}
                                                className="inline-flex leading-none font-medium underline-offset-4 hover:text-primary hover:underline"
                                            >
                                                {termLabel}
                                            </Link>
                                        ) : (
                                            <p className="leading-none font-medium">
                                                {termLabel}
                                            </p>
                                        )}
                                        {term.dictionary_entry?.transliteration && (
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    term.dictionary_entry
                                                        .transliteration
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
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
                                        <p className="text-sm text-muted-foreground">
                                            Matched in verse: {matchedText}
                                        </p>
                                    )}
                                    {term.dictionary_entry?.short_meaning && (
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {
                                                term.dictionary_entry
                                                    .short_meaning
                                            }
                                        </p>
                                    )}
                                </div>
                            </ScriptureEntityRegion>
                        );
                    })}
                </CardContent>
            </Card>
        </ScriptureEntityRegion>
    );
}
