import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    buildScriptureAdminBlockHref,
    buildScriptureAdminSectionHref,
} from '@/lib/scripture-admin-navigation';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { RegisteredIntroBlockEditor } from '@/admin/modules/blocks/RegisteredIntroBlockEditor';
import type { ScriptureChapter } from '@/types';

function ChapterIntroEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getIntroContractMetadata<ScriptureChapter>(surface);

    if (metadata === null || !activation.isActive) {
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
            entityLabel={metadata.entityLabel}
            block={metadata.block}
            blockTypes={metadata.blockTypes}
            updateHref={metadata.updateHref}
            storeHref={metadata.storeHref}
            fullEditHref={fullEditHref}
            defaultRegion="overview"
            onCancel={activation.deactivate}
            onSaveSuccess={activation.deactivate}
        />
    );
}

export const chapterIntroEditorModule = defineAdminModule({
    key: 'chapter-intro-editor',
    contractKeys: 'intro',
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['full_edit'],
    actions: [
        {
            actionKey: 'edit_intro',
            defaultLabel: 'Edit Intro',
            dynamicLabel: (surface) =>
                getIntroContractMetadata<ScriptureChapter>(surface)?.block
                    ? 'Edit Intro'
                    : 'Add Intro',
            placement: 'inline',
            openMode: 'inline',
            priority: 20,
        },
    ],
    qualifies: (surface) =>
        getIntroContractMetadata<ScriptureChapter>(surface)?.introKind ===
        'registered_block',
    EditorComponent: ChapterIntroEditor,
    order: 20,
    description:
        'Renders the chapter intro controls for the semantic intro surface, falling back to full edit when no single inline intro block qualifies.',
});


