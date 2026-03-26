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

type BookDetailsDraft = {
    description: string;
};

type ContentBlockDraft = {
    block_type: 'text' | 'quote';
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export type ScriptureBookAdminEditSession =
    | {
          kind: 'entity_details';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          bookTitle: string;
          bookDescription: string | null;
          values: BookDetailsDraft;
      }
    | {
          kind: 'content_block';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          bookTitle: string;
          block: ScriptureContentBlock;
          values: ContentBlockDraft;
      };

type Props = {
    session: ScriptureBookAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

export function ScriptureBookAdminEditSheet({
    session,
    onOpenChange,
}: Props) {
    const detailsForm = useForm<BookDetailsDraft>({
        description: '',
    });
    const contentBlockForm = useForm<ContentBlockDraft>({
        block_type: 'text',
        title: '',
        body: '',
        region: 'overview',
        sort_order: 0,
        status: 'published',
    });
    const contentBlockErrors = contentBlockForm.errors as Record<string, string>;

    const syncSession = useEffectEvent(
        (currentSession: ScriptureBookAdminEditSession | null) => {
            if (currentSession === null) {
                detailsForm.reset();
                detailsForm.clearErrors();
                contentBlockForm.reset();
                contentBlockForm.clearErrors();

                return;
            }

            if (currentSession.kind === 'entity_details') {
                detailsForm.setData({
                    description: currentSession.values.description,
                });
                detailsForm.clearErrors();

                return;
            }

            contentBlockForm.setData({
                block_type: currentSession.values.block_type,
                title: currentSession.values.title,
                body: currentSession.values.body,
                region: currentSession.values.region,
                sort_order: currentSession.values.sort_order,
                status: currentSession.values.status,
            });
            contentBlockForm.clearErrors();
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

    const submitDetails = () => {
        if (session === null || session.kind !== 'entity_details') {
            return;
        }

        detailsForm.patch(session.updateHref, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const submitContentBlock = () => {
        if (session === null || session.kind !== 'content_block') {
            return;
        }

        contentBlockForm.patch(session.updateHref, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const processing =
        session?.kind === 'entity_details'
            ? detailsForm.processing
            : contentBlockForm.processing;

    return (
        <Sheet open={session !== null} onOpenChange={closeSheet}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                {session && (
                    <>
                        <SheetHeader className="space-y-3 border-b">
                            <div className="space-y-2">
                                <SheetTitle>
                                    {session.kind === 'entity_details'
                                        ? 'Edit book description'
                                        : 'Edit book content block'}
                                </SheetTitle>
                                <SheetDescription>
                                    Context-aware editing for{' '}
                                    <span className="font-medium text-foreground">
                                        {session.bookTitle}
                                    </span>{' '}
                                    in region{' '}
                                    <span className="font-medium text-foreground">
                                        {session.meta.region}
                                    </span>
                                    .
                                </SheetDescription>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Book context
                                </p>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    {session.bookTitle}
                                </p>
                                {session.kind === 'entity_details' ? (
                                    session.bookDescription ? (
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                            {session.bookDescription}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No public book description is set yet.
                                        </p>
                                    )
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {session.block.block_type} block in{' '}
                                        {session.block.region}.
                                    </p>
                                )}
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                            {session.kind === 'entity_details' ? (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="book_description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="book_description"
                                            value={detailsForm.data.description}
                                            onChange={(event) =>
                                                detailsForm.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Add public editorial copy for this book."
                                        />
                                        <InputError
                                            message={detailsForm.errors.description}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="book_block_title">
                                            Title
                                        </Label>
                                        <Input
                                            id="book_block_title"
                                            value={contentBlockForm.data.title}
                                            onChange={(event) =>
                                                contentBlockForm.setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Block title"
                                        />
                                        <InputError
                                            message={contentBlockErrors.title}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="book_block_body">
                                            Body
                                        </Label>
                                        <Textarea
                                            id="book_block_body"
                                            value={contentBlockForm.data.body}
                                            onChange={(event) =>
                                                contentBlockForm.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Published block copy"
                                        />
                                        <InputError
                                            message={contentBlockErrors.body}
                                        />
                                    </div>
                                </div>
                            )}
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
                                onClick={
                                    session.kind === 'entity_details'
                                        ? submitDetails
                                        : submitContentBlock
                                }
                                disabled={processing}
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
