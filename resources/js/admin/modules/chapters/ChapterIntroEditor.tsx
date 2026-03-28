import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    buildScriptureAdminBlockHref,
    buildScriptureAdminSectionHref,
} from '@/lib/scripture-admin-navigation';
import { getChapterIntroMetadata } from '@/admin/surfaces/scripture/chapters/surface-types';
import { RegisteredIntroBlockEditor } from '@/admin/modules/blocks/RegisteredIntroBlockEditor';

function ChapterIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getChapterIntroMetadata(surface);

    if (metadata === null) {
        return null;
    }

    const fullEditHref =
        metadata.block !== null
            ? buildScriptureAdminBlockHref(
                  metadata.fullEditHref,
                  metadata.block.id,
              )
            : buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'content_blocks',
              );

    return (
        <RegisteredIntroBlockEditor
            title="Chapter intro"
            entityLabel={metadata.chapterTitle}
            block={metadata.block}
            blockTypes={metadata.blockTypes}
            updateHref={metadata.updateHref}
            storeHref={metadata.storeHref}
            fullEditHref={fullEditHref}
            defaultRegion="overview"
        />
    );
}

export const chapterIntroEditorModule = defineAdminModule({
    key: 'chapter-intro-editor',
    contractKeys: 'intro',
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['full_edit'],
    qualifies: (surface) => getChapterIntroMetadata(surface) !== null,
    EditorComponent: ChapterIntroEditor,
    order: 20,
    description:
        'Renders the chapter intro controls for the semantic intro surface, falling back to full edit when no single inline intro block qualifies.',
});


