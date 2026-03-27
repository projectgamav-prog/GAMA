import { blockCreateModule } from './BlockCreate';
import { blockDeleteModule } from './BlockDelete';
import { blockDragReorderModule } from './BlockDragReorder';
import { blockDuplicateModule } from './BlockDuplicate';
import { blockFullEditLauncherModule } from './BlockFullEditLauncher';
import { blockReorderModule } from './BlockReorder';
import { imageBlockEditorModule } from './ImageBlockEditor';
import { quoteBlockEditorModule } from './QuoteBlockEditor';
import { textBlockEditorModule } from './TextBlockEditor';
import { videoBlockEditorModule } from './VideoBlockEditor';

export {
    blockCreateModule,
    blockDeleteModule,
    blockDragReorderModule,
    blockDuplicateModule,
    blockFullEditLauncherModule,
    blockReorderModule,
    imageBlockEditorModule,
    quoteBlockEditorModule,
    textBlockEditorModule,
    videoBlockEditorModule,
};

export const blockAdminModules = [
    blockCreateModule,
    blockDragReorderModule,
    blockReorderModule,
    blockDuplicateModule,
    blockDeleteModule,
    blockFullEditLauncherModule,
    textBlockEditorModule,
    quoteBlockEditorModule,
    imageBlockEditorModule,
    videoBlockEditorModule,
] as const;
