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
    $this->fullEditRoute = route(
        'scripture.chapters.verses.admin.full-edit',
        $this->verseRouteParameters,
    );
    $this->contentBlockStoreRoute = route(
        'scripture.chapters.verses.admin.content-blocks.store',
        $this->verseRouteParameters,
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected verse admin context', function () {
    $this->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('admin', null),
        );

    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('admin', null),
        );

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
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
            ->where('admin', null),
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
            ->where('verse_meta.summary_short', 'Study notes visible in admin mode.')
            ->where('admin.meta_update_href', $this->metaUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
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
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Published verse note')
            ->where('admin_content_blocks.1.title', 'Updated draft verse note')
            ->where('admin_content_blocks.1.status', 'draft')
            ->where('admin_content_blocks.2.title', 'Fresh draft note')
            ->where('admin_content_blocks.2.status', 'draft'),
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
