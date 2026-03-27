<?php

use App\Models\Book;
use App\Models\ContentBlock;
use App\Models\Media;
use App\Models\MediaAssignment;
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

    $this->booksIndexRoute = route('scripture.books.index');
    $this->showRoute = route('scripture.books.show', $this->book);
    $this->overviewRoute = route('scripture.books.overview', $this->book);
    $this->detailsUpdateRoute = route('scripture.books.admin.details.update', $this->book);
    $this->fullEditRoute = route('scripture.books.admin.full-edit', $this->book);
    $this->canonicalEditRoute = route('scripture.books.admin.canonical-edit', $this->book);
    $this->contentBlockStoreRoute = route(
        'scripture.books.admin.content-blocks.store',
        $this->book,
    );
    $this->mediaAssignmentStoreRoute = route(
        'scripture.books.admin.media-assignments.store',
        $this->book,
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected book admin context', function () {
    $this->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->showRoute)
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
        ->get($this->canonicalEditRoute)
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'Blocked book update',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'text',
            'title' => 'Blocked block',
            'body' => 'This should not be created.',
            'region' => 'overview',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->mediaAssignmentStoreRoute, [
            'media_id' => 1,
            'role' => 'overview_video',
            'title_override' => 'Blocked media',
            'caption_override' => 'This should not be created.',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertForbidden();
});

test('authorized editors can toggle protected admin visibility and receive registered book admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();
    $textBlock = $this->book->contentBlocks()
        ->where('block_type', 'text')
        ->firstOrFail();
    $quoteBlock = $this->book->contentBlocks()
        ->where('block_type', 'quote')
        ->firstOrFail();
    $videoBlock = $this->book->contentBlocks()
        ->where('block_type', 'video')
        ->firstOrFail();

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('admin', null),
        );

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertRedirect($this->showRoute)
        ->assertCookie(AdminContext::VISIBILITY_COOKIE, '1');

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->booksIndexRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'books.0.admin.details_update_href',
                route('scripture.books.admin.details.update', $this->book),
            )
            ->where(
                'books.0.admin.full_edit_href',
                route('scripture.books.admin.full-edit', $this->book),
            )
            ->where(
                'books.0.admin.canonical_edit_href',
                route('scripture.books.admin.canonical-edit', $this->book),
            ),
        );

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.details_update_href', $this->detailsUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.canonical_edit_href', $this->canonicalEditRoute)
            ->where('admin.content_block_store_href', $this->contentBlockStoreRoute)
            ->where('admin.content_block_types', ['text', 'quote'])
            ->where('admin.content_block_default_region', 'overview')
            ->where('admin.content_block_regions', ['overview', 'highlights'])
            ->where(
                "admin.content_block_update_hrefs.{$textBlock->id}",
                route('scripture.books.admin.content-blocks.update', [
                    'book' => $this->book,
                    'contentBlock' => $textBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$quoteBlock->id}",
                route('scripture.books.admin.content-blocks.update', [
                    'book' => $this->book,
                    'contentBlock' => $quoteBlock,
                ]),
            )
            ->missing("admin.content_block_update_hrefs.{$videoBlock->id}"),
        );

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->overviewRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.canonical_edit_href', $this->canonicalEditRoute)
            ->where('admin.content_block_store_href', $this->contentBlockStoreRoute)
            ->where('admin.content_block_types', ['text', 'quote'])
            ->where('admin.content_block_default_region', 'overview')
            ->where('admin.content_block_regions', ['overview', 'highlights'])
            ->where(
                "admin.content_block_update_hrefs.{$quoteBlock->id}",
                route('scripture.books.admin.content-blocks.update', [
                    'book' => $this->book,
                    'contentBlock' => $quoteBlock,
                ]),
            ),
        );
});

test('authorized editors can update book description across book surfaces', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'Updated editorial book description from admin context.',
        ])
        ->assertRedirect($this->showRoute);

    expect($this->book->fresh()->description)
        ->toBe('Updated editorial book description from admin context.');

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book.description',
                'Updated editorial book description from admin context.',
            ),
        );

    $this->actingAs($editor)
        ->get($this->overviewRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book.description',
                'Updated editorial book description from admin context.',
            ),
        );
});

test('authorized editors can manage registered book content blocks while unregistered block types stay protected', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $book = Book::query()->create([
        'slug' => 'book-admin-scope',
        'number' => '99',
        'title' => 'Book Admin Scope',
        'description' => 'Book used for schema-driven book admin tests.',
    ]);

    $showRoute = route('scripture.books.show', $book);
    $fullEditRoute = route('scripture.books.admin.full-edit', $book);
    $storeRoute = route('scripture.books.admin.content-blocks.store', $book);

    $textBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'Published book note',
        'body' => 'Visible on the public book page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $videoBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'video',
        'title' => 'Protected legacy video',
        'body' => 'Still rendered publicly but not editable through the registered block editor.',
        'data_json' => ['url' => 'https://example.test/book-video.mp4'],
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'block_type' => 'quote',
            'title' => 'Fresh draft quote',
            'body' => 'Created through the Book full editor.',
            'region' => 'highlights',
            'sort_order' => 3,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newQuote = $book->contentBlocks()
        ->where('title', 'Fresh draft quote')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.books.admin.content-blocks.update', [
            'book' => $book,
            'contentBlock' => $textBlock,
        ]), [
            'block_type' => 'text',
            'title' => 'Updated published book note',
            'body' => 'Visible publicly after update.',
            'region' => 'overview',
            'sort_order' => 1,
            'status' => 'published',
        ])
        ->assertRedirect($fullEditRoute);

    $this->actingAs($editor)
        ->patch(route('scripture.books.admin.content-blocks.update', [
            'book' => $book,
            'contentBlock' => $videoBlock,
        ]), [
            'block_type' => 'quote',
            'title' => 'Should stay protected',
            'body' => 'This update should fail.',
            'region' => 'overview',
            'sort_order' => 2,
            'status' => 'published',
        ])
        ->assertNotFound();

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/full-edit')
            ->where('admin_entity.primary_table', 'books')
            ->where('admin_entity.edit_modes.canonical.status', 'active')
            ->where('admin_entity.regions.1.key', 'content_blocks')
            ->where('admin_entity.regions.1.method_families', [
                'content_block_create',
                'content_block_edit',
                'ordered_insertion',
                'reorder',
            ])
            ->where('admin_entity.regions.3.key', 'media_slots')
            ->where('admin_entity.regions.3.method_families', [
                'media_slot_edit',
            ])
            ->has('admin_entity.methods_by_mode.contextual', 7)
            ->has('admin_entity.methods_by_mode.full', 18)
            ->has('admin_content_blocks', 2)
            ->where('admin_content_blocks.0.title', 'Updated published book note')
            ->where('admin_content_blocks.1.title', 'Fresh draft quote')
            ->where('admin_content_blocks.1.block_type', 'quote')
            ->has('protected_content_blocks', 1)
            ->where('protected_content_blocks.0.title', 'Protected legacy video'),
        );

    $this->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Updated published book note')
            ->where('book.media_slots.overview_video.title', 'Protected legacy video')
            ->where(
                'book.media_slots.overview_video.media.url',
                'https://example.test/book-video.mp4',
            ),
        );

    expect($newQuote->status)->toBe('draft');
    expect(ContentBlock::query()->findOrFail($videoBlock->id)->title)
        ->toBe('Protected legacy video');
});

test('authorized editors can create book content blocks at contextual insertion points', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $book = Book::query()->create([
        'slug' => 'book-inline-insertions',
        'number' => '100',
        'title' => 'Book Inline Insertions',
        'description' => 'Book used for contextual insertion ordering tests.',
    ]);

    $showRoute = route('scripture.books.show', $book);
    $storeRoute = route('scripture.books.admin.content-blocks.store', $book);

    $firstBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'First published note',
        'body' => 'First note body.',
        'data_json' => null,
        'sort_order' => 10,
        'status' => 'published',
    ]);

    $videoBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'video',
        'title' => 'Hidden video note',
        'body' => 'Legacy video block that should stay outside the inline flow.',
        'data_json' => ['url' => 'https://example.test/hidden-video.mp4'],
        'sort_order' => 20,
        'status' => 'published',
    ]);

    $lastBlock = $book->contentBlocks()->create([
        'region' => 'highlights',
        'block_type' => 'quote',
        'title' => 'Last published quote',
        'body' => 'Last quote body.',
        'data_json' => null,
        'sort_order' => 30,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->from($showRoute)
        ->post($storeRoute, [
            'block_type' => 'text',
            'title' => 'Inserted at start',
            'body' => 'Placed before the first public block.',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'start',
        ])
        ->assertRedirect($showRoute);

    $this->actingAs($editor)
        ->from($showRoute)
        ->post($storeRoute, [
            'block_type' => 'quote',
            'title' => 'Inserted between blocks',
            'body' => 'Placed between the first and last visible blocks.',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'after',
            'relative_block_id' => $firstBlock->id,
        ])
        ->assertRedirect($showRoute);

    $this->actingAs($editor)
        ->from($showRoute)
        ->post($storeRoute, [
            'block_type' => 'text',
            'title' => 'Inserted at end',
            'body' => 'Placed after the last visible block.',
            'region' => 'highlights',
            'status' => 'published',
            'insertion_mode' => 'end',
        ])
        ->assertRedirect($showRoute);

    expect(
        $book->contentBlocks()
            ->orderBy('sort_order')
            ->pluck('sort_order')
            ->all(),
    )->toBe([1, 2, 3, 4, 5, 6]);

    expect(
        $book->contentBlocks()
            ->published()
            ->where('block_type', '!=', 'video')
            ->orderBy('sort_order')
            ->pluck('title')
            ->all(),
    )->toBe([
        'Inserted at start',
        'First published note',
        'Inserted between blocks',
        'Last published quote',
        'Inserted at end',
    ]);

    expect(ContentBlock::query()->findOrFail($videoBlock->id)->sort_order)
        ->toBe(4);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('content_blocks.0.title', 'Inserted at start')
            ->where('content_blocks.1.title', 'First published note')
            ->where('content_blocks.2.title', 'Inserted between blocks')
            ->where('content_blocks.3.title', 'Last published quote')
            ->where('content_blocks.4.title', 'Inserted at end')
            ->where(
                "admin.content_block_update_hrefs.{$firstBlock->id}",
                route('scripture.books.admin.content-blocks.update', [
                    'book' => $book,
                    'contentBlock' => $firstBlock,
                ]),
            ),
        );

    expect($lastBlock->fresh()->sort_order)->toBe(5);
});

test('authorized editors can manage visible book blocks from the public page', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $book = Book::query()->create([
        'slug' => 'book-public-block-management',
        'number' => '109',
        'title' => 'Book Public Block Management',
        'description' => 'Book used for public block management tests.',
    ]);

    $showRoute = route('scripture.books.show', $book);

    $firstBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'First published note',
        'body' => 'First body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $secondBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'Second published note',
        'body' => 'Second body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $quoteBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'quote',
        'title' => 'Closing quote',
        'body' => 'Quote body.',
        'data_json' => null,
        'sort_order' => 3,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                "admin.content_block_move_down_hrefs.{$firstBlock->id}",
                route('scripture.books.admin.content-blocks.move-down', [
                    'book' => $book,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_reorder_hrefs.{$firstBlock->id}",
                route('scripture.books.admin.content-blocks.move', [
                    'book' => $book,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->missing("admin.content_block_move_up_hrefs.{$firstBlock->id}")
            ->where(
                "admin.content_block_move_up_hrefs.{$secondBlock->id}",
                route('scripture.books.admin.content-blocks.move-up', [
                    'book' => $book,
                    'contentBlock' => $secondBlock,
                ]),
            )
            ->where(
                "admin.content_block_duplicate_hrefs.{$firstBlock->id}",
                route('scripture.books.admin.content-blocks.duplicate', [
                    'book' => $book,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->missing("admin.content_block_duplicate_hrefs.{$quoteBlock->id}")
            ->where(
                "admin.content_block_delete_hrefs.{$quoteBlock->id}",
                route('scripture.books.admin.content-blocks.destroy', [
                    'book' => $book,
                    'contentBlock' => $quoteBlock,
                ]),
            ),
        );

    $this->actingAs($editor)
        ->from($showRoute)
        ->post(route('scripture.books.admin.content-blocks.move', [
            'book' => $book,
            'contentBlock' => $firstBlock,
        ]), [
            'relative_block_id' => $secondBlock->id,
            'position' => 'after',
        ])
        ->assertRedirect($showRoute);

    expect(
        $book->fresh()
            ->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->pluck('title')
            ->all(),
    )->toBe([
        'Second published note',
        'First published note',
        'Closing quote',
    ]);

    $this->actingAs($editor)
        ->from($showRoute)
        ->post(route('scripture.books.admin.content-blocks.duplicate', [
            'book' => $book,
            'contentBlock' => $secondBlock,
        ]))
        ->assertRedirect($showRoute);

    expect(
        $book->fresh()
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
        'Closing quote',
    ]);

    $this->actingAs($editor)
        ->from($showRoute)
        ->delete(route('scripture.books.admin.content-blocks.destroy', [
            'book' => $book,
            'contentBlock' => $quoteBlock,
        ]))
        ->assertRedirect($showRoute);

    $this->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('content_blocks.0.title', 'Second published note')
            ->where('content_blocks.1.title', 'Second published note Copy')
            ->where('content_blocks.2.title', 'First published note')
            ->has('content_blocks', 3),
        );
});

test('authorized editors can manage book media assignments and access canonical protected book identity view', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $book = Book::query()->create([
        'slug' => 'book-media-admin',
        'number' => '108',
        'title' => 'Book Media Admin',
        'description' => 'Book used for media slot tests.',
    ]);

    $mediaOne = Media::query()->create([
        'media_type' => 'video',
        'title' => 'Overview Video One',
        'url' => 'https://example.test/video-one.mp4',
        'sort_order' => 1,
    ]);

    $mediaTwo = Media::query()->create([
        'media_type' => 'video',
        'title' => 'Overview Video Two',
        'url' => 'https://example.test/video-two.mp4',
        'sort_order' => 2,
    ]);

    $existingAssignment = $book->mediaAssignments()->create([
        'media_id' => $mediaOne->id,
        'role' => 'overview_video',
        'title_override' => 'Existing overview slot',
        'caption_override' => 'Existing caption',
        'sort_order' => 1,
        'status' => 'published',
        'meta_json' => ['keep' => true],
    ]);

    $fullEditRoute = route('scripture.books.admin.full-edit', $book);
    $canonicalEditRoute = route('scripture.books.admin.canonical-edit', $book);
    $storeRoute = route('scripture.books.admin.media-assignments.store', $book);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'media_id' => $mediaTwo->id,
            'role' => 'supporting_media',
            'title_override' => 'Fresh supporting slot',
            'caption_override' => 'Fresh supporting caption',
            'sort_order' => 2,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newAssignment = $book->mediaAssignments()
        ->where('title_override', 'Fresh supporting slot')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.books.admin.media-assignments.update', [
            'book' => $book,
            'mediaAssignment' => $existingAssignment,
        ]), [
            'media_id' => $mediaTwo->id,
            'role' => 'hero_media',
            'title_override' => 'Updated hero slot',
            'caption_override' => 'Updated hero caption',
            'sort_order' => 1,
            'status' => 'published',
        ])
        ->assertRedirect($fullEditRoute);

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/full-edit')
            ->where('admin_entity.primary_table', 'books')
            ->has('available_media', 2)
            ->has('admin_media_assignments', 2)
            ->where('admin_media_assignments.0.role', 'hero_media')
            ->where('admin_media_assignments.0.title_override', 'Updated hero slot')
            ->where('admin_media_assignments.1.role', 'supporting_media')
            ->where('admin_media_assignments.1.status', 'draft'),
        );

    $this->actingAs($editor)
        ->get($canonicalEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/canonical-edit')
            ->where('admin_entity.edit_modes.canonical.status', 'active')
            ->has('admin_entity.field_groups.identity', 3)
            ->has('admin_entity.methods_by_mode.canonical', 4)
            ->where('admin_entity.methods_by_mode.canonical.0.family', 'canonical_display')
            ->where('admin_entity.methods_by_mode.canonical.3.label', 'Canonical browse structure display')
            ->where('book.slug', 'book-media-admin')
            ->where('book.title', 'Book Media Admin'),
        );

    expect($newAssignment->status)->toBe('draft');
    expect(MediaAssignment::query()->findOrFail($existingAssignment->id)->meta_json)
        ->toBe(['keep' => true]);
});
