import { MessageSquareQuote } from 'lucide-react';
import type { ComponentProps } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
    commentaries: VerseShowProps['commentaries'];
    commentariesSurface:
        | ComponentProps<typeof AdminModuleHost>['surface']
        | null;
};

export function VerseCommentariesSection({
    entityMeta,
    commentaries,
    commentariesSurface,
}: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'commentaries',
                capabilityHint: 'commentary',
            }}
            asChild
        >
            <VerseSupportPanel
                title="Commentary"
                eyebrow="Annotations"
                icon={MessageSquareQuote}
                action={
                    <span className="chronicle-link text-xs">
                        {commentaries.length} commentary
                        {commentaries.length === 1 ? '' : 's'}
                    </span>
                }
                contentClassName="space-y-0 divide-y divide-[color:var(--chronicle-border)]"
            >
                {commentariesSurface && (
                    <AdminModuleHost
                        surface={commentariesSurface}
                        className="chronicle-admin-surface mb-3 flex flex-wrap items-start gap-1.5 p-1"
                    />
                )}

                {commentaries.length === 0 && commentariesSurface && (
                    <div className="rounded-sm border border-dashed border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.06)] px-4 py-3 text-sm leading-6 text-[color:var(--chronicle-brown)]">
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
                        <article className="space-y-3 py-4">
                            <div>
                                <p className="chronicle-kicker">
                                    {commentary.source_key ||
                                        commentary.language_code}
                                </p>
                                <h3 className="font-serif text-xl leading-7 text-[color:var(--chronicle-ink)]">
                                    {commentary.title ?? commentary.source_name}
                                </h3>
                                <p className="text-sm text-[color:var(--chronicle-brown)]">
                                    {commentary.author_name ??
                                        commentary.source_name}
                                </p>
                            </div>
                            <p className="leading-7 text-[color:var(--chronicle-ink)]">
                                {commentary.body}
                            </p>
                        </article>
                    </ScriptureEntityRegion>
                ))}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
