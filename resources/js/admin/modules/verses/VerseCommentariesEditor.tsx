import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getRelationRowsContractMetadata,
    type VerseCommentariesContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import { VERSE_COMMENTARIES_SURFACE_KEY } from '@/admin/surfaces/core/surface-keys';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureCommentarySourceOption,
    ScriptureAdminVerseCommentary,
} from '@/types';
import { VerseRelationEditorShell } from './VerseRelationEditorShell';
import { CommentaryEditorCard } from './commentaries/CommentaryEditorCard';
import { CreateCommentaryCard } from './commentaries/CreateCommentaryCard';

function resolveCommentaryMetadata(
    props: AdminModuleComponentProps,
): VerseCommentariesContractMetadata | null {
    const metadata = getRelationRowsContractMetadata<
        ScriptureAdminVerseCommentary,
        ScriptureCommentarySourceOption
    >(props.surface);

    return metadata?.relationKey === 'commentaries' ? metadata : null;
}

function VerseCommentariesEditor(props: AdminModuleComponentProps) {
    const metadata = resolveCommentaryMetadata(props);
    const handleMutationSuccess = () => props.activation.deactivate();
    const fullEditHref = metadata?.fullEditHref
        ? buildScriptureAdminSectionHref(metadata.fullEditHref, 'commentaries')
        : null;

    if (metadata === null || !props.activation.isActive) {
        return null;
    }

    return (
        <VerseRelationEditorShell
            count={metadata.rows.length}
            countLabelSingular="commentary"
            countLabelPlural="commentaries"
            sourceCount={metadata.sourceOptions.length}
            title="Verse commentaries"
            description="Add, update, and organize the commentary shown with this verse. Choose a saved source to prefill details when it helps."
            fullEditHref={fullEditHref}
            onClose={props.activation.deactivate}
        >
            <CreateCommentaryCard
                metadata={metadata}
                onSuccess={handleMutationSuccess}
            />

            {metadata.rows.map((row) => (
                <CommentaryEditorCard
                    key={row.id}
                    metadata={metadata}
                    row={row}
                    onSuccess={handleMutationSuccess}
                />
            ))}
        </VerseRelationEditorShell>
    );
}

export const verseCommentariesEditorModule = defineAdminModule({
    key: 'verse-commentaries-editor',
    surfaceKeys: VERSE_COMMENTARIES_SURFACE_KEY,
    contractKeys: 'relation_rows',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_commentaries',
            placement: 'inline',
            openMode: 'inline',
            priority: 35,
        },
    ],
    qualifies: (surface) =>
        getRelationRowsContractMetadata(surface)?.relationKey ===
        'commentaries',
    EditorComponent: VerseCommentariesEditor,
    order: 35,
    description:
        'Manages verse commentaries through the shared verse relation surface.',
});
