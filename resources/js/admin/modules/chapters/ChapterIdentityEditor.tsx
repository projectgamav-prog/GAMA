import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { getChapterIdentityMetadata } from '@/admin/surfaces/scripture/chapters/surface-types';

type ChapterIdentityFormData = {
    slug: string;
    number: string;
    title: string;
};

function ChapterIdentityEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getChapterIdentityMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<ChapterIdentityFormData>({
        slug: metadata?.chapter.slug ?? '',
        number: metadata?.chapter.number ?? '',
        title: metadata?.chapter.title ?? '',
    });

    if (metadata === null) {
        return null;
    }

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'identity',
    );

    if (!isOpen) {
        return (
            <>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        form.setData({
                            slug: metadata.chapter.slug,
                            number: metadata.chapter.number ?? '',
                            title: metadata.chapter.title ?? '',
                        });
                        form.clearErrors();
                        setIsOpen(true);
                    }}
                >
                    Edit chapter
                </Button>
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full px-3"
                >
                    <Link href={fullEditHref}>Full Edit</Link>
                </Button>
            </>
        );
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
    qualifies: (surface) => getChapterIdentityMetadata(surface) !== null,
    EditorComponent: ChapterIdentityEditor,
    order: 10,
    description:
        'Renders the canonical chapter identity editor for the public chapter intro surface.',
});


