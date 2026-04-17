import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatAdminList, parseAdminList } from '@/lib/scripture-admin';
import { getUniqueVerseCharacterOptions } from '@/lib/scripture-character-options';
import type { VerseFullEditProps } from '@/types';

type VerseMetaEditorFormData = {
    primary_speaker_character_id: string;
    primary_listener_character_id: string;
    summary_short: string;
    scene_location: string;
    narrative_phase: string;
    teaching_mode: string;
    difficulty_level: string;
    memorization_priority: string;
    is_featured: boolean;
    keywords_text: string;
    study_flags_text: string;
};

const NONE_VALUE = '__none__';

type Props = {
    updateHref: string;
    verseMeta: VerseFullEditProps['verse_meta'];
    characters: VerseFullEditProps['characters'];
};

export function VerseMetaEditorCard({
    updateHref,
    verseMeta,
    characters,
}: Props) {
    const form = useForm<VerseMetaEditorFormData>({
        primary_speaker_character_id:
            verseMeta?.primary_speaker_character_id !== null &&
            verseMeta?.primary_speaker_character_id !== undefined
                ? String(verseMeta.primary_speaker_character_id)
                : NONE_VALUE,
        primary_listener_character_id:
            verseMeta?.primary_listener_character_id !== null &&
            verseMeta?.primary_listener_character_id !== undefined
                ? String(verseMeta.primary_listener_character_id)
                : NONE_VALUE,
        summary_short: verseMeta?.summary_short ?? '',
        scene_location: verseMeta?.scene_location ?? '',
        narrative_phase: verseMeta?.narrative_phase ?? '',
        teaching_mode: verseMeta?.teaching_mode ?? '',
        difficulty_level: verseMeta?.difficulty_level ?? '',
        memorization_priority: String(verseMeta?.memorization_priority ?? 0),
        is_featured: verseMeta?.is_featured ?? false,
        keywords_text: formatAdminList(verseMeta?.keywords_json ?? null),
        study_flags_text: formatAdminList(verseMeta?.study_flags_json ?? null),
    });
    const errors = form.errors as Record<string, string>;
    const characterOptions = getUniqueVerseCharacterOptions(characters);

    useEffect(() => {
        form.setData({
            primary_speaker_character_id:
                verseMeta?.primary_speaker_character_id !== null &&
                verseMeta?.primary_speaker_character_id !== undefined
                    ? String(verseMeta.primary_speaker_character_id)
                    : NONE_VALUE,
            primary_listener_character_id:
                verseMeta?.primary_listener_character_id !== null &&
                verseMeta?.primary_listener_character_id !== undefined
                    ? String(verseMeta.primary_listener_character_id)
                    : NONE_VALUE,
            summary_short: verseMeta?.summary_short ?? '',
            scene_location: verseMeta?.scene_location ?? '',
            narrative_phase: verseMeta?.narrative_phase ?? '',
            teaching_mode: verseMeta?.teaching_mode ?? '',
            difficulty_level: verseMeta?.difficulty_level ?? '',
            memorization_priority: String(
                verseMeta?.memorization_priority ?? 0,
            ),
            is_featured: verseMeta?.is_featured ?? false,
            keywords_text: formatAdminList(verseMeta?.keywords_json ?? null),
            study_flags_text: formatAdminList(
                verseMeta?.study_flags_json ?? null,
            ),
        });
        form.clearErrors();
    }, [form, verseMeta]);

    const submit = () => {
        form.transform((data) => ({
            primary_speaker_character_id:
                data.primary_speaker_character_id === NONE_VALUE
                    ? null
                    : Number(data.primary_speaker_character_id),
            primary_listener_character_id:
                data.primary_listener_character_id === NONE_VALUE
                    ? null
                    : Number(data.primary_listener_character_id),
            summary_short: data.summary_short,
            scene_location: data.scene_location,
            narrative_phase: data.narrative_phase,
            teaching_mode: data.teaching_mode,
            difficulty_level: data.difficulty_level,
            memorization_priority:
                data.memorization_priority.trim() === ''
                    ? null
                    : Number(data.memorization_priority),
            is_featured: data.is_featured,
            keywords: parseAdminList(data.keywords_text),
            study_flags: parseAdminList(data.study_flags_text),
        }));

        form.patch(updateHref, {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Verse meta</Badge>
                    <Badge variant="secondary">Editorial only</Badge>
                </div>
                <CardTitle>Verse Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="summary_short">Summary</Label>
                    <Textarea
                        id="summary_short"
                        value={form.data.summary_short}
                        onChange={(event) =>
                            form.setData('summary_short', event.target.value)
                        }
                        rows={5}
                        placeholder="Short editorial summary for this verse."
                    />
                    <InputError message={form.errors.summary_short} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="primary_speaker_character_id">
                            Speaker
                        </Label>
                        <Select
                            value={form.data.primary_speaker_character_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'primary_speaker_character_id',
                                    value,
                                )
                            }
                        >
                            <SelectTrigger id="primary_speaker_character_id">
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
                            message={errors.primary_speaker_character_id}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="primary_listener_character_id">
                            Listener
                        </Label>
                        <Select
                            value={form.data.primary_listener_character_id}
                            onValueChange={(value) =>
                                form.setData(
                                    'primary_listener_character_id',
                                    value,
                                )
                            }
                        >
                            <SelectTrigger id="primary_listener_character_id">
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
                            message={errors.primary_listener_character_id}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scene_location">Scene location</Label>
                        <Input
                            id="scene_location"
                            value={form.data.scene_location}
                            onChange={(event) =>
                                form.setData(
                                    'scene_location',
                                    event.target.value,
                                )
                            }
                            placeholder="Kurukshetra"
                        />
                        <InputError message={form.errors.scene_location} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="narrative_phase">Narrative phase</Label>
                        <Input
                            id="narrative_phase"
                            value={form.data.narrative_phase}
                            onChange={(event) =>
                                form.setData(
                                    'narrative_phase',
                                    event.target.value,
                                )
                            }
                            placeholder="Opening tension"
                        />
                        <InputError message={form.errors.narrative_phase} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="teaching_mode">Teaching mode</Label>
                        <Input
                            id="teaching_mode"
                            value={form.data.teaching_mode}
                            onChange={(event) =>
                                form.setData(
                                    'teaching_mode',
                                    event.target.value,
                                )
                            }
                            placeholder="Dialogue"
                        />
                        <InputError message={form.errors.teaching_mode} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="difficulty_level">
                            Difficulty level
                        </Label>
                        <Input
                            id="difficulty_level"
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

                    <div className="grid gap-2">
                        <Label htmlFor="memorization_priority">
                            Memorization priority
                        </Label>
                        <Input
                            id="memorization_priority"
                            type="number"
                            min={0}
                            value={form.data.memorization_priority}
                            onChange={(event) =>
                                form.setData(
                                    'memorization_priority',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError
                            message={form.errors.memorization_priority}
                        />
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
                    <Checkbox
                        id="is_featured"
                        checked={form.data.is_featured}
                        onCheckedChange={(checked) =>
                            form.setData('is_featured', checked === true)
                        }
                    />
                    <div className="space-y-1">
                        <Label htmlFor="is_featured">Featured verse</Label>
                        <p className="text-sm text-muted-foreground">
                            Controls whether the verse should be highlighted in
                            future editorial surfaces.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="keywords_text">Keywords</Label>
                        <Textarea
                            id="keywords_text"
                            value={form.data.keywords_text}
                            onChange={(event) =>
                                form.setData(
                                    'keywords_text',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            placeholder="karma, dharma, discipline"
                        />
                        <p className="text-sm text-muted-foreground">
                            Separate items with commas or new lines.
                        </p>
                        <InputError
                            message={errors.keywords ?? errors.keywords_text}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="study_flags_text">Study flags</Label>
                        <Textarea
                            id="study_flags_text"
                            value={form.data.study_flags_text}
                            onChange={(event) =>
                                form.setData(
                                    'study_flags_text',
                                    event.target.value,
                                )
                            }
                            rows={4}
                            placeholder="memorization, discussion"
                        />
                        <p className="text-sm text-muted-foreground">
                            Separate items with commas or new lines.
                        </p>
                        <InputError
                            message={
                                errors.study_flags ?? errors.study_flags_text
                            }
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        Save verse meta
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
