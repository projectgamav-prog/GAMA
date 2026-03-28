import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';

function BlockDuplicate({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);
    const management = metadata?.management;
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!activation.isActive) {
            setProcessing(false);

            return;
        }

        if (
            processing ||
            management === null ||
            management === undefined ||
            !management.duplicateHref
        ) {
            return;
        }

        setProcessing(true);
        router.post(
            management.duplicateHref,
            {},
            {
                preserveScroll: true,
                onSuccess: management.onDuplicateSuccess,
                onFinish: () => {
                    setProcessing(false);
                    activation.deactivate();
                },
            },
        );
    }, [activation.deactivate, activation.isActive, management, processing]);

    return null;
}

export const blockDuplicateModule = defineAdminModule({
    key: 'block-duplicate',
    contractKeys: 'block_actions',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['duplicate'],
    actions: [
        {
            actionKey: 'duplicate_block',
            placement: 'dropdown',
            openMode: 'inline',
            priority: 40,
        },
    ],
    qualifies: (surface) =>
        Boolean(getBlockActionMetadata(surface)?.management?.duplicateHref),
    EditorComponent: BlockDuplicate,
    order: 40,
    description:
        'Provides the safe duplicate action for eligible registered blocks as a module-owned dropdown action.',
});
