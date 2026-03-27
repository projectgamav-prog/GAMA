import { verseNotesEditorModule } from './VerseNotesEditor';
import { verseSheetEditorModule } from './VerseSheetEditor';

export { verseNotesEditorModule, verseSheetEditorModule };

export const verseAdminModules = [
    verseNotesEditorModule,
    verseSheetEditorModule,
] as const;
