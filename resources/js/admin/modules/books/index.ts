import { bookIdentityEditorModule } from './BookIdentityEditor';
import { bookIntroEditorModule } from './BookIntroEditor';
import { mediaSlotsEditorModule } from './MediaSlotsEditor';

export {
    bookIdentityEditorModule,
    bookIntroEditorModule,
    mediaSlotsEditorModule,
};

export const bookAdminModules = [
    bookIdentityEditorModule,
    bookIntroEditorModule,
    mediaSlotsEditorModule,
] as const;
