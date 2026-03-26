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

    $this->chapterShowRoute = route(
        'scripture.chapters.show',
        chapterRouteParameters($this->book, $this->bookSection, $this->chapter),
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
        ->get($this->chapterShowRoute)
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
        ->post($this->contentBlockStoreRoute, [
            'title' => 'Blocked chapter note',
            'body' => 'This should not be created.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertForbidden();
});

test('authorized editors can toggle protected admin visibility and receive chapter admin props', function () {
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

    $this->actingAs($editor)
        ->get($this->chapterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin', null),
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
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
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

test('phase one chapter block editing is limited to chapter owned text notes', function () {
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

    $videoBlock = $chapter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Protected video block',
        'body' => null,
        'data_json' => ['url' => 'https://example.test/chapter-video.mp4'],
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin.primary_content_block_id', $textBlock->id)
            ->where(
                "admin.content_block_update_hrefs.{$textBlock->id}",
                route('scripture.chapters.admin.content-blocks.update', [
                    ...$routeParameters,
                    'contentBlock' => $textBlock,
                ]),
            )
            ->missing("admin.content_block_update_hrefs.{$videoBlock->id}"),
        );

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('admin_content_blocks', 1)
            ->where('admin_content_blocks.0.title', 'Editable text note')
            ->where('admin_content_blocks.0.block_type', 'text')
            ->where('next_content_block_sort_order', 3),
        );

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.admin.content-blocks.update', [
            ...$routeParameters,
            'contentBlock' => $videoBlock,
        ]), [
            'title' => 'Should stay protected',
            'body' => 'No update should be allowed.',
            'region' => 'study',
            'sort_order' => 2,
            'status' => 'published',
        ])
        ->assertNotFound();

    expect(ContentBlock::query()->findOrFail($videoBlock->id)->title)
        ->toBe('Protected video block');
});
