import { chapterIntroEditorModule } from './ChapterIntroEditor';
import { chapterSheetEditorModule } from './ChapterSheetEditor';

export { chapterIntroEditorModule, chapterSheetEditorModule };

export const chapterAdminModules = [
    chapterIntroEditorModule,
    chapterSheetEditorModule,
] as const;
