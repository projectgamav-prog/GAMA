import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineAdminSheet } from '@/components/scripture/scripture-inline-admin-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import type { ScriptureContentBlock, ScriptureEntityRegionMeta } from '@/types';

type ContentBlockDraft = {
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export type ScriptureChapterAdminEditSession = {
    meta: ScriptureEntityRegionMeta;
    updateHref: string;
    fullEditHref: string;
    bookTitle: string;
    bookSectionTitle: string;
    chapterTitle: string;
    block: ScriptureContentBlock;
    values: ContentBlockDraft;
};

type Props = {
    session: ScriptureChapterAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

export function ScriptureChapterAdminEditSheet({
    session,
    onOpenChange,
}: Props) {
    const form = useForm<ContentBlockDraft>({
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

    const closeSheet = (open: boolean) => {
        if (!open) {
            onOpenChange(false);
        }
    };

    const submit = () => {
        if (session === null) {
            return;
        }

        form.patch(session.updateHref, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };
    const surfaceLabel =
        session?.meta.region === 'page_intro'
            ? 'Chapter intro'
            : 'Published note';

    return (
        <ScriptureInlineAdminSheet
            open={session !== null}
            onOpenChange={closeSheet}
            surfaceLabel={surfaceLabel}
            mode="edit"
            title={
                session?.meta.region === 'page_intro'
                    ? 'Edit chapter intro'
                    : 'Edit published note'
            }
            description={
                session
                    ? `Update the attached ${scriptureInlineRegionLabel(session.meta.region, surfaceLabel).toLowerCase()} for ${session.chapterTitle}.`
                    : ''
            }
            contextLabel="Chapter context"
            contextSlot={
                session ? (
                    <>
                        <p className="font-medium text-foreground">
                            {session.bookTitle}
                        </p>
                        <p className="text-muted-foreground">
                            {session.bookSectionTitle}
                        </p>
                        <p className="text-muted-foreground">
                            {session.chapterTitle}
                        </p>
                        <p className="text-muted-foreground">
                            Text block in {session.block.region}.
                        </p>
                    </>
                ) : undefined
            }
            fullEditHref={session?.fullEditHref ?? null}
            primaryActionLabel="Save"
            processingLabel="Saving..."
            onPrimaryAction={submit}
            processing={form.processing}
        >
            {session && (
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="chapter_block_title">Title</Label>
                        <Input
                            id="chapter_block_title"
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
                        <Label htmlFor="chapter_block_body">Body</Label>
                        <Textarea
                            id="chapter_block_body"
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                            rows={8}
                            placeholder="Published chapter note copy"
                        />
                        <InputError message={formErrors.body} />
                    </div>
                </div>
            )}
        </ScriptureInlineAdminSheet>
    );
}
