import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BookDetailsDraft, ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';

type InlineBookIntroSession = Extract<
    ScriptureBookAdminEditSession,
    { kind: 'entity_details' }
>;

type Props = {
    session: InlineBookIntroSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

export function ScriptureBookIntroInlineEditor({
    session,
    onCancel,
    onSaveSuccess,
}: Props) {
    const form = useForm<BookDetailsDraft>({
        description: '',
    });

    const syncSession = useEffectEvent(
        (currentSession: InlineBookIntroSession | null) => {
            if (currentSession === null) {
                form.reset();
                form.clearErrors();

                return;
            }

            form.setData({
                description: currentSession.values.description,
            });
            form.clearErrors();
        },
    );

    useEffect(() => {
        syncSession(session);
    }, [session, syncSession]);

    if (session === null) {
        return null;
    }

    const hasUnsavedChanges =
        form.data.description !== session.values.description;
    const handleCancel = () => {
        form.reset();
        form.clearErrors();
        onCancel();
    };

    return (
        <ScriptureInlineRegionEditor
            title="Book intro"
            description="Update the public introductory copy shown for this book."
            fullEditHref={session.fullEditHref}
            onCancel={handleCancel}
            onSave={() => {
                form.patch(session.updateHref, {
                    preserveScroll: true,
                    onSuccess: () => {
                        onSaveSuccess?.();
                        handleCancel();
                    },
                });
            }}
            isDirty={hasUnsavedChanges}
            hasErrors={Object.keys(form.errors).length > 0}
            processing={form.processing}
        >
            <div className="grid gap-2">
                <Label htmlFor="inline_book_description">Description</Label>
                <Textarea
                    id="inline_book_description"
                    autoFocus
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    rows={8}
                    placeholder="Add public editorial copy for this book."
                />
                <InputError message={form.errors.description} />
            </div>
        </ScriptureInlineRegionEditor>
    );
}
