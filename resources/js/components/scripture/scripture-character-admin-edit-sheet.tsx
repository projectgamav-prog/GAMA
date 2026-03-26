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

type CharacterDetailsDraft = {
    description: string;
};

type ContentBlockDraft = {
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export type ScriptureCharacterAdminEditSession =
    | {
          kind: 'entity_details';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          characterName: string;
          characterDescription: string | null;
          values: CharacterDetailsDraft;
      }
    | {
          kind: 'content_block';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          characterName: string;
          characterDescription: string | null;
          block: ScriptureContentBlock;
          values: ContentBlockDraft;
      };

type Props = {
    session: ScriptureCharacterAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

export function ScriptureCharacterAdminEditSheet({
    session,
    onOpenChange,
}: Props) {
    const detailsForm = useForm<CharacterDetailsDraft>({
        description: '',
    });
    const contentBlockForm = useForm<ContentBlockDraft>({
        title: '',
        body: '',
        region: 'study',
        sort_order: 0,
        status: 'published',
    });
    const contentBlockErrors = contentBlockForm.errors as Record<string, string>;

    const syncSession = useEffectEvent(
        (currentSession: ScriptureCharacterAdminEditSession | null) => {
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
                                        ? 'Edit character details'
                                        : 'Edit character note'}
                                </SheetTitle>
                                <SheetDescription>
                                    Context-aware editing for{' '}
                                    <span className="font-medium text-foreground">
                                        {session.characterName}
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
                                    Character context
                                </p>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    {session.characterName}
                                </p>
                                {session.characterDescription ? (
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                        {session.characterDescription}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No public character description is set yet.
                                    </p>
                                )}
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                            {session.kind === 'entity_details' ? (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="character_description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="character_description"
                                            value={detailsForm.data.description}
                                            onChange={(event) =>
                                                detailsForm.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Add public editorial copy for this character."
                                        />
                                        <InputError
                                            message={detailsForm.errors.description}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="character_block_title">
                                            Title
                                        </Label>
                                        <Input
                                            id="character_block_title"
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
                                        <Label htmlFor="character_block_body">
                                            Body
                                        </Label>
                                        <Textarea
                                            id="character_block_body"
                                            value={contentBlockForm.data.body}
                                            onChange={(event) =>
                                                contentBlockForm.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Published character note copy"
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
