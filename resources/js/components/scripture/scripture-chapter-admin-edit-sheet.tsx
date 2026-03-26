import { Link, useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
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
    }, [session]);

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

    return (
        <Sheet open={session !== null} onOpenChange={closeSheet}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                {session && (
                    <>
                        <SheetHeader className="space-y-3 border-b">
                            <div className="space-y-2">
                                <SheetTitle>Edit chapter note</SheetTitle>
                                <SheetDescription>
                                    Context-aware editing for{' '}
                                    <span className="font-medium text-foreground">
                                        {session.chapterTitle}
                                    </span>{' '}
                                    from{' '}
                                    <span className="font-medium text-foreground">
                                        {session.meta.region}
                                    </span>
                                    . This updates the attached published text
                                    note in block region{' '}
                                    <span className="font-medium text-foreground">
                                        {session.block.region}
                                    </span>
                                    .
                                </SheetDescription>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Chapter context
                                </p>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    {session.bookTitle}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {session.bookSectionTitle}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {session.chapterTitle}
                                </p>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
                            <div className="grid gap-2">
                                <Label htmlFor="chapter_block_title">Title</Label>
                                <Input
                                    id="chapter_block_title"
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
                                            event.target.value,
                                        )
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

                        <SheetFooter className="border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={session.fullEditHref}>
                                    Open Full edit
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={form.processing}
                            >
                                Save changes
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
