import { Sparkles } from 'lucide-react';
import type { ComponentProps } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import { Badge } from '@/components/ui/badge';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
    verseMeta: VerseShowProps['verse_meta'];
    metaBadges: string[];
    keywords: string[];
    studyFlags: string[];
    verseMetaSurface: ComponentProps<typeof AdminModuleHost>['surface'] | null;
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
            <VerseSupportPanel
                title="Study Notes"
                eyebrow="Verse Metadata"
                icon={Sparkles}
                contentClassName="space-y-3"
            >
                {verseMetaSurface && (
                    <AdminModuleHost
                        surface={verseMetaSurface}
                        className="chronicle-admin-surface flex flex-wrap items-center gap-1.5 p-1"
                    />
                )}

                {verseMeta?.summary_short && (
                    <div className="rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.06)] px-3 py-3">
                        <p className="text-sm leading-7">
                            {verseMeta.summary_short}
                        </p>
                    </div>
                )}

                {metaBadges.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="chronicle-kicker">Metadata</p>
                        <div className="flex flex-wrap gap-1.5">
                            {metaBadges.map((item) => (
                                <Badge key={item} variant="outline">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {keywords.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="chronicle-kicker">Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                            {keywords.map((keyword) => (
                                <Badge key={keyword} variant="secondary">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {studyFlags.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="chronicle-kicker">Flags</p>
                        <div className="flex flex-wrap gap-1.5">
                            {studyFlags.map((flag) => (
                                <Badge key={flag} variant="outline">
                                    {flag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
