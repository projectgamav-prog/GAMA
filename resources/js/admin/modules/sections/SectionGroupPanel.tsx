import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getSectionGroupMetadata } from '@/admin/surfaces/sections/surface-types';

function formatCountLabel(count: number, label: string): string {
    const singularLabel = label.endsWith('s') ? label.slice(0, -1) : label;

    return `${count} ${count === 1 ? singularLabel : label}`;
}

function SectionGroupPanel({ surface }: AdminModuleComponentProps) {
    const metadata = getSectionGroupMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <>
            <Badge variant="outline">{metadata.groupLabel}</Badge>
            <Badge variant="secondary">
                {formatCountLabel(metadata.primaryCount, metadata.primaryLabel)}
            </Badge>
            {metadata.secondaryCount !== null && metadata.secondaryLabel && (
                <Badge variant="secondary">
                    {formatCountLabel(
                        metadata.secondaryCount,
                        metadata.secondaryLabel,
                    )}
                </Badge>
            )}
            {metadata.openHref && metadata.openLabel && (
                <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground shadow-none hover:text-foreground"
                >
                    <Link href={metadata.openHref}>{metadata.openLabel}</Link>
                </Button>
            )}
        </>
    );
}

export const sectionGroupPanelModule = defineAdminModule({
    key: 'section-group-panel',
    contractKeys: 'section_group',
    entityScope: ['book_section', 'chapter_section'],
    surfaceSlots: 'inline_editor',
    presentationVariants: 'compact',
    qualifies: (surface) => getSectionGroupMetadata(surface) !== null,
    EditorComponent: SectionGroupPanel,
    order: 10,
    description:
        'Shows semantic group badges for section-level chapter and verse group surfaces.',
});


