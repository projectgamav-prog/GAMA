import { Badge } from '@/components/ui/badge';
import type {
    ScriptureCommentarySourceOption,
    ScriptureTranslationSourceOption,
} from '@/types';

type SourceOption =
    | ScriptureTranslationSourceOption
    | ScriptureCommentarySourceOption;

type Props = {
    source: SourceOption | null;
    emptyMessage: string;
};

export function VerseRelationSourceSummary({ source, emptyMessage }: Props) {
    if (!source) {
        return (
            <div className="rounded-xl border border-dashed border-border/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{source.name}</Badge>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {source.slug}
                </Badge>
                {source.language_code && (
                    <Badge variant="outline">{source.language_code}</Badge>
                )}
                <Badge variant="outline">
                    {source.is_published ? 'published' : 'unpublished'}
                </Badge>
            </div>

            <div className="mt-3 space-y-1 text-sm leading-6 text-muted-foreground">
                {source.short_name && <p>Short name: {source.short_name}</p>}
                {source.author_name && <p>Author: {source.author_name}</p>}
                {source.tradition && <p>Tradition: {source.tradition}</p>}
                {source.description && <p>{source.description}</p>}
                {source.website_url && (
                    <p className="break-all">Website: {source.website_url}</p>
                )}
            </div>
        </div>
    );
}
