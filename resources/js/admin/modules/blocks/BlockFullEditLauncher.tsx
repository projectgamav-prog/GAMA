import { Link } from '@inertiajs/react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminBlockHref } from '@/lib/scripture-admin-navigation';
import { getBlockActionMetadata } from '@/admin/surfaces/blocks/surface-types';

function BlockFullEditLauncher({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockActionMetadata(surface);

    if (metadata === null || !metadata.fullEditHref) {
        return null;
    }

    const fullEditHref = buildScriptureAdminBlockHref(
        metadata.fullEditHref,
        surface.entityId,
    );

    return (
        <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3"
        >
            <Link href={fullEditHref}>
                <SquareArrowOutUpRight className="size-3.5" />
                Full edit
            </Link>
        </Button>
    );
}

export const blockFullEditLauncherModule = defineAdminModule({
    key: 'block-full-edit-launcher',
    contractKeys: 'block_actions',
    entityScope: 'content_block',
    surfaceSlots: 'block_actions',
    regionScope: '*',
    requiredCapabilities: ['full_edit'],
    EditorComponent: BlockFullEditLauncher,
    order: 50,
    description:
        'Renders the shared full-edit fallback entry in the block action cluster.',
});


