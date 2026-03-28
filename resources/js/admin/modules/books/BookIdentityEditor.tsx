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
import type { ScriptureBook } from '@/types';

type BookIdentityFormData = {
    slug: string;
    number: string;
    title: string;
};

function BookIdentityEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getIdentityContractMetadata<ScriptureBook>(surface);
    const form = useForm<BookIdentityFormData>({
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
            title: metadata.entityRecord.title,
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
                title="Book identity"
                description="Update the canonical book slug, number, and title without leaving the public page context."
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
                    <Label htmlFor="book_identity_slug">Slug</Label>
                    <Input
                        id="book_identity_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="book-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="book_identity_number">Number</Label>
                    <Input
                        id="book_identity_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="book_identity_title">Title</Label>
                    <Input
                        id="book_identity_title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Book title"
                    />
                    <InputError message={form.errors.title} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const bookIdentityEditorModule = defineAdminModule({
    key: 'book-identity-editor',
    contractKeys: 'identity',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_identity',
            defaultLabel: 'Edit Details',
            placement: 'inline',
            openMode: 'inline',
            priority: 10,
        },
    ],
    qualifies: (surface) =>
        getIdentityContractMetadata<ScriptureBook>(surface) !== null,
    EditorComponent: BookIdentityEditor,
    order: 10,
    description:
        'Renders the canonical book identity editor for the public book intro surface.',
});


