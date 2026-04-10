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
    $this->bookSection = $this->book->bookSections()
        ->where('slug', 'main')
        ->firstOrFail();
    $this->chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail();

    $this->booksIndexRoute = route('scripture.books.index');
    $this->showRoute = route('scripture.books.show', $this->book);
    $this->bookStoreRoute = route('scripture.books.admin.store');
    $this->bookSectionStoreRoute = route('scripture.book-sections.admin.store', [
        'book' => $this->book,
    ]);
    $this->chapterStoreRoute = route('scripture.chapters.admin.store', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
    ]);
    $this->chapterIdentityUpdateRoute = route(
        'scripture.chapters.admin.identity.update',
        [
            'book' => $this->book,
            'bookSection' => $this->bookSection,
            'chapter' => $this->chapter,
        ],
    );
    $this->bookSectionDetailsUpdateRoute = route(
        'scripture.book-sections.admin.details.update',
        [
            'book' => $this->book,
            'bookSection' => $this->bookSection,
        ],
    );
    $this->bookSectionIntroStoreRoute = route(
        'scripture.book-sections.admin.content-blocks.store',
        [
            'book' => $this->book,
            'bookSection' => $this->bookSection,
        ],
    );
    $this->detailsUpdateRoute = route('scripture.books.admin.details.update', $this->book);
    $this->identityUpdateRoute = route('scripture.books.admin.identity.update', $this->book);
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
});

test('guests and non editors cannot access protected book admin context', function () {
    $this->get($this->booksIndexRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', false)
            ->where('books.0.admin', null),
        );

    $this->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', false)
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $this->post($this->bookStoreRoute, [
        'slug' => 'blocked-book',
        'title' => 'Blocked Book',
    ])->assertRedirect(route('login'));

    $this->post($this->bookSectionStoreRoute, [
        'slug' => 'blocked-section',
    ])->assertRedirect(route('login'));

    $this->post($this->chapterStoreRoute, [
        'slug' => 'blocked-chapter',
    ])->assertRedirect(route('login'));

    $this->patch($this->bookSectionDetailsUpdateRoute, [
        'number' => 'II',
        'title' => 'Blocked section title',
    ])->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->booksIndexRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', false)
            ->where('books.0.admin', null),
        );

    $this->actingAs($nonEditor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', false)
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->bookStoreRoute, [
            'slug' => 'blocked-book',
            'title' => 'Blocked Book',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->bookSectionStoreRoute, [
            'slug' => 'blocked-section',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->chapterStoreRoute, [
            'slug' => 'blocked-chapter',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->get($this->canonicalEditRoute)
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->patch($this->bookSectionDetailsUpdateRoute, [
            'number' => 'II',
            'title' => 'Blocked section title',
        ])
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
            'role' => 'hero_media',
            'title_override' => 'Blocked media',
            'caption_override' => 'This should not be created.',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertForbidden();
});

test('authorized editors receive registered book admin props on book detail and library index', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();
    $sectionIntroBlock = $this->bookSection->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'Section intro note',
        'body' => 'Editable intro note for the grouped book section surface.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('isAdmin', true)
            ->where('admin.book_section_store_href', $this->bookSectionStoreRoute)
            ->where('admin.identity_update_href', $this->identityUpdateRoute)
            ->where('admin.details_update_href', $this->detailsUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.canonical_edit_href', $this->canonicalEditRoute),
        )
        ->assertInertia(fn (Assert $page) => $page
            ->where('book_sections.0.intro_block.id', $sectionIntroBlock->id)
            ->where(
                'book_sections.0.admin.details_update_href',
                $this->bookSectionDetailsUpdateRoute,
            ),
        )
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book_sections.0.admin.child_store_href',
                $this->chapterStoreRoute,
            )
            ->where(
                'book_sections.0.chapters.0.admin.identity_update_href',
                $this->chapterIdentityUpdateRoute,
            )
            ->where(
                'book_sections.0.chapters.0.admin.full_edit_href',
                route('scripture.chapters.admin.full-edit', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                ]),
            )
            ->where(
                'book_sections.0.admin.intro_store_href',
                $this->bookSectionIntroStoreRoute,
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.id',
                $sectionIntroBlock->id,
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.block_type',
                'text',
            )
            ->where(
                'book_sections.0.admin.primary_intro_update_href',
                route('scripture.book-sections.admin.content-blocks.update', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'contentBlock' => $sectionIntroBlock,
                ]),
            )
            ->where('book_sections.0.admin.intro_block_types', ['text', 'quote', 'image'])
            ->where('book_sections.0.admin.intro_default_region', 'overview'),
        );

    $this->actingAs($editor)
        ->get($this->booksIndexRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('isAdmin', true)
            ->where('admin.store_href', $this->bookStoreRoute)
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
            ->where('admin.media_assignment_store_href', $this->mediaAssignmentStoreRoute),
        );
});

test('authorized editors can create canonical book, book section, and chapter rows from hierarchy admin routes', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->booksIndexRoute)
        ->post($this->bookStoreRoute, [
            'slug' => 'book-created-from-library',
            'number' => '201',
            'title' => 'Book Created From Library',
        ])
        ->assertRedirect($this->booksIndexRoute);

    $createdBook = Book::query()
        ->where('slug', 'book-created-from-library')
        ->firstOrFail();

    expect($createdBook->number)->toBe('201');
    expect($createdBook->title)->toBe('Book Created From Library');

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->post($this->bookSectionStoreRoute, [
            'slug' => 'created-book-section',
            'number' => 'I',
            'title' => 'Created Book Section',
        ])
        ->assertRedirect($this->showRoute);

    $createdBookSection = $this->book->fresh()
        ->bookSections()
        ->where('slug', 'created-book-section')
        ->firstOrFail();

    expect($createdBookSection->number)->toBe('I');
    expect($createdBookSection->title)->toBe('Created Book Section');

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->post($this->chapterStoreRoute, [
            'slug' => 'created-chapter-row',
            'number' => '20',
            'title' => 'Created Chapter Row',
        ])
        ->assertRedirect($this->showRoute);

    $createdChapter = $this->bookSection->fresh()
        ->chapters()
        ->where('slug', 'created-chapter-row')
        ->firstOrFail();

    expect($createdChapter->number)->toBe('20');
    expect($createdChapter->title)->toBe('Created Chapter Row');
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
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book.description',
                'Updated editorial book description from admin context.',
            ),
        );

});

test('authorized editors can update basic book section row details from grouped book surfaces', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->patch($this->bookSectionDetailsUpdateRoute, [
            'number' => 'I',
            'title' => 'Main Movement',
        ])
        ->assertRedirect($this->showRoute);

    expect($this->bookSection->fresh()->number)->toBe('I');
    expect($this->bookSection->fresh()->title)->toBe('Main Movement');

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('book_sections.0.number', 'I')
            ->where('book_sections.0.title', 'Main Movement')
            ->where(
                'book_sections.0.admin.details_update_href',
                $this->bookSectionDetailsUpdateRoute,
            ),
        );
});

test('authorized editors can update chapter identity from the book page chapter list and stay on the book page', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->patch($this->chapterIdentityUpdateRoute, [
            'slug' => 'chapter-1-book-row-updated',
            'number' => '1B',
            'title' => 'Updated From Book Row',
            'return_to' => $this->showRoute,
        ])
        ->assertRedirect($this->showRoute);

    $updatedChapter = $this->chapter->fresh();

    expect($updatedChapter->slug)->toBe('chapter-1-book-row-updated');
    expect($updatedChapter->number)->toBe('1B');
    expect($updatedChapter->title)->toBe('Updated From Book Row');

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book_sections.0.chapters',
                fn ($chapters): bool => collect($chapters)->contains(
                    fn ($chapter): bool => $chapter['slug'] === 'chapter-1-book-row-updated'
                        && $chapter['number'] === '1B'
                        && $chapter['title'] === 'Updated From Book Row'
                        && $chapter['href'] === route('scripture.chapters.show', [
                            'book' => $this->book,
                            'bookSection' => $this->bookSection,
                            'chapter' => $updatedChapter,
                        ])
                        && ($chapter['admin']['identity_update_href'] ?? null) === route(
                            'scripture.chapters.admin.identity.update',
                            [
                                'book' => $this->book,
                                'bookSection' => $this->bookSection,
                                'chapter' => $updatedChapter,
                            ],
                        ),
                ),
            ),
        );
});

test('authorized editors can manage book section intro blocks from grouped book surfaces', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->post($this->bookSectionIntroStoreRoute, [
            'block_type' => 'image',
            'title' => 'Book section intro image',
            'body' => 'Intro caption for the grouped book section.',
            'media_url' => 'https://example.test/book-section-intro.jpg',
            'alt_text' => 'Book section intro illustration',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'start',
        ])
        ->assertRedirect($this->showRoute);

    $createdIntroBlock = $this->bookSection->fresh()
        ->contentBlocks()
        ->where('title', 'Book section intro image')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($this->showRoute)
        ->patch(route('scripture.book-sections.admin.content-blocks.update', [
            'book' => $this->book,
            'bookSection' => $this->bookSection,
            'contentBlock' => $createdIntroBlock,
        ]), [
            'block_type' => 'image',
            'title' => 'Updated book section intro image',
            'body' => 'Updated intro caption for the grouped book section.',
            'media_url' => 'https://example.test/book-section-intro-updated.jpg',
            'alt_text' => 'Updated book section intro illustration',
            'region' => 'overview',
            'sort_order' => 1,
            'status' => 'published',
        ])
        ->assertRedirect($this->showRoute);

    expect($createdIntroBlock->fresh()->data_json)->toBe([
        'url' => 'https://example.test/book-section-intro-updated.jpg',
        'alt' => 'Updated book section intro illustration',
    ]);

    $this->actingAs($editor)
        ->get($this->showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'book_sections.0.intro_block.title',
                'Updated book section intro image',
            )
            ->where(
                'book_sections.0.intro_block.block_type',
                'image',
            )
            ->where(
                'book_sections.0.intro_block.data_json.url',
                'https://example.test/book-section-intro-updated.jpg',
            )
            ->where(
                'book_sections.0.intro_block.data_json.alt',
                'Updated book section intro illustration',
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.title',
                'Updated book section intro image',
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.block_type',
                'image',
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.data_json.url',
                'https://example.test/book-section-intro-updated.jpg',
            )
            ->where(
                'book_sections.0.admin.primary_intro_block.data_json.alt',
                'Updated book section intro illustration',
            ),
        );
});

test('full edit keeps book content block management available while unregistered block types stay protected', function () {
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

    $imageBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'image',
        'title' => 'Published admin image',
        'body' => 'Existing image caption.',
        'data_json' => [
            'url' => 'https://example.test/original-book-image.jpg',
            'alt' => 'Original book image alt',
        ],
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $videoBlock = $book->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'video',
        'title' => 'Protected legacy video block',
        'body' => 'Still stored in the backend but not editable through the registered block editor.',
        'data_json' => ['url' => 'https://example.test/book-video.mp4'],
        'sort_order' => 3,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'block_type' => 'image',
            'title' => 'Fresh draft image',
            'body' => 'Created through the Book full editor.',
            'media_url' => 'https://example.test/fresh-book-image.jpg',
            'alt_text' => 'Fresh book image alt text',
            'region' => 'highlights',
            'sort_order' => 4,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newImage = $book->contentBlocks()
        ->where('title', 'Fresh draft image')
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
        ->from($fullEditRoute)
        ->patch(route('scripture.books.admin.content-blocks.update', [
            'book' => $book,
            'contentBlock' => $imageBlock,
        ]), [
            'block_type' => 'image',
            'title' => 'Updated published image',
            'body' => 'Updated image caption.',
            'media_url' => 'https://example.test/updated-book-image.jpg',
            'alt_text' => 'Updated book image alt text',
            'region' => 'overview',
            'sort_order' => 2,
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
            ->where('admin_entity.regions.3.key', 'book_media_slots')
            ->where('admin_entity.regions.3.method_families', [
                'media_slot_edit',
            ])
            ->has('admin_entity.methods_by_mode.contextual', 9)
            ->has('admin_entity.methods_by_mode.full', 20)
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Updated published book note')
            ->where('admin_content_blocks.1.title', 'Updated published image')
            ->where('admin_content_blocks.1.block_type', 'image')
            ->where('admin_content_blocks.1.data_json.url', 'https://example.test/updated-book-image.jpg')
            ->where('admin_content_blocks.1.data_json.alt', 'Updated book image alt text')
            ->where('admin_content_blocks.2.title', 'Fresh draft image')
            ->where('admin_content_blocks.2.block_type', 'image')
            ->where('admin_content_blocks.2.data_json.url', 'https://example.test/fresh-book-image.jpg')
            ->has('protected_content_blocks', 1)
            ->where('protected_content_blocks.0.title', 'Protected legacy video block'),
        );

    expect($newImage->status)->toBe('draft');
    expect($newImage->data_json)->toBe([
        'url' => 'https://example.test/fresh-book-image.jpg',
        'alt' => 'Fresh book image alt text',
    ]);
    expect(ContentBlock::query()->findOrFail($imageBlock->id)->data_json)
        ->toBe([
            'url' => 'https://example.test/updated-book-image.jpg',
            'alt' => 'Updated book image alt text',
        ]);
    expect(ContentBlock::query()->findOrFail($videoBlock->id)->title)
        ->toBe('Protected legacy video block');
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
        'role' => 'hero_media',
        'title_override' => 'Existing hero slot',
        'caption_override' => 'Existing hero caption',
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
