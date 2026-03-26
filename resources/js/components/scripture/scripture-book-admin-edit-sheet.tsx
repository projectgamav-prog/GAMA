import { Link, useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type {
    BookDetailsDraft,
    ContentBlockCreateDraft,
    ContentBlockEditDraft,
    ScriptureBookAdminEditSession,
} from '@/lib/book-admin-edit-session';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';

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
                                        : session.kind === 'content_block'
                                          ? 'Edit book content block'
                                          : 'Add book content block'}
                                </SheetTitle>
                                <SheetDescription>
                                    Context-aware{' '}
                                    {session.kind === 'create_content_block'
                                        ? 'block creation'
                                        : 'editing'}{' '}
                                    for{' '}
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
                                            No public book description is set
                                            yet.
                                        </p>
                                    )
                                ) : session.kind === 'content_block' ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {session.block.block_type} block in{' '}
                                        {session.block.region}.
                                    </p>
                                ) : (
                                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                        <p>{session.insertionLabel}.</p>
                                        <p>
                                            This contextual flow creates a
                                            published block and places it at the
                                            chosen page position.
                                        </p>
                                    </div>
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
                                            message={
                                                detailsForm.errors.description
                                            }
                                        />
                                    </div>
                                </div>
                            ) : session.kind === 'content_block' ? (
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
                            ) : (
                                <div className="space-y-5">
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Insertion point
                                        </p>
                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            {session.insertionLabel}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            The new block will publish into the
                                            selected Book region and appear at
                                            this visual location.
                                        </p>
                                    </div>
                                    <InputError
                                        message={
                                            createContentBlockErrors.insertion_mode ??
                                            createContentBlockErrors.relative_block_id
                                        }
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="book_create_block_type">
                                                Block type
                                            </Label>
                                            <Select
                                                value={
                                                    createContentBlockForm.data
                                                        .block_type
                                                }
                                                onValueChange={(value) =>
                                                    createContentBlockForm.setData(
                                                        'block_type',
                                                        value as
                                                            | 'text'
                                                            | 'quote',
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="book_create_block_type">
                                                    <SelectValue placeholder="Choose block type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {session.allowedBlockTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type}
                                                                value={type}
                                                            >
                                                                {scriptureAdminStartCase(
                                                                    type,
                                                                )}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    createContentBlockErrors.block_type
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="book_create_block_region">
                                                Region
                                            </Label>
                                            <Select
                                                value={
                                                    createContentBlockForm.data
                                                        .region
                                                }
                                                onValueChange={(value) =>
                                                    createContentBlockForm.setData(
                                                        'region',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="book_create_block_region">
                                                    <SelectValue placeholder="Choose region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {session.allowedRegions.map(
                                                        (region) => (
                                                            <SelectItem
                                                                key={region}
                                                                value={region}
                                                            >
                                                                {scriptureAdminStartCase(
                                                                    region,
                                                                )}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    createContentBlockErrors.region
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="book_create_block_title">
                                            Title
                                        </Label>
                                        <Input
                                            id="book_create_block_title"
                                            value={
                                                createContentBlockForm.data
                                                    .title
                                            }
                                            onChange={(event) =>
                                                createContentBlockForm.setData(
                                                    'title',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Optional block title"
                                        />
                                        <InputError
                                            message={
                                                createContentBlockErrors.title
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="book_create_block_body">
                                            Body
                                        </Label>
                                        <Textarea
                                            id="book_create_block_body"
                                            value={
                                                createContentBlockForm.data.body
                                            }
                                            onChange={(event) =>
                                                createContentBlockForm.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Published block copy"
                                        />
                                        <InputError
                                            message={
                                                createContentBlockErrors.body
                                            }
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
                                        : session.kind === 'content_block'
                                          ? submitContentBlock
                                          : submitCreateContentBlock
                                }
                                disabled={processing}
                            >
                                {session.kind === 'create_content_block'
                                    ? 'Add block'
                                    : 'Save changes'}
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
