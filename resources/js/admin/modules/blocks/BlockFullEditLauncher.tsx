import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';
import { buildScriptureAdminBlockHref } from '@/lib/scripture-admin-navigation';

function BlockFullEditLauncher({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);

    useEffect(() => {
        if (
            metadata === null ||
            !metadata.fullEditHref ||
            !activation.isActive
        ) {
            return;
        }

        activation.deactivate();
        router.visit(
            buildScriptureAdminBlockHref(metadata.fullEditHref, surface.entityId),
        );
    }, [
        activation.deactivate,
        activation.isActive,
        metadata,
        surface.entityId,
    ]);

    return null;
}

export const blockFullEditLauncherModule = defineAdminModule({
    key: 'block-full-edit-launcher',
    contractKeys: 'block_actions',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['full_edit'],
    actions: [
        {
            actionKey: 'full_edit_block',
            placement: 'inline',
            openMode: 'inline',
            priority: 80,
            variant: 'outline',
        },
    ],
    qualifies: (surface) =>
        Boolean(getBlockActionMetadata(surface)?.fullEditHref),
    EditorComponent: BlockFullEditLauncher,
    order: 80,
    description:
        'Provides the block-level full-edit fallback as a module-defined action on semantic block-action surfaces.',
});
