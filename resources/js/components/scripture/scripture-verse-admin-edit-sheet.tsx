import { Link, useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { parseAdminList } from '@/lib/scripture-admin';
import type { ScriptureContentBlock, ScriptureEntityRegionMeta } from '@/types';

type VerseMetaDraft = {
    summary_short: string;
    is_featured: boolean;
    keywords_text: string;
    study_flags_text: string;
};

type ContentBlockDraft = {
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

export type ScriptureVerseAdminEditSession =
    | {
          kind: 'verse_meta';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          verseTitle: string;
          verseText: string;
          values: VerseMetaDraft;
      }
    | {
          kind: 'content_block';
          meta: ScriptureEntityRegionMeta;
          updateHref: string;
          fullEditHref: string;
          verseTitle: string;
          verseText: string;
          block: ScriptureContentBlock;
          values: ContentBlockDraft;
      };

type Props = {
    session: ScriptureVerseAdminEditSession | null;
    onOpenChange: (open: boolean) => void;
};

export function ScriptureVerseAdminEditSheet({
    session,
    onOpenChange,
}: Props) {
    const verseMetaForm = useForm<VerseMetaDraft>({
        summary_short: '',
        is_featured: false,
        keywords_text: '',
        study_flags_text: '',
    });
    const contentBlockForm = useForm<ContentBlockDraft>({
        title: '',
        body: '',
        region: 'study',
        sort_order: 0,
        status: 'published',
    });

    const verseMetaErrors = verseMetaForm.errors as Record<string, string>;
    const contentBlockErrors = contentBlockForm.errors as Record<string, string>;

    const syncSession = useEffectEvent(
        (currentSession: ScriptureVerseAdminEditSession | null) => {
            if (currentSession === null) {
                verseMetaForm.reset();
                verseMetaForm.clearErrors();
                contentBlockForm.reset();
                contentBlockForm.clearErrors();

                return;
            }

            if (currentSession.kind === 'verse_meta') {
                verseMetaForm.setData({
                    summary_short: currentSession.values.summary_short,
                    is_featured: currentSession.values.is_featured,
                    keywords_text: currentSession.values.keywords_text,
                    study_flags_text: currentSession.values.study_flags_text,
                });
                verseMetaForm.clearErrors();

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

    const isOpen = session !== null;

    const closeSheet = (open: boolean) => {
        if (!open) {
            onOpenChange(false);
        }
    };

    const submitVerseMeta = () => {
        if (session === null || session.kind !== 'verse_meta') {
            return;
        }

        verseMetaForm.transform((data) => ({
            summary_short: data.summary_short,
            is_featured: data.is_featured,
            keywords: parseAdminList(data.keywords_text),
            study_flags: parseAdminList(data.study_flags_text),
        }));

        verseMetaForm.patch(session.updateHref, {
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
        session?.kind === 'verse_meta'
            ? verseMetaForm.processing
            : contentBlockForm.processing;

    return (
        <Sheet open={isOpen} onOpenChange={closeSheet}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                {session && (
                    <>
                        <SheetHeader className="space-y-3 border-b">
                            <div className="space-y-2">
                                <SheetTitle>
                                    {session.kind === 'verse_meta'
                                        ? 'Edit verse notes'
                                        : 'Edit note block'}
                                </SheetTitle>
                                <SheetDescription>
                                    Context-aware editing for {session.verseTitle}{' '}
                                    in region{' '}
                                    <span className="font-medium text-foreground">
                                        {session.meta.region}
                                    </span>
                                    .
                                </SheetDescription>
                            </div>

                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Canonical verse context
                                </p>
                                <p className="mt-3 text-sm leading-7 text-foreground">
                                    {session.verseText}
                                </p>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                            {session.kind === 'verse_meta' ? (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="summary_short">
                                            Summary
                                        </Label>
                                        <Textarea
                                            id="summary_short"
                                            value={verseMetaForm.data.summary_short}
                                            onChange={(event) =>
                                                verseMetaForm.setData(
                                                    'summary_short',
                                                    event.target.value,
                                                )
                                            }
                                            rows={5}
                                            placeholder="Add a short editorial summary for this verse."
                                        />
                                        <InputError
                                            message={
                                                verseMetaForm.errors.summary_short
                                            }
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
                                        <Checkbox
                                            id="is_featured"
                                            checked={
                                                verseMetaForm.data.is_featured
                                            }
                                            onCheckedChange={(checked) =>
                                                verseMetaForm.setData(
                                                    'is_featured',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="is_featured">
                                                Featured verse
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Mark this verse for featured
                                                study treatment.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="keywords_text">
                                            Keywords
                                        </Label>
                                        <Textarea
                                            id="keywords_text"
                                            value={
                                                verseMetaForm.data.keywords_text
                                            }
                                            onChange={(event) =>
                                                verseMetaForm.setData(
                                                    'keywords_text',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="karma, duty, steadiness"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Separate items with commas or new
                                            lines.
                                        </p>
                                        <InputError
                                            message={
                                                verseMetaErrors.keywords ??
                                                verseMetaErrors.keywords_text
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="study_flags_text">
                                            Study flags
                                        </Label>
                                        <Textarea
                                            id="study_flags_text"
                                            value={
                                                verseMetaForm.data
                                                    .study_flags_text
                                            }
                                            onChange={(event) =>
                                                verseMetaForm.setData(
                                                    'study_flags_text',
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="memorization, discourse"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Separate items with commas or new
                                            lines.
                                        </p>
                                        <InputError
                                            message={
                                                verseMetaErrors.study_flags ??
                                                verseMetaErrors.study_flags_text
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="block_title">
                                            Title
                                        </Label>
                                        <Input
                                            id="block_title"
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
                                        <Label htmlFor="block_body">Body</Label>
                                        <Textarea
                                            id="block_body"
                                            value={contentBlockForm.data.body}
                                            onChange={(event) =>
                                                contentBlockForm.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            rows={8}
                                            placeholder="Published note copy"
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
                            <Button
                                asChild
                                variant="outline"
                            >
                                <Link href={session.fullEditHref}>
                                    Open Full edit
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                onClick={
                                    session.kind === 'verse_meta'
                                        ? submitVerseMeta
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
