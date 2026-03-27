import { verseIdentityEditorModule } from './VerseIdentityEditor';
import { verseMetaEditorModule } from './VerseMetaEditor';

export {
    verseIdentityEditorModule,
    verseMetaEditorModule,
};

export const verseAdminModules = [
    verseIdentityEditorModule,
    verseMetaEditorModule,
] as const;
