import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getBookBlockRegionMetadata } from './surface-types';

function BlockRegionEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getBookBlockRegionMetadata(surface);

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
            <Link href={metadata.fullEditHref}>Full Edit</Link>
        </Button>
    );
}

export const blockRegionEditorModule = defineAdminModule({
    key: 'book-block-region-editor',
    entityScope: 'book',
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['full_edit'],
    EditorComponent: BlockRegionEditor,
    order: 10,
    description:
        'Renders the region-level full-edit entry for book content blocks.',
});
