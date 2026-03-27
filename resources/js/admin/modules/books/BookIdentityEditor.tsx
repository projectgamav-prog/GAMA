import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getBookIdentityMetadata } from './surface-types';

type BookIdentityFormData = {
    slug: string;
    number: string;
    title: string;
};

function BookIdentityEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getBookIdentityMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<BookIdentityFormData>({
        slug: metadata?.book.slug ?? '',
        number: metadata?.book.number ?? '',
        title: metadata?.book.title ?? '',
    });

    if (metadata === null) {
        return null;
    }

    if (!isOpen) {
        return (
            <>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        form.setData({
                            slug: metadata.book.slug,
                            number: metadata.book.number ?? '',
                            title: metadata.book.title,
                        });
                        form.clearErrors();
                        setIsOpen(true);
                    }}
                >
                    Edit
                </Button>
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full px-3"
                >
                    <Link href={metadata.fullEditHref}>Full Edit</Link>
                </Button>
            </>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title="Book identity"
                description="Update the canonical book slug, number, and title without leaving the public page context."
                fullEditHref={metadata.fullEditHref}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(false);
                }}
                onSave={() => {
                    form.patch(metadata.updateHref, {
                        preserveScroll: true,
                        onSuccess: () => setIsOpen(false),
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
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    regionScope: 'book_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: BookIdentityEditor,
    order: 10,
    description:
        'Renders the canonical book identity editor for the public book intro surface.',
});
