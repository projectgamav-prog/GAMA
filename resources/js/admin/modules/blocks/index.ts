import { blockCreateModule } from './BlockCreate';
import { blockDeleteModule } from './BlockDelete';
import { blockDragReorderModule } from './BlockDragReorder';
import { blockDuplicateModule } from './BlockDuplicate';
import { blockFullEditLauncherModule } from './BlockFullEditLauncher';
import { blockRegionFullEditModule } from './BlockRegionFullEdit';
import { blockReorderModule } from './BlockReorder';
import { imageBlockEditorModule } from './ImageBlockEditor';
import { textualBlockEditorModule } from './TextualBlockEditor';

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
