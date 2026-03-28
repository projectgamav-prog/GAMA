import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getBlockRegionMetadata } from '@/admin/surfaces/blocks/surface-types';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';

function BlockRegionFullEdit({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getBlockRegionMetadata(surface);

    useEffect(() => {
        if (metadata === null || !activation.isActive) {
            return;
        }

        activation.deactivate();
        router.visit(
            buildScriptureAdminSectionHref(metadata.fullEditHref, 'content_blocks'),
        );
    }, [activation.deactivate, activation.isActive, metadata]);

    return null;
}

export const blockRegionFullEditModule = defineAdminModule({
    key: 'block-region-full-edit',
    contractKeys: 'block_region',
    entityScope: ['book', 'chapter', 'verse'],
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['full_edit'],
    actions: [
        {
            actionKey: 'full_edit_region',
            placement: 'inline',
            openMode: 'inline',
            priority: 90,
            variant: 'outline',
        },
    ],
    qualifies: (surface) => getBlockRegionMetadata(surface) !== null,
    EditorComponent: BlockRegionFullEdit,
    order: 90,
    description:
        'Provides the region-level full-edit fallback as a module-owned action on semantic block-region surfaces.',
});
