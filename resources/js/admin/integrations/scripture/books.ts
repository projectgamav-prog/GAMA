import { bookIdentityEditorModule } from '@/admin/modules/books/BookIdentityEditor';
import { bookIntroEditorModule } from '@/admin/modules/books/BookIntroEditor';
import { mediaSlotsEditorModule } from '@/admin/modules/books/MediaSlotsEditor';

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
