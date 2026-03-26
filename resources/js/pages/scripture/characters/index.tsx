import { ScriptureEmptyState } from '@/components/scripture/scripture-empty-state';
import { ScriptureLinkCard } from '@/components/scripture/scripture-link-card';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, CharactersIndexProps } from '@/types';

export default function CharactersIndex({ characters }: CharactersIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Characters',
            href: '/characters',
        },
    ];

    return (
        <ScriptureLayout title="Characters" breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Study Guide</Badge>
                        <Badge variant="secondary">
                            {`${characters.length} ${
                                characters.length === 1
                                    ? 'character'
                                    : 'characters'
                            }`}
                        </Badge>
                    </>
                }
                title="Characters"
                description="Browse key figures and open each character for a public overview and linked verses."
            />

            <ScriptureSection
                title="Available Characters"
                description="Explore the public character library in browse order."
            >
                {characters.length > 0 ? (
                    <div className="space-y-3">
                        {characters.map((character) => (
                            <ScriptureLinkCard
                                key={character.id}
                                href={character.href}
                                title={character.name}
                                description={character.description ?? undefined}
                                ctaLabel="Open character"
                                titleClassName="text-lg font-semibold"
                                entityMeta={{
                                    entityType: 'character',
                                    entityId: character.id,
                                    entityLabel: character.name,
                                    region: 'browse_card',
                                    capabilityHint: 'navigation',
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <ScriptureEmptyState
                        title="No Characters Yet"
                        description="Public characters will appear here once they are available for browsing."
                    />
                )}
            </ScriptureSection>
        </ScriptureLayout>
    );
}
