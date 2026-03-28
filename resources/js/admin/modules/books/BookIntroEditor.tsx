import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { getBookIntroMetadata } from '@/admin/surfaces/scripture/books/surface-types';

function BookIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getBookIntroMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const isCompact = surface.presentation?.variant === 'compact';
    const hasIntro = Boolean(metadata?.book.description?.trim());
    const form = useForm<{ description: string }>({
        description: metadata?.book.description ?? '',
    });

    if (metadata === null) {
        return null;
    }

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'details',
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
                            description: metadata.book.description ?? '',
                        });
                        form.clearErrors();
                        setIsOpen(true);
                    }}
                >
                    {hasIntro ? 'Edit Intro' : 'Add Intro'}
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
                title={hasIntro ? 'Book intro' : 'Add book intro'}
                description={
                    isCompact
                        ? 'Update the public summary shown for this book on the library page.'
                        : 'Update the public introductory copy shown on the book detail or overview page.'
                }
                fullEditHref={fullEditHref}
                mode={hasIntro ? 'edit' : 'create'}
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
    qualifies: (surface) => getBookIntroMetadata(surface) !== null,
    EditorComponent: BookIntroEditor,
    order: 20,
    description:
        'Renders the inline book intro editor for the semantic book intro surface.',
});


