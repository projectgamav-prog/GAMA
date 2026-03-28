<?php

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ContentBlock;
use App\Models\User;
use App\Support\AdminContext\AdminContext;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\DevelopmentUserSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function chapterRouteParameters(
    Book $book,
    BookSection $bookSection,
    Chapter $chapter,
): array {
    return [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
    ];
}

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
    $this->chapterSection = $this->chapter->chapterSections()
        ->inCanonicalOrder()
        ->firstOrFail();

    $this->chapterShowRoute = route(
        'scripture.chapters.show',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
    );
    $this->readerRoute = route(
        'scripture.chapters.verses.index',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
    );
    $this->chapterSectionDetailsUpdateRoute = route(
        'scripture.chapter-sections.admin.details.update',
        [
            ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
            'chapterSection' => $this->chapterSection,
        ],
    );
    $this->chapterSectionIntroStoreRoute = route(
        'scripture.chapter-sections.admin.content-blocks.store',
        [
            ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
            'chapterSection' => $this->chapterSection,
        ],
    );
    $this->chapterSectionStoreRoute = route(
        'scripture.chapter-sections.admin.store',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
    );
    $this->verseStoreRoute = route(
        'scripture.chapters.verses.admin.store',
        [
            ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
            'chapterSection' => $this->chapterSection,
        ],
    );
    $this->fullEditRoute = route(
        'scripture.chapters.admin.full-edit',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
    );
    $this->contentBlockStoreRoute = route(
        'scripture.chapters.admin.content-blocks.store',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected chapter admin context', function () {
    $this->get($this->chapterShowRoute)
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

    $this->post($this->chapterSectionStoreRoute, [
        'slug' => 'blocked-chapter-section',
    ])->assertRedirect(route('login'));

    $this->patch($this->chapterSectionDetailsUpdateRoute, [
        'number' => 'A',
        'title' => 'Blocked chapter section',
    ])->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->chapterShowRoute)
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
        ->post($this->chapterSectionStoreRoute, [
            'slug' => 'blocked-chapter-section',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'text',
            'title' => 'Blocked chapter note',
            'body' => 'This should not be created.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->patch($this->chapterSectionDetailsUpdateRoute, [
            'number' => 'A',
            'title' => 'Blocked chapter section',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertForbidden();
});

test('authorized editors receive chapter admin props without requiring visibility mode', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $primaryBlock = $this->chapter->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'Published chapter overview',
        'body' => 'Editable chapter overview note shown on the public chapter page.',
        'data_json' => null,
        'sort_order' => 10,
        'status' => 'published',
    ]);
    $chapterSectionIntroBlock = $this->chapterSection->contentBlocks()->create([
        'region' => 'overview',
        'block_type' => 'text',
        'title' => 'Section intro note',
        'body' => 'Editable intro note shown on grouped chapter section surfaces.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', true)
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin.chapter_section_store_href', $this->chapterSectionStoreRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.content_block_store_href', $this->contentBlockStoreRoute)
            ->where('admin.content_block_types', ['text', 'quote', 'image'])
            ->where('admin.content_block_default_region', 'study')
            ->where('admin.primary_content_block_id', $primaryBlock->id)
            ->where(
                'admin.primary_content_block_update_href',
                route('scripture.chapters.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'contentBlock' => $primaryBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$primaryBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'contentBlock' => $primaryBlock,
                ]),
            ),
        )
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'chapter_sections.0.admin.details_update_href',
                $this->chapterSectionDetailsUpdateRoute,
            ),
        )
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'chapter_sections.0.admin.child_store_href',
                $this->verseStoreRoute,
            )
            ->where(
                'chapter_sections.0.admin.intro_store_href',
                $this->chapterSectionIntroStoreRoute,
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.id',
                $chapterSectionIntroBlock->id,
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.block_type',
                'text',
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_update_href',
                route('scripture.chapter-sections.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'chapterSection' => $this->chapterSection,
                    'contentBlock' => $chapterSectionIntroBlock,
                ]),
            )
            ->where('chapter_sections.0.admin.intro_block_types', ['text', 'quote', 'image'])
            ->where('chapter_sections.0.admin.intro_default_region', 'overview'),
        );

    $this->actingAs($editor)
        ->get($this->readerRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.chapter_section_store_href', $this->chapterSectionStoreRoute)
            ->where(
                'chapter_sections.0.admin.details_update_href',
                $this->chapterSectionDetailsUpdateRoute,
            ),
        )
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'chapter_sections.0.admin.child_store_href',
                $this->verseStoreRoute,
            )
            ->where(
                'chapter_sections.0.admin.intro_store_href',
                $this->chapterSectionIntroStoreRoute,
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.id',
                $chapterSectionIntroBlock->id,
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_update_href',
                route('scripture.chapter-sections.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'chapterSection' => $this->chapterSection,
                    'contentBlock' => $chapterSectionIntroBlock,
                ]),
            )
            ->where('chapter_sections.0.admin.intro_block_types', ['text', 'quote', 'image'])
            ->where('chapter_sections.0.admin.intro_default_region', 'overview'),
        );

    $response = $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ]);

    $response
        ->assertRedirect($this->chapterShowRoute)
        ->assertCookie(AdminContext::VISIBILITY_COOKIE, '1');

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAdmin', true)
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute),
        );

    $hideResponse = $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => false,
        ]);

    $hideResponse
        ->assertRedirect($this->chapterShowRoute)
        ->assertCookieExpired(AdminContext::VISIBILITY_COOKIE);
});

test('authorized editors can create canonical chapter section rows from grouped chapter surfaces', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->chapterSectionStoreRoute, [
            'slug' => 'created-chapter-section',
            'number' => 'I',
            'title' => 'Created Chapter Section',
        ])
        ->assertRedirect($this->chapterShowRoute);

    $createdChapterSection = $this->chapter->fresh()
        ->chapterSections()
        ->where('slug', 'created-chapter-section')
        ->firstOrFail();

    expect($createdChapterSection->number)->toBe('I');
    expect($createdChapterSection->title)->toBe('Created Chapter Section');
});

test('authorized editors can update basic chapter section row details across grouped chapter surfaces', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->patch($this->chapterSectionDetailsUpdateRoute, [
            'number' => '0',
            'title' => 'Opening Dialogue',
        ])
        ->assertRedirect($this->chapterShowRoute);

    expect($this->chapterSection->fresh()->number)->toBe('0');
    expect($this->chapterSection->fresh()->title)->toBe('Opening Dialogue');

    $this->actingAs($editor)
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('chapter_sections.0.number', '0')
            ->where('chapter_sections.0.title', 'Opening Dialogue')
            ->where(
                'chapter_sections.0.admin.details_update_href',
                $this->chapterSectionDetailsUpdateRoute,
            ),
        );

    $this->actingAs($editor)
        ->get($this->readerRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('chapter_sections.0.number', '0')
            ->where('chapter_sections.0.title', 'Opening Dialogue')
            ->where(
                'chapter_sections.0.admin.details_update_href',
                $this->chapterSectionDetailsUpdateRoute,
            ),
        );
});

test('authorized editors can manage chapter section intro blocks across grouped chapter surfaces', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->chapterSectionIntroStoreRoute, [
            'block_type' => 'quote',
            'title' => 'Chapter section intro quote',
            'body' => 'Grouped intro quote for the chapter section.',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'start',
        ])
        ->assertRedirect($this->chapterShowRoute);

    $createdIntroBlock = $this->chapterSection->fresh()
        ->contentBlocks()
        ->where('title', 'Chapter section intro quote')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($this->readerRoute)
        ->patch(route('scripture.chapter-sections.admin.content-blocks.update', [
            ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
            'chapterSection' => $this->chapterSection,
            'contentBlock' => $createdIntroBlock,
        ]), [
            'block_type' => 'image',
            'title' => 'Updated chapter section intro image',
            'body' => 'Updated grouped intro caption for the chapter section.',
            'media_url' => 'https://example.test/chapter-section-intro.jpg',
            'alt_text' => 'Chapter section intro illustration',
            'region' => 'overview',
            'sort_order' => 1,
            'status' => 'published',
        ])
        ->assertRedirect($this->readerRoute);

    expect($createdIntroBlock->fresh()->data_json)->toBe([
        'url' => 'https://example.test/chapter-section-intro.jpg',
        'alt' => 'Chapter section intro illustration',
    ]);

    $this->actingAs($editor)
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'chapter_sections.0.admin.primary_intro_block.title',
                'Updated chapter section intro image',
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.block_type',
                'image',
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.data_json.url',
                'https://example.test/chapter-section-intro.jpg',
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.data_json.alt',
                'Chapter section intro illustration',
            ),
        );

    $this->actingAs($editor)
        ->get($this->readerRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'chapter_sections.0.admin.primary_intro_block.block_type',
                'image',
            )
            ->where(
                'chapter_sections.0.admin.primary_intro_block.data_json.url',
                'https://example.test/chapter-section-intro.jpg',
            ),
        );
});

test('page intro edit is hidden when no clear primary published chapter note exists', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $firstBlock = $this->chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'First chapter note',
        'body' => 'One of multiple published chapter notes.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $secondBlock = $this->chapter->contentBlocks()->create([
        'region' => 'notes',
        'block_type' => 'text',
        'title' => 'Second chapter note',
        'body' => 'Another published chapter note.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where('admin.primary_content_block_id', null)
            ->where('admin.primary_content_block_update_href', null)
            ->where(
                "admin.content_block_update_hrefs.{$firstBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$secondBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
                    'contentBlock' => $secondBlock,
                ]),
            ),
        );
});

test('authorized editors can manage chapter note blocks while public chapter page stays published only', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $chapter = Chapter::query()->create([
        'book_section_id' => $this->bookSection->id,
        'slug' => 'chapter-admin-scope',
        'number' => '99',
        'title' => 'Chapter Admin Scope',
    ]);

    $routeParameters = chapterRouteParameters($this->book, $this->bookSection, $chapter);
    $showRoute = route('scripture.chapters.show', $routeParameters);
    $fullEditRoute = route('scripture.chapters.admin.full-edit', $routeParameters);
    $storeRoute = route('scripture.chapters.admin.content-blocks.store', $routeParameters);

    $publishedBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published chapter note',
        'body' => 'Visible on the public chapter page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $draftBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft chapter note',
        'body' => 'Still hidden publicly.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'block_type' => 'quote',
            'title' => 'Fresh draft chapter note',
            'body' => 'Created from the chapter full editor.',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newDraftBlock = $chapter->contentBlocks()
        ->where('title', 'Fresh draft chapter note')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.chapters.admin.content-blocks.update', [
            ...$routeParameters,
            'contentBlock' => $draftBlock,
        ]), [
            'block_type' => 'text',
            'title' => 'Updated draft chapter note',
            'body' => 'Still hidden publicly after update.',
            'region' => 'study',
            'sort_order' => 2,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/full-edit')
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Published chapter note')
            ->where('admin_content_blocks.1.title', 'Updated draft chapter note')
            ->where('admin_content_blocks.1.status', 'draft')
            ->where('admin_content_blocks.2.title', 'Fresh draft chapter note')
            ->where('admin_content_blocks.2.block_type', 'quote')
            ->where('admin_content_blocks.2.status', 'draft'),
        );

    $this->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published chapter note'),
        );

    expect($newDraftBlock->status)->toBe('draft');
    expect($publishedBlock->status)->toBe('published');
});

test('content block update hard fails when the block is not owned by the current chapter', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $foreignChapter = Chapter::query()->create([
        'book_section_id' => $this->bookSection->id,
        'slug' => 'foreign-chapter-admin',
        'number' => '100',
        'title' => 'Foreign Chapter Admin',
    ]);

    $foreignBlock = $foreignChapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Other chapter block',
        'body' => 'Not owned by the current chapter.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.admin.content-blocks.update', [
            ...chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
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
        ->toBe('Other chapter block');
});

test('chapter block editing is limited to chapter owned registered note blocks', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $chapter = Chapter::query()->create([
        'book_section_id' => $this->bookSection->id,
        'slug' => 'chapter-note-scope',
        'number' => '101',
        'title' => 'Chapter Note Scope',
    ]);

    $routeParameters = chapterRouteParameters($this->book, $this->bookSection, $chapter);
    $showRoute = route('scripture.chapters.show', $routeParameters);
    $fullEditRoute = route('scripture.chapters.admin.full-edit', $routeParameters);

    $textBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Editable text note',
        'body' => 'This note should stay editable.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $quoteBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'quote',
        'title' => 'Editable quote note',
        'body' => 'This quote should stay editable.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $imageBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'image',
        'title' => 'Editable image note',
        'body' => 'Image caption that should stay editable.',
        'data_json' => [
            'url' => 'https://example.test/chapter-image.jpg',
            'alt' => 'Editable chapter image alt',
        ],
        'sort_order' => 3,
        'status' => 'published',
    ]);

    $videoBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Protected video block',
        'body' => null,
        'data_json' => ['url' => 'https://example.test/chapter-video.mp4'],
        'sort_order' => 4,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.primary_content_block_id', null)
            ->where('admin.primary_content_block_update_href', null)
            ->where(
                "admin.content_block_update_hrefs.{$textBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...$routeParameters,
                    'contentBlock' => $textBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$quoteBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...$routeParameters,
                    'contentBlock' => $quoteBlock,
                ]),
            )
            ->where(
                "admin.content_block_update_hrefs.{$imageBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...$routeParameters,
                    'contentBlock' => $imageBlock,
                ]),
            )
            ->missing("admin.content_block_duplicate_hrefs.{$imageBlock->id}")
            ->missing("admin.content_block_update_hrefs.{$videoBlock->id}"),
        );

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.chapters.admin.content-blocks.update', [
            ...$routeParameters,
            'contentBlock' => $imageBlock,
        ]), [
            'block_type' => 'image',
            'title' => 'Updated image note',
            'body' => 'Updated chapter image caption.',
            'media_url' => 'https://example.test/chapter-image-updated.jpg',
            'alt_text' => 'Updated chapter image alt',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'published',
        ])
        ->assertRedirect($fullEditRoute);

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Editable text note')
            ->where('admin_content_blocks.0.block_type', 'text')
            ->where('admin_content_blocks.1.title', 'Editable quote note')
            ->where('admin_content_blocks.1.block_type', 'quote')
            ->where('admin_content_blocks.2.title', 'Updated image note')
            ->where('admin_content_blocks.2.block_type', 'image')
            ->where('admin_content_blocks.2.data_json.url', 'https://example.test/chapter-image-updated.jpg')
            ->where('admin_content_blocks.2.data_json.alt', 'Updated chapter image alt')
            ->has('protected_content_blocks', 1)
            ->where('protected_content_blocks.0.title', 'Protected video block')
            ->where(
                'protected_content_blocks.0.protection_reason',
                'Only chapter-owned registered note blocks (text, quote, and image) are editable in this phase.',
            )
            ->where('next_content_block_sort_order', 5),
        );

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.admin.content-blocks.update', [
            ...$routeParameters,
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
            'url' => 'https://example.test/chapter-image-updated.jpg',
            'alt' => 'Updated chapter image alt',
        ]);
});

test('chapter note creation accepts contextual insertion points and preserves ordering', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing first note',
        'body' => 'First note body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $anchorBlock = $this->chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Existing second note',
        'body' => 'Second note body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'quote',
            'title' => 'Inserted quote',
            'body' => 'Inserted from the public page flow.',
            'region' => 'study',
            'status' => 'published',
            'insertion_mode' => 'before',
            'relative_block_id' => $anchorBlock->id,
        ])
        ->assertRedirect($this->chapterShowRoute);

    $orderedTitles = $this->chapter->fresh()
        ->contentBlocks()
        ->orderBy('sort_order')
        ->orderBy('id')
        ->pluck('title')
        ->all();
    $orderedSortOrders = $this->chapter->fresh()
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
        $this->chapter->fresh()
            ->contentBlocks()
            ->where('title', 'Inserted quote')
            ->value('block_type'),
    )->toBe('quote');
});

test('authorized editors can create chapter image note blocks from the public page', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->chapterShowRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'image',
            'title' => 'Chapter overview image',
            'body' => 'Public caption for the chapter image.',
            'media_url' => 'https://example.test/chapter-overview-image.jpg',
            'alt_text' => 'Bhagavad Gita Chapter 6 overview illustration',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'start',
        ])
        ->assertRedirect($this->chapterShowRoute);

    $createdBlock = $this->chapter->fresh()
        ->contentBlocks()
        ->where('title', 'Chapter overview image')
        ->firstOrFail();

    expect($createdBlock->block_type)->toBe('image');
    expect($createdBlock->data_json)->toBe([
        'url' => 'https://example.test/chapter-overview-image.jpg',
        'alt' => 'Bhagavad Gita Chapter 6 overview illustration',
    ]);

    $this->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('content_blocks.0.block_type', 'image')
            ->where('content_blocks.0.title', 'Chapter overview image')
            ->where(
                'content_blocks.0.data_json.url',
                'https://example.test/chapter-overview-image.jpg',
            )
            ->where(
                'content_blocks.0.data_json.alt',
                'Bhagavad Gita Chapter 6 overview illustration',
            ),
        );
});

test('authorized editors can manage chapter note blocks from the public page', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $chapter = Chapter::query()->create([
        'book_section_id' => $this->bookSection->id,
        'slug' => 'chapter-public-block-management',
        'number' => '102',
        'title' => 'Chapter Public Block Management',
    ]);

    $routeParameters = chapterRouteParameters($this->book, $this->bookSection, $chapter);
    $showRoute = route('scripture.chapters.show', $routeParameters);

    $firstBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'First published note',
        'body' => 'First body.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $secondBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Second published note',
        'body' => 'Second body.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $thirdBlock = $chapter->contentBlocks()->create([
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
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                "admin.content_block_move_down_hrefs.{$firstBlock->id}",
                route('scripture.chapters.admin.content-blocks.move-down', [
                    ...$routeParameters,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_reorder_hrefs.{$firstBlock->id}",
                route('scripture.chapters.admin.content-blocks.move', [
                    ...$routeParameters,
                    'contentBlock' => $firstBlock,
                ]),
            )
            ->where(
                "admin.content_block_move_up_hrefs.{$secondBlock->id}",
                route('scripture.chapters.admin.content-blocks.move-up', [
                    ...$routeParameters,
                    'contentBlock' => $secondBlock,
                ]),
            )
            ->where(
                "admin.content_block_duplicate_hrefs.{$secondBlock->id}",
                route('scripture.chapters.admin.content-blocks.duplicate', [
                    ...$routeParameters,
                    'contentBlock' => $secondBlock,
                ]),
            )
            ->where(
                "admin.content_block_delete_hrefs.{$thirdBlock->id}",
                route('scripture.chapters.admin.content-blocks.destroy', [
                    ...$routeParameters,
                    'contentBlock' => $thirdBlock,
                ]),
            ),
        );

    $this->actingAs($editor)
        ->from($showRoute)
        ->post(route('scripture.chapters.admin.content-blocks.move', [
            ...$routeParameters,
            'contentBlock' => $firstBlock,
        ]), [
            'relative_block_id' => $secondBlock->id,
            'position' => 'after',
        ])
        ->assertRedirect($showRoute);

    expect(
        $chapter->fresh()
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
        ->from($showRoute)
        ->post(route('scripture.chapters.admin.content-blocks.duplicate', [
            ...$routeParameters,
            'contentBlock' => $secondBlock,
        ]))
        ->assertRedirect($showRoute);

    expect(
        $chapter->fresh()
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
        ->from($showRoute)
        ->delete(route('scripture.chapters.admin.content-blocks.destroy', [
            ...$routeParameters,
            'contentBlock' => $thirdBlock,
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
