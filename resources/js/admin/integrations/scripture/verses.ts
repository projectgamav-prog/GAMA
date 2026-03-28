import { verseIdentityEditorModule } from '@/admin/modules/verses/VerseIdentityEditor';
import { verseMetaEditorModule } from '@/admin/modules/verses/VerseMetaEditor';

export {
    verseIdentityEditorModule,
    verseMetaEditorModule,
};

export const verseAdminModules = [
    verseIdentityEditorModule,
    verseMetaEditorModule,
] as const;
