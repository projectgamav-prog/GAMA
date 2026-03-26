<?php

namespace App\Support\Scripture\Admin\Registry;

use App\Models\Book;
use App\Models\Chapter;
use App\Models\Character;
use App\Models\Topic;
use App\Models\Verse;

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
                label: 'Book slug',
                source: 'books.slug',
                helpText: 'Canonical identifier. Protected from normal editorial editing.',
            ),
            'canonical_number' => $this->canonicalField(
                key: 'canonical_number',
                label: 'Book number',
                source: 'books.number',
                helpText: 'Canonical ordering marker. Protected from normal editorial editing.',
            ),
            'canonical_title' => $this->canonicalField(
                key: 'canonical_title',
                label: 'Book title',
                source: 'books.title',
                helpText: 'Canonical display title. Protected from normal editorial editing.',
            ),
            'description' => new AdminFieldDefinition(
                key: 'description',
                label: 'Book description',
                source: 'books.description',
                type: 'textarea',
                validationRules: ['nullable', 'string'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::EDITORIAL,
                helpText: 'Public editorial introduction shown on the book landing surfaces.',
            ),
            'content_block_region' => new AdminFieldDefinition(
                key: 'content_block_region',
                label: 'Block region',
                source: 'content_blocks.region',
                type: 'text',
                validationRules: ['required', 'string', 'max:100'],
                editModes: [AdminEditMode::CONTEXTUAL, AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Attach the block to an intentional public region such as overview or highlights.',
            ),
            'content_block_type' => new AdminFieldDefinition(
                key: 'content_block_type',
                label: 'Block type',
                source: 'content_blocks.block_type',
                type: 'select',
                validationRules: ['required', 'in:text,quote'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['text', 'quote'],
                helpText: 'Registered editorial block types only. Video should move through media slots instead of raw block JSON.',
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
                helpText: 'Draft blocks stay protected from the public book surfaces.',
            ),
            'media_assignment_media_id' => new AdminFieldDefinition(
                key: 'media_assignment_media_id',
                label: 'Media item',
                source: 'media_assignments.media_id',
                type: 'relation',
                validationRules: ['required', 'integer', 'exists:media,id'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                helpText: 'Attach a registered media record rather than editing raw URLs in place.',
            ),
            'media_assignment_role' => new AdminFieldDefinition(
                key: 'media_assignment_role',
                label: 'Media slot',
                source: 'media_assignments.role',
                type: 'select',
                validationRules: ['required', 'in:overview_video,hero_media,supporting_media'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['overview_video', 'hero_media', 'supporting_media'],
                helpText: 'Intentional media slots only. Add new slots through registration, not raw free-form roles.',
            ),
            'media_assignment_title_override' => new AdminFieldDefinition(
                key: 'media_assignment_title_override',
                label: 'Title override',
                source: 'media_assignments.title_override',
                type: 'text',
                validationRules: ['nullable', 'string', 'max:255'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
            ),
            'media_assignment_caption_override' => new AdminFieldDefinition(
                key: 'media_assignment_caption_override',
                label: 'Caption override',
                source: 'media_assignments.caption_override',
                type: 'textarea',
                validationRules: ['nullable', 'string'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
            ),
            'media_assignment_sort_order' => new AdminFieldDefinition(
                key: 'media_assignment_sort_order',
                label: 'Media sort order',
                source: 'media_assignments.sort_order',
                type: 'integer',
                validationRules: ['required', 'integer', 'min:0'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
            ),
            'media_assignment_status' => new AdminFieldDefinition(
                key: 'media_assignment_status',
                label: 'Media status',
                source: 'media_assignments.status',
                type: 'select',
                validationRules: ['required', 'in:draft,published'],
                editModes: [AdminEditMode::FULL],
                classification: AdminFieldClassification::EDITORIAL,
                group: AdminFieldGroup::SUPPORTING,
                options: ['draft', 'published'],
                helpText: 'Draft assignments remain available only in protected admin workflows.',
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
                    'description' => 'Fast public-page edits for registered editorial fields and block-local copy.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Schema-aware workspace for editorial fields, content blocks, and media slots.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'active',
                    'description' => 'Separate protected workflow for core book identity fields.',
                    'warning' => 'Book identity fields are intentionally read-only in this phase.',
                ],
            ]),
            fields: $fields,
            regions: [
                new AdminRegionDefinition(
                    key: 'page_intro',
                    label: 'Page intro',
                    surface: 'books.show, books.overview',
                    description: 'Primary book identity and public introduction shown at the top of the book surfaces.',
                    fieldKeys: ['canonical_number', 'canonical_title', 'description'],
                    contextualFieldKeys: ['description'],
                    fullFieldKeys: ['description'],
                    canonicalFieldKeys: ['canonical_number', 'canonical_title'],
                    capabilityHint: 'intro',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Overview content blocks',
                    surface: 'books.show, books.overview',
                    description: 'Editorial blocks rendered on the public book surfaces.',
                    fieldKeys: [
                        'content_block_region',
                        'content_block_type',
                        'content_block_title',
                        'content_block_body',
                        'content_block_sort_order',
                        'content_block_status',
                    ],
                    contextualFieldKeys: [
                        'content_block_title',
                        'content_block_body',
                    ],
                    fullFieldKeys: [
                        'content_block_region',
                        'content_block_type',
                        'content_block_title',
                        'content_block_body',
                        'content_block_sort_order',
                        'content_block_status',
                    ],
                    capabilityHint: 'content_blocks',
                    helpText: 'Only registered editorial block types are editable here.',
                ),
                new AdminRegionDefinition(
                    key: 'canonical_browse',
                    label: 'Canonical browse',
                    surface: 'books.show',
                    description: 'Read-only canonical section and chapter navigation.',
                    fieldKeys: ['canonical_slug', 'canonical_number', 'canonical_title'],
                    contextualFieldKeys: [],
                    fullFieldKeys: [],
                    canonicalFieldKeys: ['canonical_slug', 'canonical_number', 'canonical_title'],
                    capabilityHint: 'navigation',
                    helpText: 'Hierarchy and identity remain protected unless a dedicated canonical workflow explicitly registers them.',
                ),
                new AdminRegionDefinition(
                    key: 'media_slots',
                    label: 'Media slots',
                    surface: 'books.overview',
                    description: 'Registered media assignments for future-ready book presentation slots.',
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
                    helpText: 'Explicit media slots avoid raw file/url editing on public pages.',
                ),
            ],
            notes: 'Book is the first fully schema-driven admin entity. Other entity definitions remain registered but are not yet upgraded to this shared workspace.',
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
                ...$this->sharedTextBlockFields(),
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
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
                ),
            ],
            notes: 'Chapter remains on the phase-one protected note-block workflow while sharing the registration foundation.',
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
                    'status' => 'planned',
                    'description' => 'Future dedicated workflow for core verse text and identity.',
                    'warning' => 'Canonical verse text remains intentionally non-editable in the current policy.',
                ],
            ]),
            fields: [
                'canonical_number' => $this->canonicalField(
                    key: 'canonical_number',
                    label: 'Verse number',
                    source: 'verses.number',
                ),
                'canonical_text' => $this->canonicalField(
                    key: 'canonical_text',
                    label: 'Verse text',
                    source: 'verses.text',
                    helpText: 'Canonical text will use a dedicated protected workflow later.',
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
                ...$this->sharedTextBlockFields(),
            ],
            regions: [
                new AdminRegionDefinition(
                    key: 'page_intro',
                    label: 'Verse intro',
                    surface: 'chapters.verses.show',
                    description: 'Canonical verse text and identity context.',
                    fieldKeys: ['canonical_number', 'canonical_text'],
                    contextualFieldKeys: [],
                    fullFieldKeys: [],
                    canonicalFieldKeys: ['canonical_number', 'canonical_text'],
                    capabilityHint: 'intro',
                ),
                new AdminRegionDefinition(
                    key: 'study_notes',
                    label: 'Study notes',
                    surface: 'chapters.verses.show',
                    description: 'Compact editorial metadata attached to the verse.',
                    fieldKeys: ['summary_short', 'is_featured'],
                    contextualFieldKeys: ['summary_short', 'is_featured'],
                    fullFieldKeys: ['summary_short', 'is_featured'],
                    capabilityHint: 'relationships',
                ),
                new AdminRegionDefinition(
                    key: 'content_blocks',
                    label: 'Published notes',
                    surface: 'chapters.verses.show',
                    description: 'Verse-owned editorial note blocks.',
                    fieldKeys: array_keys($this->sharedTextBlockFields()),
                    contextualFieldKeys: ['content_block_title', 'content_block_body'],
                    fullFieldKeys: array_keys($this->sharedTextBlockFields()),
                    capabilityHint: 'content_blocks',
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
                    'status' => 'active',
                    'description' => 'Fast editing for topic description and note blocks.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Protected editorial workspace for topic proof-stage data.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'planned',
                    'description' => 'Reserved for future protected topic identity workflows.',
                    'warning' => 'Topic remains proof-stage and does not yet have a canonical protected route.',
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
            notes: 'Topic remains a framework proof rather than a final schema-complete editor.',
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
                    'status' => 'active',
                    'description' => 'Fast editing for character description and note blocks.',
                    'warning' => null,
                ],
                AdminEditMode::FULL => [
                    'label' => 'Full Editorial Edit',
                    'status' => 'active',
                    'description' => 'Protected editorial workspace for character proof-stage data.',
                    'warning' => null,
                ],
                AdminEditMode::CANONICAL => [
                    'label' => 'Canonical Protected Edit',
                    'status' => 'planned',
                    'description' => 'Reserved for future protected character identity workflows.',
                    'warning' => 'Character remains proof-stage and does not yet have a canonical protected route.',
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
            notes: 'Character remains a framework proof rather than a final schema-complete editor.',
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
            ),
        ];
    }
}
