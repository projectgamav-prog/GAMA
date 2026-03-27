import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureBookIntroInlineEditor } from '@/components/scripture/scripture-book-intro-inline-editor';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { getInlineEditorSurfaceMetadata } from '@/admin/modules/shared/surface-metadata';
import { getBookIntroMetadata } from './surface-types';

type InlineBookIntroSession = Extract<
    ScriptureBookAdminEditSession,
    { kind: 'entity_details' }
>;

function BookIntroEditor({ surface }: AdminModuleComponentProps) {
    const modernMetadata = getBookIntroMetadata(surface);
    const legacyMetadata =
        modernMetadata === null
            ? getInlineEditorSurfaceMetadata<InlineBookIntroSession, () => void>(
                  surface,
              )
            : null;
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<{ description: string }>({
        description: modernMetadata?.book.description ?? '',
    });

    if (modernMetadata === null && legacyMetadata === null) {
        return null;
    }

    if (modernMetadata !== null) {
        if (!isOpen) {
            return (
                <>
                    <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full px-3"
                        onClick={() => {
                            form.setData({
                                description:
                                    modernMetadata.book.description ?? '',
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
                        <Link href={modernMetadata.fullEditHref}>Full Edit</Link>
                    </Button>
                </>
            );
        }

        return (
            <div className="basis-full pt-2">
                <ScriptureInlineRegionEditor
                    title="Book intro"
                    description="Update the public introductory copy shown on the book detail page."
                    fullEditHref={modernMetadata.fullEditHref}
                    onCancel={() => {
                        form.reset();
                        form.clearErrors();
                        setIsOpen(false);
                    }}
                    onSave={() => {
                        form.patch(modernMetadata.updateHref, {
                            preserveScroll: true,
                            onSuccess: () => setIsOpen(false),
                        });
                    }}
                    isDirty={form.isDirty}
                    hasErrors={Object.keys(form.errors).length > 0}
                    processing={form.processing}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="book_intro_description">
                            Description
                        </Label>
                        <Textarea
                            id="book_intro_description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData(
                                    'description',
                                    event.target.value,
                                )
                            }
                            rows={8}
                            placeholder="Add public editorial copy for this book."
                        />
                        <InputError message={form.errors.description} />
                    </div>
                </ScriptureInlineRegionEditor>
            </div>
        );
    }

    return (
        <ScriptureBookIntroInlineEditor
            session={legacyMetadata?.session ?? null}
            onCancel={legacyMetadata?.onCancel ?? (() => undefined)}
            onSaveSuccess={legacyMetadata?.onSaveSuccess}
        />
    );
}

export const bookIntroEditorModule = defineAdminModule({
    key: 'book-intro-editor',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    regionScope: ['page_intro', 'book_intro'],
    requiredCapabilities: ['edit'],
    EditorComponent: BookIntroEditor,
    order: 20,
    description:
        'Renders the inline book intro editor for the new book intro surface while preserving the legacy overview flow.',
});
