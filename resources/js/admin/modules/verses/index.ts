import { blockRegionEditorModule } from './BlockRegionEditor';
import { verseIdentityEditorModule } from './VerseIdentityEditor';
import { verseMetaEditorModule } from './VerseMetaEditor';
import { verseNotesEditorModule } from './VerseNotesEditor';
import { verseSheetEditorModule } from './VerseSheetEditor';

export {
    blockRegionEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseNotesEditorModule,
    verseSheetEditorModule,
};

export const verseAdminModules = [
    blockRegionEditorModule,
    verseIdentityEditorModule,
    verseMetaEditorModule,
    verseNotesEditorModule,
    verseSheetEditorModule,
] as const;
