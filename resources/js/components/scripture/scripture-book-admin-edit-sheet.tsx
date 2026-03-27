import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineAdminSheet } from '@/components/scripture/scripture-inline-admin-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    BookDetailsDraft,
    ContentBlockCreateDraft,
    ContentBlockEditDraft,
    ScriptureBookAdminEditSession,
} from '@/lib/book-admin-edit-session';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';

type Props = {
    session: ScriptureBookAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

export function ScriptureBookAdminEditSheet({ session, onOpenChange }: Props) {
    const detailsForm = useForm<BookDetailsDraft>({
        description: '',
    });
    const contentBlockForm = useForm<ContentBlockEditDraft>({
        block_type: 'text',
        title: '',
        body: '',
        region: 'overview',
        sort_order: 0,
        status: 'published',
    });
    const createContentBlockForm = useForm<ContentBlockCreateDraft>({
        block_type: 'text',
        title: '',
        body: '',
        region: 'overview',
        status: 'published',
        insertion_mode: 'end',
        relative_block_id: null,
    });
    const contentBlockErrors = contentBlockForm.errors as Record<
        string,
        string
    >;
    const createContentBlockErrors = createContentBlockForm.errors as Record<
        string,
        string
    >;

    const syncSession = useEffectEvent(
        (currentSession: ScriptureBookAdminEditSession | null) => {
            if (currentSession === null) {
                detailsForm.reset();
                detailsForm.clearErrors();
                contentBlockForm.reset();
                contentBlockForm.clearErrors();
                createContentBlockForm.reset();
                createContentBlockForm.clearErrors();

                return;
            }

            if (currentSession.kind === 'entity_details') {
                detailsForm.setData({
                    description: currentSession.values.description,
                });
                detailsForm.clearErrors();

                return;
            }

            if (currentSession.kind === 'content_block') {
                contentBlockForm.setData({
                    block_type: currentSession.values.block_type,
                    title: currentSession.values.title,
                    body: currentSession.values.body,
                    region: currentSession.values.region,
                    sort_order: currentSession.values.sort_order,
                    status: currentSession.values.status,
                });
                contentBlockForm.clearErrors();

                return;
            }

            createContentBlockForm.setData({
                block_type: currentSession.values.block_type,
                title: currentSession.values.title,
                body: currentSession.values.body,
                region: currentSession.values.region,
                status: currentSession.values.status,
                insertion_mode: currentSession.values.insertion_mode,
                relative_block_id: currentSession.values.relative_block_id,
            });
            createContentBlockForm.clearErrors();
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

    const submitCreateContentBlock = () => {
        if (session === null || session.kind !== 'create_content_block') {
            return;
        }

        createContentBlockForm.post(session.storeHref, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const processing =
        session?.kind === 'entity_details'
            ? detailsForm.processing
            : session?.kind === 'content_block'
              ? contentBlockForm.processing
              : createContentBlockForm.processing;
    const surfaceLabel =
        session?.kind === 'entity_details'
            ? 'Book intro'
            : session?.kind === 'content_block'
              ? 'Reading note'
              : 'Reading notes';

    return (
        <ScriptureInlineAdminSheet
            open={session !== null}
            onOpenChange={closeSheet}
            surfaceLabel={surfaceLabel}
            mode={
                session?.kind === 'create_content_block' ? 'create' : 'edit'
            }
            title={
                session?.kind === 'entity_details'
                    ? 'Edit book intro'
                    : session?.kind === 'content_block'
                      ? 'Edit reading note'
                      : 'Add reading note'
            }
            description={
                session
                    ? session.kind === 'create_content_block'
                        ? `Create a new block directly in ${scriptureInlineRegionLabel(session.meta.region)} for ${session.bookTitle}.`
                        : `Update the attached ${surfaceLabel.toLowerCase()} for ${session.bookTitle}.`
                    : ''
            }
            contextLabel="Book context"
            contextSlot={
                session ? (
                    <>
                        <p className="font-medium text-foreground">
                            {session.bookTitle}
                        </p>
                        {session.kind === 'entity_details' ? (
                            session.bookDescription ? (
                                <p className="leading-7 text-muted-foreground">
                                    {session.bookDescription}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    No public book description is set yet.
                                </p>
                            )
                        ) : session.kind === 'content_block' ? (
                            <p className="text-muted-foreground">
                                {session.block.block_type} block in{' '}
                                {session.block.region}.
                            </p>
                        ) : (
                            <>
                                <p className="font-medium text-foreground">
                                    {session.insertionLabel}
                                </p>
                                <p className="text-muted-foreground">
                                    The new block will publish into the selected
                                    book region at this position.
                                </p>
                            </>
                        )}
                    </>
                ) : undefined
            }
            fullEditHref={session?.fullEditHref ?? null}
            primaryActionLabel={
                session?.kind === 'create_content_block'
                    ? 'Add block'
                    : 'Save'
            }
            processingLabel={
                session?.kind === 'create_content_block' ? 'Adding...' : 'Saving...'
            }
            onPrimaryAction={
                session?.kind === 'entity_details'
                    ? submitDetails
                    : session?.kind === 'content_block'
                      ? submitContentBlock
                      : submitCreateContentBlock
            }
            processing={processing}
        >
            {session?.kind === 'entity_details' ? (
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="book_description">Description</Label>
                        <Textarea
                            id="book_description"
                            autoFocus
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
                        <InputError message={detailsForm.errors.description} />
                    </div>
                </div>
            ) : session?.kind === 'content_block' ? (
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="book_block_title">Title</Label>
                        <Input
                            id="book_block_title"
                            autoFocus
                            value={contentBlockForm.data.title}
                            onChange={(event) =>
                                contentBlockForm.setData(
                                    'title',
                                    event.target.value,
                                )
                            }
                            placeholder="Block title"
                        />
                        <InputError message={contentBlockErrors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="book_block_body">Body</Label>
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
                        <InputError message={contentBlockErrors.body} />
                    </div>
                </div>
            ) : session?.kind === 'create_content_block' ? (
                <div className="space-y-5">
                    <InputError
                        message={
                            createContentBlockErrors.insertion_mode ??
                            createContentBlockErrors.relative_block_id
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Block type
                            </p>
                            <p className="mt-2 font-medium text-foreground">
                                {scriptureAdminStartCase(
                                    createContentBlockForm.data.block_type,
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                Placement
                            </p>
                            <p className="mt-2 font-medium text-foreground">
                                {scriptureInlineRegionLabel(
                                    createContentBlockForm.data.region,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="book_create_block_title">Title</Label>
                        <Input
                            id="book_create_block_title"
                            autoFocus
                            value={createContentBlockForm.data.title}
                            onChange={(event) =>
                                createContentBlockForm.setData(
                                    'title',
                                    event.target.value,
                                )
                            }
                            placeholder="Optional block title"
                        />
                        <InputError message={createContentBlockErrors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="book_create_block_body">Body</Label>
                        <Textarea
                            id="book_create_block_body"
                            value={createContentBlockForm.data.body}
                            onChange={(event) =>
                                createContentBlockForm.setData(
                                    'body',
                                    event.target.value,
                                )
                            }
                            rows={8}
                            placeholder="Published block copy"
                        />
                        <InputError message={createContentBlockErrors.body} />
                    </div>
                </div>
            ) : null}
        </ScriptureInlineAdminSheet>
    );
}
