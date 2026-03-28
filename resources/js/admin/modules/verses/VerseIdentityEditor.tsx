import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getIdentityContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type { ScriptureVerse } from '@/types';

type VerseIdentityFormData = {
    slug: string;
    number: string;
    text: string;
};

function VerseIdentityEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getIdentityContractMetadata<ScriptureVerse>(surface);
    const form = useForm<VerseIdentityFormData>({
        slug: '',
        number: '',
        text: '',
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
            slug: metadata.entityRecord.slug,
            number: metadata.entityRecord.number ?? '',
            text: metadata.entityRecord.text,
        });
        form.clearErrors();
    }, [
        activation.isActive,
        form,
        metadata.entityRecord.number,
        metadata.entityRecord.slug,
        metadata.entityRecord.text,
    ]);

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'identity',
    );

    if (!activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title="Verse intro"
                description="Update the canonical verse text, number, and slug for the verse intro context shown on the public verse page."
                fullEditHref={fullEditHref}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.patch(metadata.updateHref, {
                        preserveScroll: true,
                        onSuccess: () => activation.deactivate(),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                <div className="grid gap-2">
                    <Label htmlFor="verse_identity_slug">Slug</Label>
                    <Input
                        id="verse_identity_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="verse-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="verse_identity_number">Number</Label>
                    <Input
                        id="verse_identity_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="verse_identity_text">Verse text</Label>
                    <Textarea
                        id="verse_identity_text"
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={6}
                        placeholder="Canonical verse text"
                    />
                    <InputError message={form.errors.text} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const verseIdentityEditorModule = defineAdminModule({
    key: 'verse-identity-editor',
    contractKeys: 'identity',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_intro',
            defaultLabel: 'Edit Intro',
            placement: 'inline',
            openMode: 'inline',
            priority: 10,
        },
    ],
    qualifies: (surface) =>
        getIdentityContractMetadata<ScriptureVerse>(surface) !== null,
    EditorComponent: VerseIdentityEditor,
    order: 10,
    description:
        'Renders the canonical verse identity editor for the verse intro surface.',
});


