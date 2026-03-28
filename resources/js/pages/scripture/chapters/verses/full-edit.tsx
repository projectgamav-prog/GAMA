import { Link, useForm } from '@inertiajs/react';
import { SquareArrowOutUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import {
    CreateVerseContentBlockCard,
    ProtectedVerseContentBlockCard,
    VerseContentBlockEditorCard,
} from '@/components/scripture/verse-admin-content-block-cards';
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
import { useScriptureAdminTargetNavigation } from '@/hooks/use-scripture-admin-target-navigation';
import ScriptureLayout from '@/layouts/scripture-layout';
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
import { formatAdminList, parseAdminList } from '@/lib/scripture-admin';
import { getUniqueVerseCharacterOptions } from '@/lib/scripture-character-options';
import type { BreadcrumbItem, VerseFullEditProps } from '@/types';

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

type VerseIdentityEditorFormData = {
    slug: string;
    number: string;
    text: string;
};

const NONE_VALUE = '__none__';

function VerseIdentityEditorCard({
    updateHref,
    verse,
}: {
    updateHref: string;
    verse: VerseFullEditProps['verse'];
}) {
    const form = useForm<VerseIdentityEditorFormData>({
        slug: verse.slug,
        number: verse.number ?? '',
        text: verse.text,
    });

    const submit = () => {
        form.patch(updateHref, {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Verse identity</Badge>
                    <Badge variant="secondary">Canonical</Badge>
                </div>
                <CardTitle>Verse Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="identity_slug">Slug</Label>
                    <Input
                        id="identity_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="verse-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="identity_number">Number</Label>
                    <Input
                        id="identity_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="identity_text">Verse text</Label>
                    <Textarea
                        id="identity_text"
                        value={form.data.text}
                        onChange={(event) =>
                            form.setData('text', event.target.value)
                        }
                        rows={7}
                        placeholder="Canonical verse text"
                    />
                    <InputError message={form.errors.text} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        Save verse identity
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function VerseMetaEditorCard({
    updateHref,
    verseMeta,
    characters,
}: {
    updateHref: string;
    verseMeta: VerseFullEditProps['verse_meta'];
    characters: VerseFullEditProps['characters'];
}) {
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

export default function VerseFullEdit({
    book,
    book_section,
    chapter,
    chapter_section,
    verse,
    admin_entity,
    characters,
    admin_identity_update_href,
    verse_meta,
    admin_meta_update_href,
    admin_content_block_store_href,
    next_content_block_sort_order,
    admin_content_blocks,
    protected_content_blocks,
}: VerseFullEditProps) {
    const fields = admin_entity.fields;
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const chapterSectionTitle = sectionLabel(
        chapter_section.number,
        chapter_section.title,
    );
    const verseTitle = verseLabel(verse.number);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: book_section.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
        {
            title: chapterSectionTitle,
            href: chapter_section.href,
        },
        {
            title: `${verseTitle} Full edit`,
            href: verse.admin_full_edit_href,
        },
    ];
    useScriptureAdminTargetNavigation();

    return (
        <ScriptureLayout
            title={`Full edit - ${verseTitle} - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Protected editor</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        <Badge variant="secondary">{verseTitle}</Badge>
                    </>
                }
                title={`Full edit: ${verseTitle}`}
                description="Use this deeper workspace to manage canonical verse identity, verse meta, and attached note blocks in one protected place."
                headerAction={
                    <Button asChild variant="outline" size="sm">
                        <Link href={verse.href}>
                            <SquareArrowOutUpRight className="size-4" />
                            Back to verse page
                        </Link>
                    </Button>
                }
                contentClassName="space-y-5"
            >
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Canonical verse
                    </p>
                    <p className="mt-4 text-xl leading-10 sm:text-2xl sm:leading-[3rem]">
                        {verse.text}
                    </p>
                </div>
            </ScripturePageIntroCard>

            <ScriptureSection
                adminTargetSection="identity"
                title="Verse Identity"
                description="Canonical verse identity and text for this verse."
            >
                <VerseIdentityEditorCard
                    updateHref={admin_identity_update_href}
                    verse={verse}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="meta"
                title="Verse Meta"
                description="Broader editorial metadata for this verse."
            >
                <VerseMetaEditorCard
                    updateHref={admin_meta_update_href}
                    verseMeta={verse_meta}
                    characters={characters}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="content_blocks"
                title="Note Blocks"
                description="Manage verse-owned text, quote, and image note blocks, including drafts that stay hidden from the public page."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                            {admin_content_blocks.length} editable
                        </Badge>
                        <Badge variant="outline">
                            {protected_content_blocks.length} protected
                        </Badge>
                    </div>
                }
            >
                <div className="space-y-4">
                    <CreateVerseContentBlockCard
                        storeHref={admin_content_block_store_href}
                        nextSortOrder={next_content_block_sort_order}
                        blockTypeField={fields.content_block_type}
                        titleField={fields.content_block_title}
                        bodyField={fields.content_block_body}
                        mediaUrlField={fields.content_block_media_url}
                        altTextField={fields.content_block_alt_text}
                        regionField={fields.content_block_region}
                        sortOrderField={fields.content_block_sort_order}
                        statusField={fields.content_block_status}
                    />

                    {admin_content_blocks.map((block) => (
                        <VerseContentBlockEditorCard
                            key={block.id}
                            block={block}
                            blockTypeField={fields.content_block_type}
                            titleField={fields.content_block_title}
                            bodyField={fields.content_block_body}
                            mediaUrlField={fields.content_block_media_url}
                            altTextField={fields.content_block_alt_text}
                            regionField={fields.content_block_region}
                            sortOrderField={fields.content_block_sort_order}
                            statusField={fields.content_block_status}
                        />
                    ))}

                    {protected_content_blocks.map((block) => (
                        <ProtectedVerseContentBlockCard
                            key={block.id}
                            block={block}
                        />
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
