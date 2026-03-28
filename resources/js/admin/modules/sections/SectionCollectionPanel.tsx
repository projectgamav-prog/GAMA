import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    BOOK_CHAPTER_GROUPS_SURFACE_KEY,
    CHAPTER_VERSE_GROUPS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import { getSectionCollectionMetadata } from '@/admin/surfaces/sections/surface-types';

function formatCountLabel(count: number, label: string): string {
    const singularLabel = label.endsWith('s') ? label.slice(0, -1) : label;

    return `${count} ${count === 1 ? singularLabel : label}`;
}

function SectionCollectionPanel({ surface }: AdminModuleComponentProps) {
    const metadata = getSectionCollectionMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <>
            <Badge variant="outline">{metadata.title}</Badge>
            <Badge variant="secondary">
                {formatCountLabel(metadata.groupCount, metadata.groupLabel)}
            </Badge>
            <Badge variant="secondary">
                {formatCountLabel(metadata.itemCount, metadata.itemLabel)}
            </Badge>
            {metadata.openHref && metadata.openLabel && (
                <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3">
                    <Link href={metadata.openHref}>{metadata.openLabel}</Link>
                </Button>
            )}
            {metadata.structureHref && metadata.structureLabel && (
                <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3">
                    <Link href={metadata.structureHref}>
                        {metadata.structureLabel}
                    </Link>
                </Button>
            )}
        </>
    );
}

export const sectionCollectionPanelModule = defineAdminModule({
    key: 'section-collection-panel',
    surfaceKeys: [
        BOOK_CHAPTER_GROUPS_SURFACE_KEY,
        CHAPTER_VERSE_GROUPS_SURFACE_KEY,
    ],
    entityScope: ['book', 'chapter'],
    surfaceSlots: 'inline_editor',
    presentationVariants: 'compact',
    EditorComponent: SectionCollectionPanel,
    order: 5,
    description:
        'Shows semantic group counts and structure links for section-aware collection surfaces.',
});


