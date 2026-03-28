import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { getBlockRegionMetadata } from '@/admin/surfaces/blocks/surface-types';

function BlockRegionFullEdit({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockRegionMetadata(surface);

    if (metadata === null) {
        return null;
    }

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'content_blocks',
    );

    return (
        <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3"
        >
            <Link href={fullEditHref}>Full Edit</Link>
        </Button>
    );
}

export const blockRegionFullEditModule = defineAdminModule({
    key: 'block-region-full-edit',
    contractKeys: 'block_region',
    entityScope: ['book', 'chapter', 'verse'],
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['full_edit'],
    EditorComponent: BlockRegionFullEdit,
    order: 10,
    description:
        'Renders the shared region-level full-edit entry for block-backed scripture surfaces.',
});


