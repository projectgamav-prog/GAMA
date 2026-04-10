import { Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import type { IntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { getIntroContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type { ScriptureBook, ScriptureCmsPageOption } from '@/types';

const NO_OVERVIEW_PAGE_VALUE = '__none__';

type BookIntroSurfaceMetadata = IntroContractMetadata<ScriptureBook> & {
    overviewPageId?: number | null;
    overviewPageOptions?: ScriptureCmsPageOption[];
    cmsPagesIndexHref?: string | null;
};

type BookIntroFormData = {
    description: string;
    overview_page_id: string;
};

function BookIntroEditor({ surface, activation }: AdminModuleComponentProps) {
    const metadata = getIntroContractMetadata<ScriptureBook>(
        surface,
    ) as BookIntroSurfaceMetadata | null;
    const isCompact = surface.presentation?.variant === 'compact';
    const hasIntro = Boolean(metadata?.textValue?.trim());
    const form = useForm<BookIntroFormData>({
        description: '',
        overview_page_id: '',
    });

    if (metadata === null) {
        return null;
    }

    const overviewPageOptions = Array.isArray(metadata.overviewPageOptions)
        ? metadata.overviewPageOptions
        : [];
    const selectedOverviewPage =
        overviewPageOptions.find(
            (option) => String(option.id) === form.data.overview_page_id,
        ) ?? null;

    useEffect(() => {
        if (!activation.isActive) {
            form.clearErrors();
            form.reset();

            return;
        }

        form.setData({
            description: metadata.textValue ?? '',
            overview_page_id:
                metadata.overviewPageId === null ||
                metadata.overviewPageId === undefined
                    ? ''
                    : String(metadata.overviewPageId),
        });
        form.clearErrors();
    }, [activation.isActive, form, metadata.overviewPageId, metadata.textValue]);

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'details',
    );
    const updateHref = metadata.updateHref;

    if (updateHref === null) {
        return null;
    }

    if (!activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={hasIntro ? 'Book intro' : 'Add book intro'}
                description={
                    isCompact
                        ? 'Update the public intro shown for this book on the library card.'
                        : 'Update the public intro shown for this book across its public book pages.'
                }
                fullEditHref={fullEditHref}
                mode={hasIntro ? 'edit' : 'create'}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.patch(updateHref, {
                        preserveScroll: true,
                        onSuccess: () => activation.deactivate(),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
                saveLabel={hasIntro ? 'Save' : 'Add Intro'}
            >
                <div className="grid gap-2">
                    <Label htmlFor="book_intro_description">Description</Label>
                    <Textarea
                        id="book_intro_description"
                        autoFocus
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        rows={isCompact ? 6 : 8}
                        placeholder="Add public editorial copy for this book."
                    />
                    <InputError message={form.errors.description} />
                </div>

                <div className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label htmlFor="book_intro_overview_page">
                            CMS overview page
                        </Label>
                        {metadata.cmsPagesIndexHref && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={metadata.cmsPagesIndexHref}>
                                    <SquareArrowOutUpRight className="size-4" />
                                    Open CMS Pages
                                </Link>
                            </Button>
                        )}
                    </div>
                    <Select
                        value={
                            form.data.overview_page_id || NO_OVERVIEW_PAGE_VALUE
                        }
                        onValueChange={(value) =>
                            form.setData(
                                'overview_page_id',
                                value === NO_OVERVIEW_PAGE_VALUE ? '' : value,
                            )
                        }
                    >
                        <SelectTrigger id="book_intro_overview_page">
                            <SelectValue placeholder="No CMS overview page linked" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_OVERVIEW_PAGE_VALUE}>
                                No CMS overview page
                            </SelectItem>
                            {overviewPageOptions.map((page) => (
                                <SelectItem
                                    key={page.id}
                                    value={String(page.id)}
                                >
                                    {page.title} ({page.status})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Link a CMS page here to show Overview buttons from the
                        book card and chapter-list header. Draft CMS pages stay
                        hidden publicly until published.
                    </p>
                    {selectedOverviewPage && (
                        <p className="text-sm text-muted-foreground">
                            Linked page: {selectedOverviewPage.title} (
                            {selectedOverviewPage.status})
                        </p>
                    )}
                    <InputError message={form.errors.overview_page_id} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const bookIntroEditorModule = defineAdminModule({
    key: 'book-intro-editor',
    contractKeys: 'intro',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_intro',
            placement: 'inline',
            openMode: 'inline',
            priority: 20,
        },
    ],
    qualifies: (surface) =>
        getIntroContractMetadata<ScriptureBook>(surface)?.introKind ===
        'field',
    EditorComponent: BookIntroEditor,
    order: 20,
    description:
        'Renders the inline book intro editor for the semantic book intro surface.',
});


