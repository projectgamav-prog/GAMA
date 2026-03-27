import { blockRegionEditorModule } from './BlockRegionEditor';
import { bookContentBlockEditorModule } from './BookContentBlockEditor';
import { bookIdentityEditorModule } from './BookIdentityEditor';
import { bookIntroEditorModule } from './BookIntroEditor';
import { bookSheetEditorModule } from './BookSheetEditor';
import { mediaSlotsEditorModule } from './MediaSlotsEditor';

export {
    blockRegionEditorModule,
    bookContentBlockEditorModule,
    bookIdentityEditorModule,
    bookIntroEditorModule,
    bookSheetEditorModule,
    mediaSlotsEditorModule,
};

export const bookAdminModules = [
    blockRegionEditorModule,
    bookIdentityEditorModule,
    bookIntroEditorModule,
    bookContentBlockEditorModule,
    mediaSlotsEditorModule,
    bookSheetEditorModule,
] as const;
