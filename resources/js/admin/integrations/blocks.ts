import { blockCreateModule } from '@/admin/modules/blocks/BlockCreate';
import { blockDeleteModule } from '@/admin/modules/blocks/BlockDelete';
import { blockDragReorderModule } from '@/admin/modules/blocks/BlockDragReorder';
import { blockDuplicateModule } from '@/admin/modules/blocks/BlockDuplicate';
import { blockFullEditLauncherModule } from '@/admin/modules/blocks/BlockFullEditLauncher';
import { blockRegionFullEditModule } from '@/admin/modules/blocks/BlockRegionFullEdit';
import { blockReorderModule } from '@/admin/modules/blocks/BlockReorder';
import { imageBlockEditorModule } from '@/admin/modules/blocks/ImageBlockEditor';
import { textualBlockEditorModule } from '@/admin/modules/blocks/TextualBlockEditor';

export {
    blockCreateModule,
    blockDeleteModule,
    blockDragReorderModule,
    blockDuplicateModule,
    blockFullEditLauncherModule,
    blockRegionFullEditModule,
    blockReorderModule,
    imageBlockEditorModule,
    textualBlockEditorModule,
};

export const blockAdminModules = [
    blockCreateModule,
    blockRegionFullEditModule,
    blockDragReorderModule,
    blockReorderModule,
    blockDuplicateModule,
    blockDeleteModule,
    blockFullEditLauncherModule,
    textualBlockEditorModule,
    imageBlockEditorModule,
] as const;
