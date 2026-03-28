import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getSectionGroupMetadata } from '@/admin/surfaces/sections/surface-types';

type SectionRowDetailFormData = {
    number: string;
    title: string;
};

function SectionRowDetailEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getSectionGroupMetadata(surface);
    const form = useForm<SectionRowDetailFormData>({
        number: '',
        title: '',
    });

    if (metadata === null || metadata.updateHref === null) {
        return null;
    }

    useEffect(() => {
        if (!activation.isActive) {
            form.clearErrors();
            form.reset();

            return;
        }

        form.setData({
            number: metadata.rowNumber ?? '',
            title: metadata.rowTitle ?? '',
        });
        form.clearErrors();
    }, [activation.isActive, form, metadata.rowNumber, metadata.rowTitle]);

    const editorTitle = `${metadata.groupLabel} details`;

    if (!activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={editorTitle}
                description={`Update the stored number and title for this ${metadata.groupLabel.toLowerCase()} without tying the editor to one grouped layout.`}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.patch(metadata.updateHref!, {
                        preserveScroll: true,
                        onSuccess: () => activation.deactivate(),
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
    actions: [
        {
            actionKey: 'edit_details',
            placement: 'inline',
            openMode: 'inline',
            priority: 20,
        },
    ],
    qualifies: (surface) => getSectionGroupMetadata(surface)?.updateHref !== null,
    EditorComponent: SectionRowDetailEditor,
    order: 20,
    description:
        'Edits the stored number and title for semantic section-group rows without coupling the editor to one grouped page shell.',
});


