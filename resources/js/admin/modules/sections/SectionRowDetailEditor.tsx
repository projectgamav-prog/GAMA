import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getSectionGroupMetadata } from '@/admin/surfaces/sections/surface-types';

type SectionRowDetailFormData = {
    number: string;
    title: string;
};

function SectionRowDetailEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getSectionGroupMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<SectionRowDetailFormData>({
        number: metadata?.rowNumber ?? '',
        title: metadata?.rowTitle ?? '',
    });

    if (metadata === null || metadata.updateHref === null) {
        return null;
    }

    const editorTitle = `${metadata.groupLabel} details`;

    if (!isOpen) {
        return (
            <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3"
                onClick={() => {
                    form.setData({
                        number: metadata.rowNumber ?? '',
                        title: metadata.rowTitle ?? '',
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
                title={editorTitle}
                description={`Update the stored number and title for this ${metadata.groupLabel.toLowerCase()} without tying the editor to one grouped layout.`}
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
                    <Label htmlFor={`section_row_number_${surface.entity}_${surface.entityId}`}>
                        Number
                    </Label>
                    <Input
                        id={`section_row_number_${surface.entity}_${surface.entityId}`}
                        autoFocus
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`section_row_title_${surface.entity}_${surface.entityId}`}>
                        Title
                    </Label>
                    <Input
                        id={`section_row_title_${surface.entity}_${surface.entityId}`}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Section title"
                    />
                    <InputError message={form.errors.title} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const sectionRowDetailEditorModule = defineAdminModule({
    key: 'section-row-detail-editor',
    contractKeys: 'section_group',
    entityScope: ['book_section', 'chapter_section'],
    surfaceSlots: 'inline_editor',
    presentationVariants: 'compact',
    requiredCapabilities: ['edit'],
    qualifies: (surface) => getSectionGroupMetadata(surface)?.updateHref !== null,
    EditorComponent: SectionRowDetailEditor,
    order: 20,
    description:
        'Edits the stored number and title for semantic section-group rows without coupling the editor to one grouped page shell.',
});


