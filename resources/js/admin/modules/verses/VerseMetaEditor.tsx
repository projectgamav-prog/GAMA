import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
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
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import { getUniqueVerseCharacterOptions } from '@/lib/scripture-character-options';
import { getVerseMetaMetadata } from '@/admin/surfaces/scripture/verses/surface-types';

type VerseMetaFormData = {
    primary_speaker_character_id: string;
    primary_listener_character_id: string;
    difficulty_level: string;
    summary_short: string;
};

const NONE_VALUE = '__none__';

function VerseMetaEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getVerseMetaMetadata(surface);
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<VerseMetaFormData>({
        primary_speaker_character_id:
            metadata?.verseMeta?.primary_speaker_character_id !== null &&
            metadata?.verseMeta?.primary_speaker_character_id !== undefined
                ? String(metadata.verseMeta.primary_speaker_character_id)
                : NONE_VALUE,
        primary_listener_character_id:
            metadata?.verseMeta?.primary_listener_character_id !== null &&
            metadata?.verseMeta?.primary_listener_character_id !== undefined
                ? String(metadata.verseMeta.primary_listener_character_id)
                : NONE_VALUE,
        difficulty_level: metadata?.verseMeta?.difficulty_level ?? '',
        summary_short: metadata?.verseMeta?.summary_short ?? '',
    });

    if (metadata === null) {
        return null;
    }

    const characterOptions = getUniqueVerseCharacterOptions(metadata.characters);
    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'meta',
    );

    if (!isOpen) {
        return (
            <>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        form.setData({
                            primary_speaker_character_id:
                                metadata.verseMeta
                                    ?.primary_speaker_character_id !== null &&
                                metadata.verseMeta
                                    ?.primary_speaker_character_id !==
                                    undefined
                                    ? String(
                                          metadata.verseMeta
                                              .primary_speaker_character_id,
                                      )
                                    : NONE_VALUE,
                            primary_listener_character_id:
                                metadata.verseMeta
                                    ?.primary_listener_character_id !== null &&
                                metadata.verseMeta
                                    ?.primary_listener_character_id !==
                                    undefined
                                    ? String(
                                          metadata.verseMeta
                                              .primary_listener_character_id,
                                      )
                                    : NONE_VALUE,
                            difficulty_level:
                                metadata.verseMeta?.difficulty_level ?? '',
                            summary_short:
                                metadata.verseMeta?.summary_short ?? '',
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
                title="Verse meta"
                description="Update the structured verse metadata without re-entering the verse or region context."
                fullEditHref={fullEditHref}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(false);
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
                        is_featured: metadata.verseMeta?.is_featured ?? false,
                    }));

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
    qualifies: (surface) => getVerseMetaMetadata(surface) !== null,
    EditorComponent: VerseMetaEditor,
    order: 20,
    description:
        'Renders the verse-meta editor for the structured verse notes surface.',
});


