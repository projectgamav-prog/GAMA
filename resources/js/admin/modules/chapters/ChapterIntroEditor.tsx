import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { RegisteredEntityIntroEditor } from '@/admin/modules/blocks/RegisteredEntityIntroEditor';
import type { ScriptureChapter } from '@/types';

function ChapterIntroEditor({
    module,
    surface,
    activation,
}: AdminModuleComponentProps) {
    return (
        <RegisteredEntityIntroEditor
            module={module}
            surface={surface}
            activation={activation}
            title="Chapter intro"
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


