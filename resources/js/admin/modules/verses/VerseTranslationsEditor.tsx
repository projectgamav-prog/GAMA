import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@/types';
import { CreateTranslationCard } from './translations/CreateTranslationCard';
import { TranslationEditorCard } from './translations/TranslationEditorCard';

function resolveTranslationMetadata(
    props: AdminModuleComponentProps,
): VerseTranslationsContractMetadata | null {
    const metadata =
        getRelationRowsContractMetadata<
            ScriptureAdminVerseTranslation
        >(props.surface);

    return metadata?.relationKey === 'translations' ? metadata : null;
}

function VerseTranslationsEditor(props: AdminModuleComponentProps) {
    const metadata = resolveTranslationMetadata(props);
    const handleMutationSuccess = () => props.activation.deactivate();
    const fullEditHref =
        metadata?.fullEditHref
            ? buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'translations',
              )
            : null;

    if (metadata === null || !props.activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {metadata.rows.length} translation
                            {metadata.rows.length === 1 ? '' : 's'}
                        </Badge>
                        <Badge variant="outline">
                            {metadata.sourceOptions.length} saved source
                            {metadata.sourceOptions.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">
                            Verse translations
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Add, update, and organize the translations shown
                            with this verse. Choose a saved source to prefill
                            details when it helps.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={props.activation.deactivate}
                    >
                        Close
                    </Button>
                    {fullEditHref && (
                        <Button asChild variant="outline">
                            <Link href={fullEditHref}>Open full edit</Link>
                        </Button>
                    )}
                </div>

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
            </div>
        </div>
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
