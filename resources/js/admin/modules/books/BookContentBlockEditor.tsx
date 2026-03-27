import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import { getBookContentBlockMetadata } from './surface-types';

type BookContentBlockFormData = {
    block_type: string;
    title: string;
    body: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

function BookContentBlockEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getBookContentBlockMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<BookContentBlockFormData>({
        block_type: metadata?.block.block_type ?? 'text',
        title: metadata?.block.title ?? '',
        body: metadata?.block.body ?? '',
        region: metadata?.block.region ?? 'overview',
        sort_order: metadata?.block.sort_order ?? 0,
        status: 'published',
    });

    if (metadata === null) {
        return null;
    }

    if (!isOpen) {
        return (
            <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3"
                onClick={() => {
                    form.setData({
                        block_type: metadata.block.block_type,
                        title: metadata.block.title ?? '',
                        body: metadata.block.body ?? '',
                        region: metadata.block.region,
                        sort_order: metadata.block.sort_order,
                        status: 'published',
                    });
                    form.clearErrors();
                    setIsOpen(true);
                }}
            >
                Edit
            </Button>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={`${scriptureAdminStartCase(metadata.block.block_type)} block`}
                description={`Update this ${scriptureInlineRegionLabel(metadata.block.region).toLowerCase()} block directly in ${metadata.entityLabel}.`}
                fullEditHref={metadata.fullEditHref}
                metaSlot={
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                            {scriptureAdminStartCase(metadata.block.block_type)}
                        </Badge>
                        <Badge variant="secondary">
                            {scriptureInlineRegionLabel(metadata.block.region)}
                        </Badge>
                    </div>
                }
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(false);
                }}
                onSave={() => {
                    form.patch(metadata.updateHref, {
                        preserveScroll: true,
                        onSuccess: () => setIsOpen(false),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                <div className="grid gap-2">
                    <Label htmlFor={`book_block_title_${metadata.block.id}`}>
                        Title
                    </Label>
                    <Input
                        id={`book_block_title_${metadata.block.id}`}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Optional block title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`book_block_body_${metadata.block.id}`}>
                        Body
                    </Label>
                    <Textarea
                        id={`book_block_body_${metadata.block.id}`}
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={8}
                        placeholder="Published block copy"
                    />
                    <InputError message={form.errors.body} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const bookContentBlockEditorModule = defineAdminModule({
    key: 'book-content-block-editor',
    entityScope: 'content_block',
    surfaceSlots: 'inline_editor',
    regionScope: 'content_blocks',
    blockTypes: ['text', 'quote'],
    requiredCapabilities: ['edit'],
    EditorComponent: BookContentBlockEditor,
    order: 30,
    description:
        'Renders the book block inline editor for published text and quote blocks.',
});
