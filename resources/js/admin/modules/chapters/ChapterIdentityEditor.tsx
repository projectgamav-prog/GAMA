import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getIdentityContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type { ScriptureChapter } from '@/types';

type ChapterIdentityFormData = {
    slug: string;
    number: string;
    title: string;
};

function ChapterIdentityEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getIdentityContractMetadata<ScriptureChapter>(surface);
    const form = useForm<ChapterIdentityFormData>({
        slug: '',
        number: '',
        title: '',
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
            title: metadata.entityRecord.title ?? '',
        });
        form.clearErrors();
    }, [
        activation.isActive,
        form,
        metadata.entityRecord.number,
        metadata.entityRecord.slug,
        metadata.entityRecord.title,
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
                title="Chapter identity"
                description="Update the canonical chapter slug, number, and title without leaving the public chapter page."
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
                    <Label htmlFor="chapter_identity_slug">Slug</Label>
                    <Input
                        id="chapter_identity_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="chapter-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="chapter_identity_number">Number</Label>
                    <Input
                        id="chapter_identity_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="chapter_identity_title">Title</Label>
                    <Input
                        id="chapter_identity_title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Chapter title"
                    />
                    <InputError message={form.errors.title} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const chapterIdentityEditorModule = defineAdminModule({
    key: 'chapter-identity-editor',
    contractKeys: 'identity',
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_identity',
            placement: 'inline',
            openMode: 'inline',
            priority: 10,
        },
    ],
    qualifies: (surface) =>
        getIdentityContractMetadata<ScriptureChapter>(surface) !== null,
    EditorComponent: ChapterIdentityEditor,
    order: 10,
    description:
        'Renders the canonical chapter identity editor for the semantic chapter identity surface.',
});


