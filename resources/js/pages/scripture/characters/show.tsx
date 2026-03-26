import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureCopySection } from '@/components/scripture/scripture-copy-section';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureRelatedVersesSection } from '@/components/scripture/scripture-related-verses-section';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BreadcrumbItem, CharacterShowProps } from '@/types';

export default function CharacterShow({
    character,
    related_verses,
    content_blocks,
}: CharacterShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Characters',
            href: '/characters',
        },
        {
            title: character.name,
            href: character.href,
        },
    ];

    return (
        <ScriptureLayout title={character.name} breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                badges={<Badge variant="outline">Character</Badge>}
                title={character.name}
            />

            <ScriptureCopySection
                title="Description"
                description="Public overview text attached directly to this character."
                body={character.description}
                preserveWhitespace
            />

            <ScriptureContentBlocksSection
                title="Character Content"
                description="Published editorial blocks attached to this character."
                blocks={content_blocks}
            />

            <ScriptureRelatedVersesSection
                verses={related_verses}
                description="Verses associated with this character in the public study data."
                emptyDescription="This character is public, but no verse assignments are currently available for it."
            />
        </ScriptureLayout>
    );
}
