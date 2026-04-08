import { router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getEntityActionsContractMetadata,
} from '@/admin/surfaces/core/contract-readers';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type NearbyVerseFormData = {
    slug: string;
    number: string;
    text: string;
};

const EMPTY_FORM: NearbyVerseFormData = {
    slug: '',
    number: '',
    text: '',
};

function VerseNearbyCreate({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getEntityActionsContractMetadata(surface);
    const form = useForm<NearbyVerseFormData>(EMPTY_FORM);

    useEffect(() => {
        if (!activation.isActive) {
            form.clearErrors();
            form.reset();
        }
    }, [activation.isActive, form]);

    if (
        metadata === null ||
        metadata.createHref === null ||
        !activation.isActive
    ) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={`Add verse near ${metadata.entityLabel}`}
                description={
                    metadata.parentLabel
                        ? `Create a new verse in ${metadata.parentLabel} without leaving the chapter page. Canonical placement follows the verse number you save.`
                        : 'Create a new verse from this row context without leaving the chapter page. Canonical placement follows the verse number you save.'
                }
                mode="create"
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.post(metadata.createHref!, {
                        preserveScroll: true,
                        onSuccess: () => {
                            form.reset();
                            activation.deactivate();
                        },
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
                saveLabel="Add Verse"
            >
                <div className="grid gap-2">
                    <Label htmlFor={`nearby_verse_slug_${surface.entityId}`}>
                        Slug
                    </Label>
                    <Input
                        id={`nearby_verse_slug_${surface.entityId}`}
                        autoFocus
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="verse-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`nearby_verse_number_${surface.entityId}`}>
                        Number
                    </Label>
                    <Input
                        id={`nearby_verse_number_${surface.entityId}`}
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`nearby_verse_text_${surface.entityId}`}>
                        Verse text
                    </Label>
                    <Textarea
                        id={`nearby_verse_text_${surface.entityId}`}
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={6}
                        placeholder="Enter the canonical verse text."
                    />
                    <InputError message={form.errors.text} />
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

function VerseFullEditLauncher({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getEntityActionsContractMetadata(surface);

    useEffect(() => {
        if (
            metadata === null ||
            metadata.fullEditHref === null ||
            !activation.isActive
        ) {
            return;
        }

        activation.deactivate();
        router.visit(metadata.fullEditHref);
    }, [activation.deactivate, activation.isActive, metadata]);

    return null;
}

export const verseNearbyCreateModule = defineAdminModule({
    key: 'verse-nearby-create',
    contractKeys: 'entity_actions',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['create_row'],
    actions: [
        {
            actionKey: 'create_row',
            defaultLabel: 'Add Nearby Verse',
            placement: 'dropdown',
            openMode: 'inline',
            priority: 40,
            variant: 'outline',
        },
    ],
    qualifies: (surface) =>
        Boolean(getEntityActionsContractMetadata(surface)?.createHref),
    EditorComponent: VerseNearbyCreate,
    order: 40,
    description:
        'Creates a nearby canonical verse from a verse-row action surface without pushing create logic back into the chapter page.',
});

export const verseFullEditLauncherModule = defineAdminModule({
    key: 'verse-full-edit-launcher',
    contractKeys: 'entity_actions',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['full_edit'],
    actions: [
        {
            actionKey: 'full_edit_verse',
            defaultLabel: 'Full Edit',
            placement: 'inline',
            openMode: 'inline',
            priority: 60,
            variant: 'outline',
        },
    ],
    qualifies: (surface) =>
        Boolean(getEntityActionsContractMetadata(surface)?.fullEditHref),
    EditorComponent: VerseFullEditLauncher,
    order: 60,
    description:
        'Launches the verse full-edit workspace from a verse-row action surface while keeping the chapter page compact.',
});
