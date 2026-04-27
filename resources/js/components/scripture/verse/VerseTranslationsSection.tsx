import { Languages } from 'lucide-react';
import type { ComponentProps } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseSupportPanel } from '@/components/scripture/verse/VerseSupportPanel';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: Omit<ScriptureEntityRegionInput, 'region' | 'capabilityHint'>;
    translations: VerseShowProps['translations'];
    translationsSurface:
        | ComponentProps<typeof AdminModuleHost>['surface']
        | null;
};

export function VerseTranslationsSection({
    entityMeta,
    translations,
    translationsSurface,
}: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'translations',
                capabilityHint: 'translation',
            }}
            asChild
        >
            <VerseSupportPanel
                title="Translations"
                eyebrow="Parallel Readings"
                icon={Languages}
                action={
                    <span className="chronicle-link text-xs">
                        {translations.length} translation
                        {translations.length === 1 ? '' : 's'}
                    </span>
                }
                contentClassName="space-y-0 divide-y divide-[color:var(--chronicle-border)]"
            >
                {translationsSurface && (
                    <AdminModuleHost
                        surface={translationsSurface}
                        className="chronicle-admin-surface mb-3 flex flex-wrap items-start gap-1.5 p-1"
                    />
                )}

                {translations.length === 0 && translationsSurface && (
                    <div className="rounded-sm border border-dashed border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.06)] px-4 py-3 text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        No translations have been added yet.
                    </div>
                )}

                {translations.map((translation) => (
                    <ScriptureEntityRegion
                        key={translation.id}
                        meta={{
                            entityType: 'verse_translation',
                            entityId: translation.id,
                            entityLabel: translation.source_name,
                            region: 'translation_card',
                            capabilityHint: 'translation',
                        }}
                        asChild
                    >
                        <article className="grid gap-3 py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
                            <div>
                                <p className="chronicle-kicker">
                                    {translation.source_key}
                                </p>
                                <p className="font-semibold text-[color:var(--chronicle-ink)]">
                                    {translation.source_name}
                                </p>
                                <p className="text-xs tracking-[0.16em] text-[color:var(--chronicle-brown)] uppercase">
                                    {translation.language_code}
                                </p>
                            </div>
                            <p className="font-serif text-lg leading-8 text-[color:var(--chronicle-ink)]">
                                {translation.text}
                            </p>
                        </article>
                    </ScriptureEntityRegion>
                ))}
            </VerseSupportPanel>
        </ScriptureEntityRegion>
    );
}
