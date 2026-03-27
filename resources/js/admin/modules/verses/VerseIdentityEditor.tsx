import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getVerseIdentityMetadata } from './surface-types';

type VerseIdentityFormData = {
    slug: string;
    number: string;
    text: string;
};

function VerseIdentityEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getVerseIdentityMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<VerseIdentityFormData>({
        slug: metadata?.verse.slug ?? '',
        number: metadata?.verse.number ?? '',
        text: metadata?.verse.text ?? '',
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
                            slug: metadata.verse.slug,
                            number: metadata.verse.number ?? '',
                            text: metadata.verse.text,
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
                    <Link href={`${metadata.fullEditHref}#identity-editor`}>
                        Full Edit
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title="Verse identity"
                description="Update the canonical verse text, number, and slug for this verse."
                fullEditHref={`${metadata.fullEditHref}#identity-editor`}
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
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    regionScope: 'verse_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: VerseIdentityEditor,
    order: 10,
    description:
        'Renders the canonical verse identity editor for the verse intro surface.',
});
