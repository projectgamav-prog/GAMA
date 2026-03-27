import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CHAPTER_INTRO_SURFACE_KEY } from '@/admin/modules/shared/surface-keys';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import {
    buildScriptureAdminBlockHref,
    buildScriptureAdminSectionHref,
} from '@/lib/scripture-admin-navigation';
import { getChapterIntroMetadata } from './surface-types';

type ChapterIntroFormData = {
    block_type: string;
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

function ChapterIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getChapterIntroMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<ChapterIntroFormData>({
        block_type: metadata?.block?.block_type ?? 'text',
        title: metadata?.block?.title ?? '',
        body: metadata?.block?.body ?? '',
        region: metadata?.block?.region ?? 'study',
        sort_order: metadata?.block?.sort_order ?? 0,
        status: 'published',
    });

    if (metadata === null) {
        return null;
    }

    const fullEditHref =
        metadata.block !== null
            ? buildScriptureAdminBlockHref(
                  metadata.fullEditHref,
                  metadata.block.id,
              )
            : buildScriptureAdminSectionHref(
                  metadata.fullEditHref,
                  'content_blocks',
              );

    if (!metadata.block || !metadata.updateHref) {
        return (
            <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 rounded-full px-3"
            >
                <Link href={fullEditHref}>Full Edit</Link>
            </Button>
        );
    }

    const block = metadata.block;
    const introTypeLabel = block.block_type === 'quote' ? 'quote' : 'note';

    if (!isOpen) {
        return (
            <>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        form.setData({
                            block_type: block.block_type,
                            title: block.title ?? '',
                            body: block.body ?? '',
                            region: block.region,
                            sort_order: block.sort_order,
                            status: 'published',
                        });
                        form.clearErrors();
                        setIsOpen(true);
                    }}
                >
                    Edit
                </Button>
                <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full px-3"
                >
                    <Link href={fullEditHref}>Full Edit</Link>
                </Button>
            </>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title="Chapter intro"
                description={`Edit the primary introductory ${introTypeLabel} attached to this chapter.`}
                fullEditHref={fullEditHref}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(false);
                }}
                onSave={() => {
                    form.patch(metadata.updateHref!, {
                        preserveScroll: true,
                        onSuccess: () => setIsOpen(false),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                <div className="grid gap-2">
                    <Label htmlFor="chapter_intro_title">Title</Label>
                    <Input
                        id="chapter_intro_title"
                        autoFocus
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Block title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="chapter_intro_body">Body</Label>
                    <Textarea
                        id="chapter_intro_body"
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={8}
                        placeholder={
                            block.block_type === 'quote'
                                ? 'Published chapter quote'
                                : 'Published chapter introduction'
                        }
                    />
                    <InputError message={form.errors.body} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const chapterIntroEditorModule = defineAdminModule({
    key: 'chapter-intro-editor',
    surfaceKeys: CHAPTER_INTRO_SURFACE_KEY,
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['full_edit'],
    EditorComponent: ChapterIntroEditor,
    order: 20,
    description:
        'Renders the chapter intro controls for the semantic intro surface, falling back to full edit when no single inline intro block qualifies.',
});
