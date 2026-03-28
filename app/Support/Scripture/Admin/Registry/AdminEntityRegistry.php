<?php

namespace App\Support\Scripture\Admin\Registry;

use App\Models\Book;
use App\Models\Chapter;
use App\Models\Character;
use App\Models\Topic;
use App\Models\Verse;
use App\Support\Scripture\Admin\BookContentBlockSchema;
use App\Support\Scripture\Admin\RegisteredNoteContentBlockSchema;
use App\Support\Scripture\Admin\TextualContentBlockSchema;

class AdminEntityRegistry
{
    /**
     * @var array<string, AdminEntityDefinition>|null
     */
    private ?array $definitions = null;

    public function definition(string $key): AdminEntityDefinition
    {
        $definitions = $this->definitions();

        if (! array_key_exists($key, $definitions)) {
            throw new \InvalidArgumentException("Admin entity [{$key}] is not registered.");
        }

        return $definitions[$key];
    }

    /**
     * @return array<string, AdminEntityDefinition>
     */
    public function definitions(): array
    {
        if ($this->definitions !== null) {
            return $this->definitions;
        }

        return $this->definitions = [
            'book' => $this->book(),
            'chapter' => $this->chapter(),
            'verse' => $this->verse(),
            'topic' => $this->topic(),
            'character' => $this->character(),
        ];
    }

    private function book(): AdminEntityDefinition
    {
        $fields = [
            'canonical_slug' => $this->canonicalField(
                key: 'canonical_slug',
                label: 'Canonical slug',
                source: 'books.slug',
                helpText: 'Protected identifier for routes and canonical references.',
            ),
            'canonical_number' => $this->canonicalField(
                key: 'canonical_number',
                label: 'Canonical number',
                source: 'books.number',
                helpText: 'Protected ordering marker used by canonical browse structure.',
            ),
            'canonical_title' => $this->canonicalField(
                key: 'canonical_title',
                label: 'Canonical title',
                source: 'books.title',
                helpText: 'Protected display title for the Book identity layer.',
            ),
            'description' => new AdminFieldDefinition(
                key: 'description',
                label: 'Public description',
                source: 'books.description',
                type: 'textarea',
                validationRules: ['nullable', 'string'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::EDITORIAL,
                helpText: 'Editorial summary shown in the shared page intro on books.show and books.overview.',
            ),
            'content_block_region' => new AdminFieldDefinition(
                key: 'content_block_region',
                label: 'Public region key',
                source: 'content_blocks.region',
                type: 'select',
                validationRules: ['required', BookContentBlockSchema::regionValidationRule()],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: BookContentBlockSchema::creatableRegions(),
                helpText: 'Places the block into an intentional Book region such as overview or highlights.',
            ),
            'content_block_type' => new AdminFieldDefinition(
                key: 'content_block_type',
                label: 'Registered block type',
                source: 'content_blocks.block_type',
                type: 'select',
                validationRules: ['required', BookContentBlockSchema::typeValidationRule()],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: BookContentBlockSchema::editableTypes(),
                helpText: 'Only registered editorial block types belong here. Image stays on registered block JSON, while video belongs in media slots.',
            ),
            'content_block_title' => new AdminFieldDefinition(
                key: 'content_block_title',
                label: 'Public block heading',
                source: 'content_blocks.title',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional heading shown above the block body when that public region uses one.',
            ),
            'content_block_body' => new AdminFieldDefinition(
                key: 'content_block_body',
                label: 'Public block body',
                source: 'content_blocks.body',
                type: 'textarea',
                validationRules: ['required', 'string'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Required long-form copy for the registered block.',
            ),
            'content_block_media_url' => new AdminFieldDefinition(
                key: 'content_block_media_url',
                label: 'Image source URL',
                source: 'content_blocks.data_json->url',
                type: 'text',
                validationRules: ['required_if:block_type,image', 'nullable', 'string', 'max:2048'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Required when the registered block type is image. Use the public image URL already approved for this surface.',
            ),
            'content_block_alt_text' => new AdminFieldDefinition(
                key: 'content_block_alt_text',
                label: 'Image alt text',
                source: 'content_blocks.data_json->alt',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional accessibility text for registered image blocks. When blank, the public renderer falls back to the block title.',
            ),
            'content_block_sort_order' => new AdminFieldDefinition(
                key: 'content_block_sort_order',
                label: 'Region sort order',
                source: 'content_blocks.sort_order',
                type: 'integer',
                validationRules: ['required', 'integer', 'min:0'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Lower numbers render earlier inside the same public region.',
            ),
            'content_block_status' => new AdminFieldDefinition(
                key: 'content_block_status',
                label: 'Publication status',
                source: 'content_blocks.status',
                type: 'select',
                validationRules: ['required', 'in:draft,published'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['draft', 'published'],
                helpText: 'Published blocks render publicly. Draft blocks stay protected in admin.',
            ),
            'media_assignment_media_id' => new AdminFieldDefinition(
                key: 'media_assignment_media_id',
                label: 'Registered media record',
                source: 'media_assignments.media_id',
                type: 'relation',
                validationRules: ['required', 'integer', 'exists:media,id'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Choose a media library record instead of editing raw public URLs in place.',
            ),
            'media_assignment_role' => new AdminFieldDefinition(
                key: 'media_assignment_role',
                label: 'Public media slot',
                source: 'media_assignments.role',
                type: 'select',
                validationRules: ['required', 'in:overview_video,hero_media,supporting_media'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['overview_video', 'hero_media', 'supporting_media'],
                helpText: 'Choose a registered public slot. Add new slot types through registration, not free-form roles.',
            ),
            'media_assignment_title_override' => new AdminFieldDefinition(
                key: 'media_assignment_title_override',
                label: 'Public title override',
                source: 'media_assignments.title_override',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional Book-specific title that replaces the media library title for this slot.',
            ),
            'media_assignment_caption_override' => new AdminFieldDefinition(
                key: 'media_assignment_caption_override',
                label: 'Public caption override',
                source: 'media_assignments.caption_override',
                type: 'textarea',
                validationRules: ['nullable', 'string'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional Book-specific caption shown with the assigned slot.',
            ),
            'media_assignment_sort_order' => new AdminFieldDefinition(
                key: 'media_assignment_sort_order',
                label: 'Slot sort order',
                source: 'media_assignments.sort_order',
                type: 'integer',
                validationRules: ['required', 'integer', 'min:0'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Lower numbers appear earlier when a Book surface supports multiple items.',
            ),
            'media_assignment_status' => new AdminFieldDefinition(
                key: 'media_assignment_status',
                label: 'Publication status',
                source: 'media_assignments.status',
                type: 'select',
                validationRules: ['required', 'in:draft,published'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['draft', 'published'],
                helpText: 'Published assignments render publicly. Draft assignments remain protected in admin.',
            ),
        ];

        return new AdminEntityDefinition(
            key: 'book',
            label: 'Book',
            primaryModel: Book::class,
            primaryTable: 'books',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'active',
                    'description' => 'Fast public-page adjustments for registered intro copy and block-local editorial text.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Schema-aware workspace for editorial intro copy, registered block regions, and public media slots.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'active',
                    'description' => 'Separate protected workflow for canonical identity and browse structure.',
                    'warning' => 'Slug, number, and title stay on this protected workflow, while browse structure remains documented-only in this phase.',
                ],
            ]),
            fields: $fields,
            regions: [
                new AdminRegionDefinition(
                    key: 'book_intro',
                    label: 'Public book intro',
                    surface: 'books.show',
                    description: 'Shared header region on the public Book pages. Combines canonical title/number with the editorial description.',
                    fieldKeys: ['canonical_number', 'canonical_title', 'description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    canonicalFieldKeys: ['canonical_number', 'canonical_title'],
                    capabilityHint: 'intro',
                    helpText: 'Description edits stay editorial here while canonical identity uses its own separate module and protected workflow.',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Editorial block regions',
                    surface: 'books.show, books.overview',
                    description: 'Registered long-form copy regions for overview, highlights, quotes, and similar public Book sections.',
                    fieldKeys: [
                        'content_block_region',
                        'content_block_type',
                        'content_block_title',
                        'content_block_body',
                        'content_block_media_url',
                        'content_block_alt_text',
                        'content_block_sort_order',
                        'content_block_status',
                    ],
                    contextualFieldKeys: [
                        'content_block_title',
                        'content_block_body',
                        'content_block_media_url',
                        'content_block_alt_text',
                    ],
                    fullFieldKeys: [
                        'content_block_region',
                        'content_block_type',
                        'content_block_title',
                        'content_block_body',
                        'content_block_media_url',
                        'content_block_alt_text',
                        'content_block_sort_order',
                        'content_block_status',
                    ],
                    capabilityHint: 'content_blocks',
                    helpText: 'Use region keys intentionally. Registered image blocks are supported here, while video belongs in the overview_video media slot.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_CREATE,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Book content-block create',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_EDIT,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Book content-block edit',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::ORDERED_INSERTION,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Book ordered insertion',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::REORDER,
                            editModes: [AdminEditMode::FULL],
                            label: 'Book content-block reorder',
                        ),
                    ],
                ),
                new AdminRegionDefinition(
                    key: 'canonical_browse',
                    label: 'Canonical browse structure',
                    surface: 'books.show',
                    description: 'Protected identity and browse hierarchy used for section and chapter navigation on the main Book page.',
                    fieldKeys: ['canonical_slug', 'canonical_number', 'canonical_title'],
                    contextualFieldKeys: [],
                    fullFieldKeys: [],
                    canonicalFieldKeys: ['canonical_slug', 'canonical_number', 'canonical_title'],
                    capabilityHint: 'navigation',
                    helpText: 'Hierarchy and identity remain protected unless a dedicated canonical workflow explicitly registers them for editing.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CANONICAL_DISPLAY,
                            editModes: [AdminEditMode::CANONICAL],
                            label: 'Canonical browse structure display',
                            description: 'Shows the protected Book browse hierarchy as read-only canonical reference.',
                        ),
                    ],
                ),
                new AdminRegionDefinition(
                    key: 'book_media_slots',
                    label: 'Public media slots',
                    surface: 'books.show',
                    description: 'Registered Book media surfaces for Watch Overview, hero presentation, and supporting media cards.',
                    fieldKeys: [
                        'media_assignment_media_id',
                        'media_assignment_role',
                        'media_assignment_title_override',
                        'media_assignment_caption_override',
                        'media_assignment_sort_order',
                        'media_assignment_status',
                    ],
                    contextualFieldKeys: [],
                    fullFieldKeys: [
                        'media_assignment_media_id',
                        'media_assignment_role',
                        'media_assignment_title_override',
                        'media_assignment_caption_override',
                        'media_assignment_sort_order',
                        'media_assignment_status',
                    ],
                    capabilityHint: 'media',
                    helpText: 'overview_video drives Watch Overview, hero_media is the lead slot, and supporting_media fills the follow-on cards.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::MEDIA_SLOT_EDIT,
                            editModes: [AdminEditMode::FULL],
                            label: 'Book media-slot edit',
                        ),
                    ],
                ),
            ],
            notes: 'Book is the reference full-admin entity. It demonstrates contextual edit, full editorial edit, and canonical protected edit for future entity editors to copy.',
        );
    }

    private function canonicalField(
        string $key,
        string $label,
        string $source,
        ?string $helpText = null,
    ): AdminFieldDefinition {
        return new AdminFieldDefinition(
            key: $key,
            label: $label,
            source: $source,
            type: 'text',
            validationRules: [],
            editModes: [AdminEditMode::CANONICAL],
            classification: AdminFieldClassification::CANONICAL,
            group: AdminFieldGroup::IDENTITY,
            readOnly: true,
            helpText: $helpText,
        );
    }

    private function chapter(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'chapter',
            label: 'Chapter',
            primaryModel: Chapter::class,
            primaryTable: 'chapters',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'active',
                    'description' => 'Fast block-local editing from the public chapter surface.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Protected editor for chapter-owned editorial blocks.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'planned',
                    'description' => 'Future protected workflow for chapter identity and hierarchy.',
                    'warning' => 'Canonical chapter identity remains read-only in the current phase.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Chapter slug',
                    source: 'chapters.slug',
                ),
                'canonical_number' => $this->canonicalField(
                    key: 'canonical_number',
                    label: 'Chapter number',
                    source: 'chapters.number',
                ),
                'canonical_title' => $this->canonicalField(
                    key: 'canonical_title',
                    label: 'Chapter title',
                    source: 'chapters.title',
                ),
                ...$this->sharedRegisteredNoteBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'page_intro',
                    label: 'Page intro',
                    surface: 'chapters.show',
                    description: 'Chapter overview and entry controls.',
                    fieldKeys: ['canonical_number', 'canonical_title'],
                    contextualFieldKeys: [],
                    fullFieldKeys: [],
                    canonicalFieldKeys: ['canonical_number', 'canonical_title'],
                    capabilityHint: 'intro',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Published notes',
                    surface: 'chapters.show',
                    description: 'Chapter-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    capabilityHint: 'content_blocks',
                    helpText: 'Chapter uses the shared registered note workflow while keeping ownership scoped to the current chapter. Text, quote, and image blocks stay inside this surface; video remains protected.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_CREATE,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter content-block create',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_EDIT,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter content-block edit',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::ORDERED_INSERTION,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Chapter ordered insertion',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::REORDER,
                            editModes: [AdminEditMode::FULL],
                            label: 'Chapter content-block reorder',
                            description: 'Uses the shared ordering resolver while Chapter stays scoped to registered text, quote, and image note blocks.',
                        ),
                    ],
                ),
            ],
            notes: 'Chapter now uses the shared registered note-block workflow while keeping canonical chapter identity outside the current edit surface.',
        );
    }

    private function verse(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'verse',
            label: 'Verse',
            primaryModel: Verse::class,
            primaryTable: 'verses',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'active',
                    'description' => 'Fast editing for verse meta and public note blocks.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Protected workspace for verse meta and supporting note blocks.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'active',
                    'description' => 'Protected workflow for core verse text and identity.',
                    'warning' => null,
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Verse slug',
                    source: 'verses.slug',
                ),
                'canonical_number' => $this->canonicalField(
                    key: 'canonical_number',
                    label: 'Verse number',
                    source: 'verses.number',
                ),
                'canonical_text' => $this->canonicalField(
                    key: 'canonical_text',
                    label: 'Verse text',
                    source: 'verses.text',
                    helpText: 'Protected canonical text shown on the public verse surface.',
                ),
                'primary_speaker_character_id' => new AdminFieldDefinition(
                    key: 'primary_speaker_character_id',
                    label: 'Primary speaker',
                    source: 'verse_meta.primary_speaker_character_id',
                    type: 'relation',
                    validationRules: ['nullable', 'integer', 'exists:characters,id'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                'primary_listener_character_id' => new AdminFieldDefinition(
                    key: 'primary_listener_character_id',
                    label: 'Primary listener',
                    source: 'verse_meta.primary_listener_character_id',
                    type: 'relation',
                    validationRules: ['nullable', 'integer', 'exists:characters,id'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                'difficulty_level' => new AdminFieldDefinition(
                    key: 'difficulty_level',
                    label: 'Difficulty level',
                    source: 'verse_meta.difficulty_level',
                    type: 'text',
                    validationRules: ['nullable', 'string', 'max:255'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                'summary_short' => new AdminFieldDefinition(
                    key: 'summary_short',
                    label: 'Summary',
                    source: 'verse_meta.summary_short',
                    type: 'textarea',
                    validationRules: ['nullable', 'string'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                'is_featured' => new AdminFieldDefinition(
                    key: 'is_featured',
                    label: 'Featured verse',
                    source: 'verse_meta.is_featured',
                    type: 'boolean',
                    validationRules: ['required', 'boolean'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                ...$this->sharedRegisteredNoteBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'verse_intro',
                    label: 'Verse intro',
                    surface: 'chapters.verses.show',
                    description: 'Canonical verse text and identity context.',
                    fieldKeys: ['canonical_slug', 'canonical_number', 'canonical_text'],
                    contextualFieldKeys: [],
                    fullFieldKeys: [],
                    canonicalFieldKeys: ['canonical_slug', 'canonical_number', 'canonical_text'],
                    capabilityHint: 'intro',
                ),
                new AdminRegionDefinition(
                    key: 'verse_notes',
                    label: 'Study notes',
                    surface: 'chapters.verses.show',
                    description: 'Compact editorial metadata attached to the verse.',
                    fieldKeys: [
                        'primary_speaker_character_id',
                        'primary_listener_character_id',
                        'difficulty_level',
                        'summary_short',
                        'is_featured',
                    ],
                    contextualFieldKeys: [
                        'primary_speaker_character_id',
                        'primary_listener_character_id',
                        'difficulty_level',
                        'summary_short',
                        'is_featured',
                    ],
                    fullFieldKeys: [
                        'primary_speaker_character_id',
                        'primary_listener_character_id',
                        'difficulty_level',
                        'summary_short',
                        'is_featured',
                    ],
                    capabilityHint: 'relationships',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Published notes',
                    surface: 'chapters.verses.show',
                    description: 'Verse-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedRegisteredNoteBlockFields()),
                    capabilityHint: 'content_blocks',
                    helpText: 'Verse uses the shared registered note workflow while keeping ownership scoped to the current verse. Text, quote, and image blocks stay inside this surface; video remains protected.',
                    methods: [
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_CREATE,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Verse content-block create',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::CONTENT_BLOCK_EDIT,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Verse content-block edit',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::ORDERED_INSERTION,
                            editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                            label: 'Verse ordered insertion',
                        ),
                        new AdminRegionMethodDefinition(
                            family: AdminMethodFamily::REORDER,
                            editModes: [AdminEditMode::FULL],
                            label: 'Verse content-block reorder',
                            description: 'Uses the shared ordering resolver while Verse stays scoped to registered text, quote, and image note blocks.',
                        ),
                    ],
                ),
            ],
        );
    }

    private function topic(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'topic',
            label: 'Topic',
            primaryModel: Topic::class,
            primaryTable: 'topics',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'disabled',
                    'description' => 'Topic admin is paused while the active CMS scope stays focused on scripture pages.',
                    'warning' => 'Topic editing is intentionally postponed and is not part of the active admin architecture for the next phase.',
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'disabled',
                    'description' => 'The proof-stage topic editor is retained only as a postponed reference surface.',
                    'warning' => 'Topic admin routes are disabled while books, chapters, verses, and supporting CMS infrastructure are cleaned up first.',
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'disabled',
                    'description' => 'Canonical topic workflows remain outside the current cleanup scope.',
                    'warning' => 'Topic remains postponed and does not have an active canonical protected route.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Topic slug',
                    source: 'topics.slug',
                ),
                'canonical_name' => $this->canonicalField(
                    key: 'canonical_name',
                    label: 'Topic name',
                    source: 'topics.name',
                ),
                'description' => new AdminFieldDefinition(
                    key: 'description',
                    label: 'Topic description',
                    source: 'topics.description',
                    type: 'textarea',
                    validationRules: ['nullable', 'string'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                ...$this->sharedTextBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'description',
                    label: 'Description',
                    surface: 'topics.show',
                    description: 'Public editorial copy for the topic page.',
                    fieldKeys: ['description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    capabilityHint: 'copy',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Topic content',
                    surface: 'topics.show',
                    description: 'Topic-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
                ),
            ],
            notes: 'Topic admin is currently postponed and retained only as a proof-stage schema sketch outside the active admin surface.',
        );
    }

    private function character(): AdminEntityDefinition
    {
        return new AdminEntityDefinition(
            key: 'character',
            label: 'Character',
            primaryModel: Character::class,
            primaryTable: 'characters',
            editModePolicy: new AdminEditModePolicy([
                AdminEditMode::CONTEXTUAL => [
                    'label' => 'Contextual Edit',
                    'status' => 'disabled',
                    'description' => 'Character admin is paused while the active CMS scope stays focused on scripture pages.',
                    'warning' => 'Character editing is intentionally postponed and is not part of the active admin architecture for the next phase.',
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'disabled',
                    'description' => 'The proof-stage character editor is retained only as a postponed reference surface.',
                    'warning' => 'Character admin routes are disabled while books, chapters, verses, and supporting CMS infrastructure are cleaned up first.',
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'disabled',
                    'description' => 'Canonical character workflows remain outside the current cleanup scope.',
                    'warning' => 'Character remains postponed and does not have an active canonical protected route.',
                ],
            ]),
            fields: [
                'canonical_slug' => $this->canonicalField(
                    key: 'canonical_slug',
                    label: 'Character slug',
                    source: 'characters.slug',
                ),
                'canonical_name' => $this->canonicalField(
                    key: 'canonical_name',
                    label: 'Character name',
                    source: 'characters.name',
                ),
                'description' => new AdminFieldDefinition(
                    key: 'description',
                    label: 'Character description',
                    source: 'characters.description',
                    type: 'textarea',
                    validationRules: ['nullable', 'string'],
                    editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                    classification: AdminFieldClassification::EDITORIAL,
                    group: AdminFieldGroup::EDITORIAL,
                ),
                ...$this->sharedTextBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'description',
                    label: 'Description',
                    surface: 'characters.show',
                    description: 'Public editorial copy for the character page.',
                    fieldKeys: ['description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    capabilityHint: 'copy',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Character content',
                    surface: 'characters.show',
                    description: 'Character-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
                ),
            ],
            notes: 'Character admin is currently postponed and retained only as a proof-stage schema sketch outside the active admin surface.',
        );
    }

    /**
     * @return array<string, AdminFieldDefinition>
     */
    private function sharedTextBlockFields(): array
    {
        return [
            'content_block_region' => new AdminFieldDefinition(
                key: 'content_block_region',
                label: 'Block region',
                source: 'content_blocks.region',
                type: 'text',
                validationRules: ['required', 'string', 'max:100'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Entity-scoped region key for registered note surfaces. Keep the meaning intentional for each entity.',
            ),
            'content_block_title' => new AdminFieldDefinition(
                key: 'content_block_title',
                label: 'Block title',
                source: 'content_blocks.title',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional heading shown when the entity surface presents a titled note block.',
            ),
            'content_block_body' => new AdminFieldDefinition(
                key: 'content_block_body',
                label: 'Block body',
                source: 'content_blocks.body',
                type: 'textarea',
                validationRules: ['required', 'string'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Primary editorial copy for the registered note block.',
            ),
            'content_block_sort_order' => new AdminFieldDefinition(
                key: 'content_block_sort_order',
                label: 'Block sort order',
                source: 'content_blocks.sort_order',
                type: 'integer',
                validationRules: ['required', 'integer', 'min:0'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Lower numbers render earlier. Shared ordering services normalize and shift later blocks when needed.',
            ),
            'content_block_status' => new AdminFieldDefinition(
                key: 'content_block_status',
                label: 'Block status',
                source: 'content_blocks.status',
                type: 'select',
                validationRules: ['required', 'in:draft,published'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['draft', 'published'],
                helpText: 'Published blocks render publicly. Draft blocks remain protected in admin.',
            ),
        ];
    }

    /**
     * @return array<string, AdminFieldDefinition>
     */
    private function sharedRegisteredNoteBlockFields(): array
    {
        return [
            'content_block_type' => new AdminFieldDefinition(
                key: 'content_block_type',
                label: 'Registered block type',
                source: 'content_blocks.block_type',
                type: 'select',
                validationRules: ['required', RegisteredNoteContentBlockSchema::typeValidationRule()],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: RegisteredNoteContentBlockSchema::editableTypes(),
                helpText: 'Only registered note blocks belong here. Text, quote, and image remain in this shared block workflow, while video stays on protected media flows.',
            ),
            'content_block_media_url' => new AdminFieldDefinition(
                key: 'content_block_media_url',
                label: 'Image source URL',
                source: 'content_blocks.data_json->url',
                type: 'text',
                validationRules: ['required_if:block_type,image', 'nullable', 'string', 'max:2048'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Required when the registered note block type is image.',
            ),
            'content_block_alt_text' => new AdminFieldDefinition(
                key: 'content_block_alt_text',
                label: 'Image alt text',
                source: 'content_blocks.data_json->alt',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Optional accessibility text for registered image note blocks.',
            ),
            ...$this->sharedTextBlockFields(),
        ];
    }
}
