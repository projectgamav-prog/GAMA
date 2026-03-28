<?php

use App\Models\Book;
use App\Models\ContentBlock;
use App\Models\User;
use App\Support\AdminContext\AdminContext;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\DevelopmentUserSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed([
        DevelopmentUserSeeder::class,
        BhagavadGitaDevelopmentSeeder::class,
    ]);

    $this->book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $this->bookSection = $this->book->bookSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $this->chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $this->chapterSection = $this->chapter->chapterSections()
        ->inCanonicalOrder()
        ->firstOrFail();

    $sectionVerses = $this->chapterSection->verses()
        ->inCanonicalOrder()
        ->get()
        ->values();

    $this->firstVerse = $sectionVerses[0];
    $this->secondVerse = $sectionVerses[1];

    $this->verseRouteParameters = [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->firstVerse,
    ];

    $this->verseShowRoute = route(
        'scripture.chapters.verses.show',
        $this->verseRouteParameters,
    );
    $this->metaUpdateRoute = route(
        'scripture.chapters.verses.admin.meta.update',
        $this->verseRouteParameters,
    );
    $this->identityUpdateRoute = route(
        'scripture.chapters.verses.admin.identity.update',
        $this->verseRouteParameters,
    );
    $this->fullEditRoute = route(
        'scripture.chapters.verses.admin.full-edit',
        $this->verseRouteParameters,
    );
    $this->contentBlockStoreRoute = route(
        'scripture.chapters.verses.admin.content-blocks.store',
        $this->verseRouteParameters,
    );
    $this->verseStoreRoute = route(
        'scripture.chapters.verses.admin.store',
        [
            'book' => $this->book,
            'bookSection' => $this->bookSection,
            'chapter' => $this->chapter,
            'chapterSection' => $this->chapterSection,
        ],
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected verse admin context', function () {
    $this->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $this->post($this->verseStoreRoute, [
        'slug' => 'blocked-verse',
        'text' => 'Blocked verse text.',
    ])->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->verseStoreRoute, [
            'slug' => 'blocked-verse',
            'text' => 'Blocked verse text.',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->patch($this->metaUpdateRoute, [
            'summary_short' => 'Blocked summary',
            'is_featured' => false,
            'keywords' => [],
            'study_flags' => [],
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertForbidden();
});

test('authorized editors can toggle protected admin visibility and receive verse admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $this->firstVerse->verseMeta()->create([
        'summary_short' => 'Study notes visible in admin mode.',
        'scene_location' => 'Kurukshetra',
        'is_featured' => true,
        'keywords_json' => ['focus'],
        'study_flags_json' => ['discussion'],
    ]);

    $publishedBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published editorial note',
        'body' => 'Editable note block shown on the public verse page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('isAdmin', true)
            ->where('admin.identity_update_href', $this->identityUpdateRoute)
            ->where('admin.meta_update_href', $this->metaUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute),
        );

    $response = $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ]);

    $response
        ->assertRedirect($this->verseShowRoute)
        ->assertCookie(AdminContext::VISIBILITY_COOKIE, '1');

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('verse_meta.summary_short', 'Study notes visible in admin mode.')
            ->where('admin.meta_update_href', $this->metaUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.content_block_store_href', $this->contentBlockStoreRoute)
            ->where('admin.content_block_types', ['text', 'quote', 'image'])
            ->where('admin.content_block_default_region', 'study')
            ->where(
                "admin.content_block_update_hrefs.{$publishedBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.update', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $publishedBlock,
                ]),
            ),
        );

    $hideResponse = $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => false,
        ]);

    $hideResponse
        ->assertRedirect($this->verseShowRoute)
        ->assertCookieExpired(AdminContext::VISIBILITY_COOKIE);
});

test('authorized editors can create canonical verse rows from chapter section group surfaces', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();
    $verseListRoute = route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]);

    $this->actingAs($editor)
        ->from($verseListRoute)
        ->post($this->verseStoreRoute, [
            'slug' => 'created-verse-row',
            'number' => '99',
            'text' => 'Created verse text from the chapter section group surface.',
        ])
        ->assertRedirect($verseListRoute);

    $createdVerse = $this->chapterSection->fresh()
        ->verses()
        ->where('slug', 'created-verse-row')
        ->firstOrFail();

    expect($createdVerse->number)->toBe('99');
    expect($createdVerse->text)
        ->toBe('Created verse text from the chapter section group surface.');
});

test('authorized editors can update verse meta without wiping untouched full-edit fields', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->firstVerse->verseMeta()->create([
        'summary_short' => 'Original summary',
        'scene_location' => 'Kurukshetra',
        'narrative_phase' => 'Opening tension',
        'teaching_mode' => 'Dialogue',
        'difficulty_level' => 'Intermediate',
        'memorization_priority' => 4,
        'is_featured' => false,
        'keywords_json' => ['old'],
        'study_flags_json' => ['legacy'],
    ]);

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->patch($this->metaUpdateRoute, [
            'summary_short' => 'Context-aware summary',
            'is_featured' => true,
            'keywords' => ['clarity', 'discipline'],
            'study_flags' => ['memorization'],
        ])
        ->assertRedirect($this->verseShowRoute);

    $meta = $this->firstVerse->fresh()->verseMeta()->firstOrFail();

    expect($meta->summary_short)->toBe('Context-aware summary');
    expect($meta->is_featured)->toBeTrue();
    expect($meta->keywords_json)->toBe(['clarity', 'discipline']);
    expect($meta->study_flags_json)->toBe(['memorization']);
    expect($meta->scene_location)->toBe('Kurukshetra');
    expect($meta->narrative_phase)->toBe('Opening tension');
    expect($meta->teaching_mode)->toBe('Dialogue');
    expect($meta->difficulty_level)->toBe('Intermediate');
    expect($meta->memorization_priority)->toBe(4);

    $this->actingAs($editor)
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('verse_meta.summary_short', 'Context-aware summary')
            ->where('verse_meta.scene_location', 'Kurukshetra')
            ->where('verse_meta.is_featured', true)
            ->where('verse_meta.keywords_json.0', 'clarity')
            ->where('verse_meta.study_flags_json.0', 'memorization'),
        );
});

test('authorized editors can manage verse note blocks while public verse page stays published only', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $publishedBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published verse note',
        'body' => 'Visible on the public verse page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $draftBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft verse note',
        'body' => 'Still hidden publicly.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'quote',
            'title' => 'Fresh draft note',
            'body' => 'Created from the full editor.',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'draft',
        ])
        ->assertRedirect($this->fullEditRoute);

    $newDraftBlock = $this->firstVerse->contentBlocks()
        ->where('title', 'Fresh draft note')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->patch(route('scripture.chapters.verses.admin.content-blocks.update', [
            ...$this->verseRouteParameters,
            'contentBlock' => $draftBlock,
        ]), [
            'block_type' => 'text',
            'title' => 'Updated draft verse note',
            'body' => 'Still hidden publicly after update.',
            'region' => 'study',
            'sort_order' => 2,
            'status' => 'draft',
        ])
        ->assertRedirect($this->fullEditRoute);

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/full-edit')
            ->where('admin_entity.key', 'verse')
            ->where('next_content_block_sort_order', 4)
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Published verse note')
            ->where('admin_content_blocks.1.title', 'Updated draft verse note')
            ->where('admin_content_blocks.1.status', 'draft')
            ->where('admin_content_blocks.2.title', 'Fresh draft note')
            ->where('admin_content_blocks.2.block_type', 'quote')
            ->where('admin_content_blocks.2.status', 'draft')
            ->where('protected_content_blocks', []),
        );

    $this->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published verse note'),
        );

    expect($newDraftBlock->status)->toBe('draft');
    expect($publishedBlock->status)->toBe('published');
});

test('content block update hard fails when the block is not owned by the current verse', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $foreignBlock = $this->secondVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Other verse block',
        'body' => 'Not owned by the current verse.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.verses.admin.content-blocks.update', [
            ...$this->verseRouteParameters,
            'contentBlock' => $foreignBlock,
        ]), [
            'block_type' => 'text',
            'title' => 'Should not update',
            'body' => 'No change should happen.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertNotFound();

    expect(ContentBlock::query()->findOrFail($foreignBlock->id)->title)
        ->toBe('Other verse block');
});

test('content block editing is limited to verse owned registered note blocks', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $textBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Editable text note',
        'body' => 'This note should stay editable.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $quoteBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'quote',
        'title' => 'Editable quote note',
        'body' => 'This quote should stay editable.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $imageBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'image',
        'title' => 'Editable image note',
        'body' => 'Image caption that should stay editable.',
        'data_json' => [
            'url' => 'https://example.test/verse-image.jpg',
            'alt' => 'Editable verse image alt',
        ],
        'sort_order' => 3,
        'status' => 'published',
    ]);

    $videoBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Protected video block',
        'body' => null,
        'data_json' => ['url' => 'https://example.test/video.mp4'],
        'sort_order' => 4,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                "admin.content_block_update_hrefs.{$textBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.update', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $textBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$quoteBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.update', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $quoteBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$imageBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.update', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $imageBlock,
                ]),
            )
            ->missing("admin.content_block_duplicate_hrefs.{$imageBlock->id}")
            ->missing("admin.content_block_update_hrefs.{$videoBlock->id}"),
        );

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->patch(route('scripture.chapters.verses.admin.content-blocks.update', [
            ...$this->verseRouteParameters,
            'contentBlock' => $imageBlock,
        ]), [
            'block_type' => 'image',
            'title' => 'Updated image note',
            'body' => 'Updated verse image caption.',
            'media_url' => 'https://example.test/verse-image-updated.jpg',
            'alt_text' => 'Updated verse image alt',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'published',
        ])
        ->assertRedirect($this->fullEditRoute);

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Editable text note')
            ->where('admin_content_blocks.0.block_type', 'text')
            ->where('admin_content_blocks.1.title', 'Editable quote note')
            ->where('admin_content_blocks.1.block_type', 'quote')
            ->where('admin_content_blocks.2.title', 'Updated image note')
            ->where('admin_content_blocks.2.block_type', 'image')
            ->where('admin_content_blocks.2.data_json.url', 'https://example.test/verse-image-updated.jpg')
            ->where('admin_content_blocks.2.data_json.alt', 'Updated verse image alt')
            ->has('protected_content_blocks', 1)
            ->where('protected_content_blocks.0.title', 'Protected video block')
            ->where(
                'protected_content_blocks.0.protection_reason',
                'Only verse-owned registered note blocks (text, quote, and image) are editable in this phase.',
            ),
        );

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.verses.admin.content-blocks.update', [
            ...$this->verseRouteParameters,
            'contentBlock' => $videoBlock,
        ]), [
            'block_type' => 'text',
            'title' => 'Should stay protected',
            'body' => 'No update should be allowed.',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'published',
        ])
        ->assertNotFound();

    expect(ContentBlock::query()->findOrFail($videoBlock->id)->title)
        ->toBe('Protected video block');
    expect(ContentBlock::query()->findOrFail($imageBlock->id)->data_json)
        ->toBe([
            'url' => 'https://example.test/verse-image-updated.jpg',
            'alt' => 'Updated verse image alt',
        ]);
});

test('verse note creation uses shared ordering when sort order inserts before existing notes', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing first note',
        'body' => 'First note body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing second note',
        'body' => 'Second note body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'quote',
            'title' => 'Inserted first quote',
            'body' => 'Inserted ahead of the existing notes.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertRedirect($this->fullEditRoute);

    $orderedTitles = $this->firstVerse->fresh()
        ->contentBlocks()
        ->orderBy('sort_order')
        ->orderBy('id')
        ->pluck('title')
        ->all();
    $orderedSortOrders = $this->firstVerse->fresh()
        ->contentBlocks()
        ->orderBy('sort_order')
        ->orderBy('id')
        ->pluck('sort_order')
        ->all();

    expect($orderedTitles)->toBe([
        'Inserted first quote',
        'Existing first note',
        'Existing second note',
    ]);
    expect($orderedSortOrders)->toBe([1, 2, 3]);

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('next_content_block_sort_order', 4)
            ->where('admin_content_blocks.0.title', 'Inserted first quote')
            ->where('admin_content_blocks.0.block_type', 'quote')
            ->where('admin_content_blocks.1.title', 'Existing first note')
            ->where('admin_content_blocks.2.title', 'Existing second note'),
        );
});

test('verse note creation accepts contextual insertion points and preserves ordering', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing first note',
        'body' => 'First note body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $anchorBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing second note',
        'body' => 'Second note body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'quote',
            'title' => 'Inserted quote',
            'body' => 'Inserted from the public page flow.',
            'region' => 'study',
            'status' => 'published',
            'insertion_mode' => 'before',
            'relative_block_id' => $anchorBlock->id,
        ])
        ->assertRedirect($this->verseShowRoute);

    $orderedTitles = $this->firstVerse->fresh()
        ->contentBlocks()
        ->orderBy('sort_order')
        ->orderBy('id')
        ->pluck('title')
        ->all();
    $orderedSortOrders = $this->firstVerse->fresh()
        ->contentBlocks()
        ->orderBy('sort_order')
        ->orderBy('id')
        ->pluck('sort_order')
        ->all();

    expect($orderedTitles)->toBe([
        'Existing first note',
        'Inserted quote',
        'Existing second note',
    ]);
    expect($orderedSortOrders)->toBe([1, 2, 3]);
    expect(
        $this->firstVerse->fresh()
            ->contentBlocks()
            ->where('title', 'Inserted quote')
            ->value('block_type'),
    )->toBe('quote');
});

test('authorized editors can manage verse note blocks from the public page', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $firstBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'First published note',
        'body' => 'First body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $secondBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Second published note',
        'body' => 'Second body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $thirdBlock = $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Third published note',
        'body' => 'Third body.',
        'data_json' => null,
        'sort_order' => 3,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                "admin.content_block_move_down_hrefs.{$firstBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.move-down', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_reorder_hrefs.{$firstBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.move', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_move_up_hrefs.{$secondBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.move-up', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $secondBlock,
                ]),
            )
            ->where(
                "admin.content_block_duplicate_hrefs.{$secondBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.duplicate', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $secondBlock,
                ]),
            )
            ->where(
                "admin.content_block_delete_hrefs.{$thirdBlock->id}",
                route('scripture.chapters.verses.admin.content-blocks.destroy', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $thirdBlock,
                ]),
            ),
        );

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post(route('scripture.chapters.verses.admin.content-blocks.move', [
            ...$this->verseRouteParameters,
            'contentBlock' => $firstBlock,
        ]), [
            'relative_block_id' => $secondBlock->id,
            'position' => 'after',
        ])
        ->assertRedirect($this->verseShowRoute);

    expect(
        $this->firstVerse->fresh()
            ->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('title')
            ->all(),
    )->toBe([
        'Second published note',
        'First published note',
        'Third published note',
    ]);

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post(route('scripture.chapters.verses.admin.content-blocks.duplicate', [
            ...$this->verseRouteParameters,
            'contentBlock' => $secondBlock,
        ]))
        ->assertRedirect($this->verseShowRoute);

    expect(
        $this->firstVerse->fresh()
            ->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('title')
            ->all(),
    )->toBe([
        'Second published note',
        'Second published note Copy',
        'First published note',
        'Third published note',
    ]);

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->delete(route('scripture.chapters.verses.admin.content-blocks.destroy', [
            ...$this->verseRouteParameters,
            'contentBlock' => $thirdBlock,
        ]))
        ->assertRedirect($this->verseShowRoute);

    $this->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('content_blocks.0.title', 'Second published note')
            ->where('content_blocks.1.title', 'Second published note Copy')
            ->where('content_blocks.2.title', 'First published note')
            ->has('content_blocks', 3),
        );
});
