import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';

type Props = {
    session: ScriptureChapterAdminEditSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

type ChapterIntroDraft = {
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export function ScriptureChapterIntroInlineEditor({
    session,
    onCancel,
    onSaveSuccess,
}: Props) {
    const form = useForm<ChapterIntroDraft>({
        title: '',
        body: '',
        region: 'study',
        sort_order: 0,
        status: 'published',
    });
    const formErrors = form.errors as Record<string, string>;

    const syncSession = useEffectEvent(
        (currentSession: ScriptureChapterAdminEditSession | null) => {
            if (currentSession === null) {
                form.reset();
                form.clearErrors();

                return;
            }

            form.setData({
                title: currentSession.values.title,
                body: currentSession.values.body,
                region: currentSession.values.region,
                sort_order: currentSession.values.sort_order,
                status: currentSession.values.status,
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
        form.data.title !== session.values.title ||
        form.data.body !== session.values.body;
    const handleCancel = () => {
        form.reset();
        form.clearErrors();
        onCancel();
    };

    return (
        <ScriptureInlineRegionEditor
            title="Chapter intro"
            description="Edit the primary introductory note attached to this chapter."
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
            hasErrors={Object.keys(formErrors).length > 0}
            processing={form.processing}
        >
            <div className="grid gap-2">
                <Label htmlFor="inline_chapter_intro_title">Title</Label>
                <Input
                    id="inline_chapter_intro_title"
                    autoFocus
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    placeholder="Block title"
                />
                <InputError message={formErrors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="inline_chapter_intro_body">Body</Label>
                <Textarea
                    id="inline_chapter_intro_body"
                    value={form.data.body}
                    onChange={(event) =>
                        form.setData('body', event.target.value)
                    }
                    rows={8}
                    placeholder="Published chapter introduction"
                />
                <InputError message={formErrors.body} />
            </div>
        </ScriptureInlineRegionEditor>
    );
}
