import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { RegisteredEntityIntroEditor } from '@/admin/modules/blocks/RegisteredEntityIntroEditor';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import type { ScriptureVerse } from '@/types';

function VerseIntroEditor({
    module,
    surface,
    activation,
}: AdminModuleComponentProps) {
    return (
        <RegisteredEntityIntroEditor
            module={module}
            surface={surface}
            activation={activation}
            title="Verse intro"
        />
    );
}

export const verseIntroEditorModule = defineAdminModule({
    key: 'verse-intro-editor',
    contractKeys: 'intro',
    entityScope: 'verse',
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
        getIntroContractMetadata<ScriptureVerse>(surface)?.introKind ===
        'registered_block',
    EditorComponent: VerseIntroEditor,
    order: 20,
    description:
        'Renders the verse intro controls for the semantic verse intro surface using the shared registered intro workflow.',
});
