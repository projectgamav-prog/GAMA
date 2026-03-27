import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getVerseBlockRegionMetadata } from './surface-types';

function BlockRegionEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getVerseBlockRegionMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full px-3"
        >
            <Link href={`${metadata.fullEditHref}#block-manager`}>
                Full Edit
            </Link>
        </Button>
    );
}

export const blockRegionEditorModule = defineAdminModule({
    key: 'verse-block-region-editor',
    entityScope: 'verse',
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['full_edit'],
    EditorComponent: BlockRegionEditor,
    order: 10,
    description:
        'Renders the region-level full-edit entry for verse content blocks.',
});
