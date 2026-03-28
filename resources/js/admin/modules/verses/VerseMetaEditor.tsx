import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Input } from '@/components/ui/input';
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
import { getStructuredMetaContractMetadata } from '@/admin/surfaces/core/contract-readers';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { getUniqueVerseCharacterOptions } from '@/lib/scripture-character-options';
import type {
    ScriptureVerseCharacterAssignment,
    ScriptureVerseMeta,
} from '@/types';

type VerseMetaFormData = {
    primary_speaker_character_id: string;
    primary_listener_character_id: string;
    difficulty_level: string;
    summary_short: string;
};

const NONE_VALUE = '__none__';

function VerseMetaEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getStructuredMetaContractMetadata<
        ScriptureVerseMeta,
        { characters: ScriptureVerseCharacterAssignment[] }
    >(surface);
    const form = useForm<VerseMetaFormData>({
        primary_speaker_character_id: NONE_VALUE,
        primary_listener_character_id: NONE_VALUE,
        difficulty_level: '',
        summary_short: '',
    });

    if (metadata === null) {
        return null;
    }

    useEffect(() => {
        if (!activation.isActive) {
            form.clearErrors();
            form.reset();

            return;
        }

        form.setData({
            primary_speaker_character_id:
                metadata.value?.primary_speaker_character_id !== null &&
                metadata.value?.primary_speaker_character_id !== undefined
                    ? String(metadata.value.primary_speaker_character_id)
                    : NONE_VALUE,
            primary_listener_character_id:
                metadata.value?.primary_listener_character_id !== null &&
                metadata.value?.primary_listener_character_id !== undefined
                    ? String(metadata.value.primary_listener_character_id)
                    : NONE_VALUE,
            difficulty_level: metadata.value?.difficulty_level ?? '',
            summary_short: metadata.value?.summary_short ?? '',
        });
        form.clearErrors();
    }, [
        activation.isActive,
        form,
        metadata.value?.difficulty_level,
        metadata.value?.primary_listener_character_id,
        metadata.value?.primary_speaker_character_id,
        metadata.value?.summary_short,
    ]);

    const characterOptions = getUniqueVerseCharacterOptions(
        metadata.options.characters,
    );
    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'meta',
    );

    if (!activation.isActive) {
        return null;
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title="Verse meta"
                description="Update the structured verse metadata without re-entering the verse or region context."
                fullEditHref={fullEditHref}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    activation.deactivate();
                }}
                onSave={() => {
                    form.transform((data) => ({
                        primary_speaker_character_id:
                            data.primary_speaker_character_id === NONE_VALUE
                                ? null
                                : Number(data.primary_speaker_character_id),
                        primary_listener_character_id:
                            data.primary_listener_character_id === NONE_VALUE
                                ? null
                                : Number(data.primary_listener_character_id),
                        difficulty_level: data.difficulty_level,
                        summary_short: data.summary_short,
                        is_featured: metadata.value?.is_featured ?? false,
                    }));

                    form.patch(metadata.updateHref, {
                        preserveScroll: true,
                        onSuccess: () => activation.deactivate(),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                <div className="grid gap-2">
                    <Label htmlFor="verse_meta_summary">Summary</Label>
                    <Textarea
                        id="verse_meta_summary"
                        value={form.data.summary_short}
                        onChange={(event) =>
                            form.setData('summary_short', event.target.value)
                        }
                        rows={5}
                        placeholder="Short verse summary"
                    />
                    <InputError message={form.errors.summary_short} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="verse_meta_difficulty">Difficulty</Label>
                    <Input
                        id="verse_meta_difficulty"
                        value={form.data.difficulty_level}
                        onChange={(event) =>
                            form.setData(
                                'difficulty_level',
                                event.target.value,
                            )
                        }
                        placeholder="Intermediate"
                    />
                    <InputError message={form.errors.difficulty_level} />
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Speaker</Label>
                        <Select
                            value={form.data.primary_speaker_character_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'primary_speaker_character_id',
                                    value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select speaker" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE_VALUE}>
                                    Unassigned
                                </SelectItem>
                                {characterOptions.map((character) => (
                                    <SelectItem
                                        key={character.id}
                                        value={String(character.id)}
                                    >
                                        {character.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={form.errors.primary_speaker_character_id}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Listener</Label>
                        <Select
                            value={form.data.primary_listener_character_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'primary_listener_character_id',
                                    value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select listener" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE_VALUE}>
                                    Unassigned
                                </SelectItem>
                                {characterOptions.map((character) => (
                                    <SelectItem
                                        key={character.id}
                                        value={String(character.id)}
                                    >
                                        {character.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError
                            message={form.errors.primary_listener_character_id}
                        />
                    </div>
                </div>
            </ScriptureInlineRegionEditor>
        </div>
    );
}

export const verseMetaEditorModule = defineAdminModule({
    key: 'verse-meta-editor',
    contractKeys: 'structured_meta',
    entityScope: 'verse',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_meta',
            defaultLabel: 'Edit Meta',
            dynamicLabel: (surface) =>
                getStructuredMetaContractMetadata<
                    ScriptureVerseMeta,
                    { characters: ScriptureVerseCharacterAssignment[] }
                >(surface)?.value
                    ? 'Edit Meta'
                    : 'Add Meta',
            placement: 'inline',
            openMode: 'inline',
            priority: 20,
        },
    ],
    qualifies: (surface) =>
        getStructuredMetaContractMetadata<
            ScriptureVerseMeta,
            { characters: ScriptureVerseCharacterAssignment[] }
        >(surface) !== null,
    EditorComponent: VerseMetaEditor,
    order: 20,
    description:
        'Renders the verse-meta editor for the structured verse notes surface.',
});


