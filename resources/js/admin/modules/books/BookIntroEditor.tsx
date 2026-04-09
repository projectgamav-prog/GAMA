import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type { ScriptureBook } from '@/types';

function BookIntroEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getIntroContractMetadata<ScriptureBook>(surface);
    const isCompact = surface.presentation?.variant === 'compact';
    const hasIntro = Boolean(metadata?.textValue?.trim());
    const form = useForm<{ description: string }>({
        description: '',
    });

    if (metadata === null) {
        return null;
    }

    useEffect(() => {
        if (!activation.isActive) {
            form.clearErrors();
            form.reset();

            return;
        }

        form.setData({
            description: metadata.textValue ?? '',
        });
        form.clearErrors();
    }, [activation.isActive, form, metadata.textValue]);

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'details',
    );
    const updateHref = metadata.updateHref;

    if (updateHref === null) {
        return null;
    }

    if (!activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={hasIntro ? 'Book intro' : 'Add book intro'}
                description={
                    isCompact
                        ? 'Update the public intro shown for this book on the library card.'
                        : 'Update the public intro shown for this book across its public book pages.'
                }
                fullEditHref={fullEditHref}
                mode={hasIntro ? 'edit' : 'create'}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.patch(updateHref, {
                        preserveScroll: true,
                        onSuccess: () => activation.deactivate(),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
                saveLabel={hasIntro ? 'Save' : 'Add Intro'}
            >
                <div className="grid gap-2">
                    <Label htmlFor="book_intro_description">Description</Label>
                    <Textarea
                        id="book_intro_description"
                        autoFocus
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        rows={isCompact ? 6 : 8}
                        placeholder="Add public editorial copy for this book."
                    />
                    <InputError message={form.errors.description} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const bookIntroEditorModule = defineAdminModule({
    key: 'book-intro-editor',
    contractKeys: 'intro',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_intro',
            placement: 'inline',
            openMode: 'inline',
            priority: 20,
        },
    ],
    qualifies: (surface) =>
        getIntroContractMetadata<ScriptureBook>(surface)?.introKind ===
        'field',
    EditorComponent: BookIntroEditor,
    order: 20,
    description:
        'Renders the inline book intro editor for the semantic book intro surface.',
});


