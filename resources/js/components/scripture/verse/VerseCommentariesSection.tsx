import type { ComponentProps } from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: ScriptureEntityRegionInput;
    commentaries: VerseShowProps['commentaries'];
    commentariesSurface: ComponentProps<typeof AdminModuleHost>['surface'];
};

export function VerseCommentariesSection({
    entityMeta,
    commentaries,
    commentariesSurface,
}: Props) {
    return (
        <ScriptureSection
            entityMeta={{
                ...entityMeta,
                region: 'commentaries',
                capabilityHint: 'commentary',
            }}
            title="Commentaries"
            description="Editorial commentary and source material attached directly to this verse."
            icon={MessageSquareQuote}
            action={
                <Badge variant="outline">
                    {commentaries.length} commentary
                    {commentaries.length === 1 ? '' : 's'}
                </Badge>
            }
        >
            <div className="space-y-4">
                {commentariesSurface && (
                    <AdminModuleHost
                        surface={commentariesSurface}
                        className="flex flex-wrap items-start gap-1.5"
                    />
                )}

                {commentaries.length === 0 && commentariesSurface && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                        No commentaries have been added yet.
                    </div>
                )}

                {commentaries.map((commentary) => (
                    <ScriptureEntityRegion
                        key={commentary.id}
                        meta={{
                            entityType: 'verse_commentary',
                            entityId: commentary.id,
                            entityLabel:
                                commentary.title ?? commentary.source_name,
                            region: 'commentary_card',
                            capabilityHint: 'commentary',
                        }}
                        asChild
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="gap-3 border-b bg-muted/20">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {commentary.language_code}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {commentary.author_name ??
                                            commentary.source_name}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">
                                    {commentary.title ??
                                        commentary.source_name}
                                </CardTitle>
                                <CardDescription>
                                    <span>{commentary.source_name}</span>
                                    {commentary.source_key && (
                                        <span>
                                            {' '}
                                            - Source key:{' '}
                                            {commentary.source_key}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquareQuote className="size-4" />
                                    <span>Commentary</span>
                                </div>
                                <p className="leading-8">{commentary.body}</p>
                            </CardContent>
                        </Card>
                    </ScriptureEntityRegion>
                ))}
            </div>
        </ScriptureSection>
    );
}
