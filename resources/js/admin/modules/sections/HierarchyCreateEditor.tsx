import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    BOOK_CHAPTER_GROUPS_SURFACE_KEY,
    BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
    BOOKS_COLLECTION_SURFACE_KEY,
    CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    CHAPTER_VERSE_GROUPS_SURFACE_KEY,
} from '@/admin/surfaces/core/surface-keys';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    getSectionCreateMetadata,
    type SectionCreateFieldKey,
} from '@/admin/surfaces/sections/surface-types';

type HierarchyCreateFormData = {
    slug: string;
    number: string;
    title: string;
    text: string;
};

const EMPTY_CREATE_FORM: HierarchyCreateFormData = {
    slug: '',
    number: '',
    title: '',
    text: '',
};

function HierarchyCreateEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getSectionCreateMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<HierarchyCreateFormData>(EMPTY_CREATE_FORM);

    if (metadata === null) {
        return null;
    }

    const editorTitle = `Create ${metadata.entityLabel}`;
    const description = metadata.parentLabel
        ? `Create a new ${metadata.entityLabel.toLowerCase()} under ${metadata.parentLabel} without tying the workflow to one grouped page layout.`
        : `Create a new ${metadata.entityLabel.toLowerCase()} from this semantic collection surface.`;

    function resetAndClose(): void {
        form.reset();
        form.clearErrors();
        setIsOpen(false);
    }

    function setFieldValue(key: SectionCreateFieldKey, value: string): void {
        form.setData(key, value);
    }

    if (!isOpen) {
        return (
            <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3"
                onClick={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(true);
                }}
            >
                Add {metadata.entityLabel}
            </Button>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={editorTitle}
                description={description}
                onCancel={resetAndClose}
                onSave={() => {
                    form.post(metadata.createHref, {
                        preserveScroll: true,
                        onSuccess: () => {
                            form.reset();
                            setIsOpen(false);
                        },
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                {metadata.fields.map((field, index) => {
                    const inputId = `create_${field.key}_${surface.entity}_${surface.entityId}`;

                    return (
                        <div key={field.key} className="grid gap-2">
                            <Label htmlFor={inputId}>{field.label}</Label>
                            {field.multiline ? (
                                <Textarea
                                    id={inputId}
                                    autoFocus={index === 0}
                                    value={form.data[field.key]}
                                    onChange={(event) =>
                                        setFieldValue(
                                            field.key,
                                            event.target.value,
                                        )
                                    }
                                    placeholder={field.placeholder}
                                    rows={5}
                                />
                            ) : (
                                <Input
                                    id={inputId}
                                    autoFocus={index === 0}
                                    value={form.data[field.key]}
                                    onChange={(event) =>
                                        setFieldValue(
                                            field.key,
                                            event.target.value,
                                        )
                                    }
                                    placeholder={field.placeholder}
                                />
                            )}
                            <InputError message={form.errors[field.key]} />
                        </div>
                    );
                })}
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const hierarchyCreateEditorModule = defineAdminModule({
    key: 'hierarchy-create-editor',
    surfaceKeys: [
        BOOKS_COLLECTION_SURFACE_KEY,
        BOOK_CHAPTER_GROUPS_SURFACE_KEY,
        BOOK_SECTION_CHAPTER_GROUP_SURFACE_KEY,
        CHAPTER_VERSE_GROUPS_SURFACE_KEY,
        CHAPTER_SECTION_VERSE_GROUP_SURFACE_KEY,
    ],
    entityScope: ['book', 'book_section', 'chapter', 'chapter_section'],
    surfaceSlots: 'inline_editor',
    presentationVariants: 'compact',
    requiredCapabilities: ['create_row'],
    EditorComponent: HierarchyCreateEditor,
    order: 15,
    description:
        'Creates canonical hierarchy rows from semantic collection and group surfaces using the minimum safe field set for each parent context.',
});


