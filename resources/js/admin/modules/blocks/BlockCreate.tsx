import { ScriptureContentBlockInsertControl } from '@/components/scripture/scripture-content-block-insert-control';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getBlockCreateMetadata } from './surface-types';

function BlockCreate({ surface }: AdminModuleComponentProps) {
    const metadata = getBlockCreateMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureContentBlockInsertControl
            blockTypes={metadata.blockTypes}
            disabled={metadata.disabled ?? false}
            label={metadata.label}
            placementLabel={metadata.placementLabel}
            onSelectType={metadata.onSelectType}
        />
    );
}

export const blockCreateModule = defineAdminModule({
    key: 'block-create',
    entityScope: ['book', 'chapter', 'verse'],
    surfaceSlots: 'insert_control',
    regionScope: 'content_blocks',
    requiredCapabilities: ['add_block'],
    EditorComponent: BlockCreate,
    order: 10,
    description:
        'Renders the existing block-type picker at valid insertion points in block-backed scripture regions.',
});
