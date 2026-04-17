<?php

namespace App\Support\Scripture\Admin\Registry\Definitions;

use App\Models\Book;
use App\Support\Scripture\Admin\BookContentBlockSchema;
use App\Support\Scripture\Admin\Registry\AdminEditMode;
use App\Support\Scripture\Admin\Registry\AdminEditModePolicy;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldClassification;
use App\Support\Scripture\Admin\Registry\AdminFieldDefinition;
use App\Support\Scripture\Admin\Registry\AdminFieldGroup;
use App\Support\Scripture\Admin\Registry\AdminMethodFamily;
use App\Support\Scripture\Admin\Registry\AdminRegionDefinition;
use App\Support\Scripture\Admin\Registry\AdminRegionMethodDefinition;

class BookAdminEntityDefinitionProvider extends AdminEntityDefinitionProvider
{
    public function key(): string
    {
        return 'book';
    }

    public function definition(): AdminEntityDefinition
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
                helpText: 'Editorial summary shown in the shared page intro on the canonical book page.',
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
                helpText: 'Choose a registered public slot. hero_media and supporting_media are the active options. overview_video remains only for legacy compatibility with older assignments.',
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
                    surface: 'books.admin.full-edit',
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
                    helpText: 'Use region keys intentionally. Registered image blocks are supported here, while video remains a protected legacy block/media concern outside the public page flow.',
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
                    description: 'Registered Book media surfaces for hero presentation and supporting media cards, with legacy slot roles still managed in full edit.',
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
                    helpText: 'hero_media is the lead public slot and supporting_media fills the follow-on cards. Older slot roles may still exist in the backend during transition.',
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
}
