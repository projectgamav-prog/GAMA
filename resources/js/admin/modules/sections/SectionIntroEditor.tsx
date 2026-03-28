import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { RegisteredIntroBlockEditor } from '@/admin/modules/blocks/RegisteredIntroBlockEditor';
import {
    BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
    CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import { getSectionGroupMetadata } from '@/admin/surfaces/sections/surface-types';

function SectionIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getSectionGroupMetadata(surface);

    if (
        metadata === null ||
        (metadata.introStoreHref === null &&
            metadata.introUpdateHref === null &&
            metadata.introBlock === null)
    ) {
        return null;
    }

    return (
        <RegisteredIntroBlockEditor
            title={`${metadata.groupLabel} intro`}
            entityLabel={metadata.title}
            block={metadata.introBlock}
            blockTypes={metadata.introBlockTypes}
            updateHref={metadata.introUpdateHref}
            storeHref={metadata.introStoreHref}
            defaultRegion={metadata.introDefaultRegion}
        />
    );
}

export const sectionIntroEditorModule = defineAdminModule({
    key: 'section-intro-editor',
    surfaceKeys: [
        BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
        CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    ],
    entityScope: ['book_section', 'chapter_section'],
    surfaceSlots: 'inline_editor',
    presentationVariants: 'compact',
    EditorComponent: SectionIntroEditor,
    order: 25,
    description:
        'Edits or creates the primary intro block for section-group surfaces without coupling intro behavior to one grouped page shell.',
});
