import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseAdminList } from '@/lib/scripture-admin';
import type { ScriptureVerseAdminEditSession } from '@/components/scripture/scripture-verse-admin-edit-sheet';

type InlineVerseNotesSession = Extract<
    ScriptureVerseAdminEditSession,
    { kind: 'verse_meta' }
>;

type VerseMetaDraft = {
    summary_short: string;
    is_featured: boolean;
    keywords_text: string;
    study_flags_text: string;
};

type Props = {
    session: InlineVerseNotesSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

export function ScriptureVerseNotesInlineEditor({
    session,
    onCancel,
    onSaveSuccess,
}: Props) {
    const form = useForm<VerseMetaDraft>({
        summary_short: '',
        is_featured: false,
        keywords_text: '',
        study_flags_text: '',
    });
    const formErrors = form.errors as Record<string, string>;

    const syncSession = useEffectEvent(
        (currentSession: InlineVerseNotesSession | null) => {
            if (currentSession === null) {
                form.reset();
                form.clearErrors();

                return;
            }

            form.setData({
                summary_short: currentSession.values.summary_short,
                is_featured: currentSession.values.is_featured,
                keywords_text: currentSession.values.keywords_text,
                study_flags_text: currentSession.values.study_flags_text,
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
        form.data.summary_short !== session.values.summary_short ||
        form.data.is_featured !== session.values.is_featured ||
        form.data.keywords_text !== session.values.keywords_text ||
        form.data.study_flags_text !== session.values.study_flags_text;
    const handleCancel = () => {
        form.reset();
        form.clearErrors();
        onCancel();
    };

    return (
        <ScriptureInlineRegionEditor
            title="Verse notes"
            description="Edit the attached verse study note directly in the page."
            fullEditHref={session.fullEditHref}
            onCancel={handleCancel}
            onSave={() => {
                form.transform((data) => ({
                    summary_short: data.summary_short,
                    is_featured: data.is_featured,
                    keywords: parseAdminList(data.keywords_text),
                    study_flags: parseAdminList(data.study_flags_text),
                }));

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
                <Label htmlFor="inline_summary_short">Summary</Label>
                <Textarea
                    id="inline_summary_short"
                    autoFocus
                    value={form.data.summary_short}
                    onChange={(event) =>
                        form.setData('summary_short', event.target.value)
                    }
                    rows={5}
                    placeholder="Add a short editorial summary for this verse."
                />
                <InputError message={form.errors.summary_short} />
            </div>

            <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
                <Checkbox
                    id="inline_is_featured"
                    checked={form.data.is_featured}
                    onCheckedChange={(checked) =>
                        form.setData('is_featured', checked === true)
                    }
                />
                <div className="space-y-1">
                    <Label htmlFor="inline_is_featured">Featured verse</Label>
                    <p className="text-sm text-muted-foreground">
                        Mark this verse for featured study treatment.
                    </p>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="inline_keywords_text">Keywords</Label>
                <Textarea
                    id="inline_keywords_text"
                    value={form.data.keywords_text}
                    onChange={(event) =>
                        form.setData('keywords_text', event.target.value)
                    }
                    rows={3}
                    placeholder="karma, duty, steadiness"
                />
                <p className="text-sm text-muted-foreground">
                    Separate items with commas or new lines.
                </p>
                <InputError
                    message={
                        formErrors.keywords ?? formErrors.keywords_text
                    }
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="inline_study_flags_text">Study flags</Label>
                <Textarea
                    id="inline_study_flags_text"
                    value={form.data.study_flags_text}
                    onChange={(event) =>
                        form.setData('study_flags_text', event.target.value)
                    }
                    rows={3}
                    placeholder="memorization, discourse"
                />
                <p className="text-sm text-muted-foreground">
                    Separate items with commas or new lines.
                </p>
                <InputError
                    message={
                        formErrors.study_flags ?? formErrors.study_flags_text
                    }
                />
            </div>
        </ScriptureInlineRegionEditor>
    );
}
