import { Headphones } from 'lucide-react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
    recitations: VerseShowProps['recitations'];
};

const formatDuration = (durationSeconds: number | null): string | null => {
    if (durationSeconds === null || durationSeconds < 0) {
        return null;
    }

    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export function VerseRecitationsSection({ entityMeta, recitations }: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'recitations',
                capabilityHint: 'relationships',
            }}
            asChild
        >
            <VerseSupportPanel
                title="Recitations"
                eyebrow="Listen"
                icon={Headphones}
                contentClassName="space-y-3"
            >
                {recitations.map((recitation, index) => {
                    const mediaHref =
                        recitation.media?.url ?? recitation.media?.path ?? null;
                    const durationLabel = formatDuration(
                        recitation.duration_seconds,
                    );

                    return (
                        <ScriptureEntityRegion
                            key={recitation.id}
                            meta={{
                                entityType: 'verse_recitation',
                                entityId: recitation.id,
                                entityLabel: recitation.reciter_name,
                                region: 'recitation',
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
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="font-medium">
                                                {recitation.reciter_name}
                                            </span>
                                            {recitation.language_code && (
                                                <Badge variant="outline">
                                                    {recitation.language_code}
                                                </Badge>
                                            )}
                                            {recitation.style && (
                                                <Badge variant="secondary">
                                                    {recitation.style}
                                                </Badge>
                                            )}
                                            {durationLabel && (
                                                <Badge variant="outline">
                                                    {durationLabel}
                                                </Badge>
                                            )}
                                        </div>
                                        {recitation.media?.title && (
                                            <p className="text-sm text-[color:var(--chronicle-brown)]">
                                                {recitation.media.title}
                                            </p>
                                        )}
                                    </div>
                                    {mediaHref && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="chronicle-button-outline rounded-sm"
                                        >
                                            <a
                                                href={mediaHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Listen
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </ScriptureEntityRegion>
                    );
                })}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
