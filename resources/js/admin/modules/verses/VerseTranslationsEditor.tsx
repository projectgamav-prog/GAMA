import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getRelationRowsContractMetadata,
    type VerseTranslationsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import { VERSE_TRANSLATIONS_SURFACE_KEY } from '@/admin/surfaces/core/surface-keys';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureAdminVerseTranslation,
    ScriptureTranslationSourceOption,
} from '@/types';
import { VerseRelationEditorShell } from './VerseRelationEditorShell';
import { CreateTranslationCard } from './translations/CreateTranslationCard';
import { TranslationEditorCard } from './translations/TranslationEditorCard';

function resolveTranslationMetadata(
    props: AdminModuleComponentProps,
): VerseTranslationsContractMetadata | null {
    const metadata = getRelationRowsContractMetadata<
        ScriptureAdminVerseTranslation,
        ScriptureTranslationSourceOption
    >(props.surface);

    return metadata?.relationKey === 'translations' ? metadata : null;
}

function VerseTranslationsEditor(props: AdminModuleComponentProps) {
    const metadata = resolveTranslationMetadata(props);
    const handleMutationSuccess = () => props.activation.deactivate();
    const fullEditHref = metadata?.fullEditHref
        ? buildScriptureAdminSectionHref(metadata.fullEditHref, 'translations')
        : null;

    if (metadata === null || !props.activation.isActive) {
        return null;
    }

    return (
        <VerseRelationEditorShell
            count={metadata.rows.length}
            countLabelSingular="translation"
            countLabelPlural="translations"
            sourceCount={metadata.sourceOptions.length}
            title="Verse translations"
            description="Add, update, and organize the translations shown with this verse. Choose a saved source to prefill details when it helps."
            fullEditHref={fullEditHref}
            onClose={props.activation.deactivate}
        >
            <CreateTranslationCard
                metadata={metadata}
                onSuccess={handleMutationSuccess}
            />

            {metadata.rows.map((row) => (
                <TranslationEditorCard
                    key={row.id}
                    metadata={metadata}
                    row={row}
                    onSuccess={handleMutationSuccess}
                />
            ))}
        </VerseRelationEditorShell>
    );
}

export const verseTranslationsEditorModule = defineAdminModule({
    key: 'verse-translations-editor',
    surfaceKeys: VERSE_TRANSLATIONS_SURFACE_KEY,
    contractKeys: 'relation_rows',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_translations',
            placement: 'inline',
            openMode: 'inline',
            priority: 30,
        },
    ],
    qualifies: (surface) =>
        getRelationRowsContractMetadata(surface)?.relationKey ===
        'translations',
    EditorComponent: VerseTranslationsEditor,
    order: 30,
    description:
        'Manages verse translations through the shared verse relation surface.',
});
