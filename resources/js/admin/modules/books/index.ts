import { bookIntroEditorModule } from './BookIntroEditor';
import { bookSheetEditorModule } from './BookSheetEditor';

export { bookIntroEditorModule, bookSheetEditorModule };

export const bookAdminModules = [
    bookIntroEditorModule,
    bookSheetEditorModule,
] as const;
