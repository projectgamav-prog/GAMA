import type { ComponentProps } from 'react';
import { Sparkles } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
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
    verseMeta: VerseShowProps['verse_meta'];
    metaBadges: string[];
    keywords: string[];
    studyFlags: string[];
    verseMetaSurface: ComponentProps<typeof AdminModuleHost>['surface'];
};

export function VerseStudyNotesSection({
    entityMeta,
    verseMeta,
    metaBadges,
    keywords,
    studyFlags,
    verseMetaSurface,
}: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'verse_notes',
                capabilityHint: 'relationships',
            }}
            asChild
        >
            <Card>
                <CardHeader className="gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="size-5" />
                        Study Notes
                    </CardTitle>
                    <CardDescription>
                        Compact verse-level study metadata and editorial cues.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {verseMetaSurface && (
                        <AdminModuleHost
                            surface={verseMetaSurface}
                            className="flex flex-wrap items-center gap-1.5"
                        />
                    )}

                    {verseMeta?.summary_short && (
                        <div className="rounded-xl bg-muted/30 px-4 py-4">
                            <p className="text-sm leading-7">
                                {verseMeta.summary_short}
                            </p>
                        </div>
                    )}

                    {metaBadges.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Verse Metadata
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {metaBadges.map((item) => (
                                    <Badge key={item} variant="outline">
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {keywords.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Keywords
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {studyFlags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Study Flags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {studyFlags.map((flag) => (
                                    <Badge key={flag} variant="outline">
                                        {flag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </ScriptureEntityRegion>
    );
}
