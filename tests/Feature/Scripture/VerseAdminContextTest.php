<?php

use App\Models\Book;
use App\Models\CommentarySource;
use App\Models\ContentBlock;
use App\Models\TranslationSource;
use App\Models\User;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
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
    $this->translationStoreRoute = route(
        'scripture.chapters.verses.admin.translations.store',
        $this->verseRouteParameters,
    );
    $this->commentaryStoreRoute = route(
        'scripture.chapters.verses.admin.commentaries.store',
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
    $translationSource = TranslationSource::query()->create([
        'slug' => 'gita-press',
        'name' => 'Gita Press',
        'language_code' => 'en',
        'sort_order' => 1,
        'is_published' => true,
    ]);
    $commentarySource = CommentarySource::query()->create([
        'slug' => 'sridhara',
        'name' => 'Sridhara',
        'author_name' => 'Sridhara Swami',
        'language_code' => 'en',
        'sort_order' => 1,
        'is_published' => true,
    ]);

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
    $translation = $this->firstVerse->translations()->create([
        'source_key' => 'gita-press',
        'source_name' => 'Gita Press',
        'translation_source_id' => $translationSource->id,
        'language_code' => 'en',
        'text' => 'Translation row shown through verse admin.',
        'sort_order' => 1,
    ]);
    $commentary = $this->firstVerse->commentaries()->create([
        'source_key' => 'sridhara',
        'source_name' => 'Sridhara',
        'commentary_source_id' => $commentarySource->id,
        'author_name' => 'Sridhara Swami',
        'language_code' => 'en',
        'title' => 'Opening note',
        'body' => 'Commentary row shown through verse admin.',
        'sort_order' => 1,
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
            ->where('admin.translations.store_href', $this->translationStoreRoute)
            ->where('admin.translations.next_sort_order', 3)
            ->where('admin.translations.rows', fn ($rows): bool => collect($rows)->contains(
                fn (array $row): bool => $row['id'] === $translation->id
                    && $row['translation_source_id'] === $translationSource->id
                    && $row['update_href'] === route(
                        'scripture.chapters.verses.admin.translations.update',
                        [...$this->verseRouteParameters, 'translation' => $translation],
                    ),
            ))
            ->where('admin.translations.sources.0.id', $translationSource->id)
            ->where('admin.translations.sources.0.slug', 'gita-press')
            ->where('admin.commentaries.store_href', $this->commentaryStoreRoute)
            ->where('admin.commentaries.next_sort_order', 2)
            ->where('admin.commentaries.rows', fn ($rows): bool => collect($rows)->contains(
                fn (array $row): bool => $row['id'] === $commentary->id
                    && $row['commentary_source_id'] === $commentarySource->id
                    && $row['update_href'] === route(
                        'scripture.chapters.verses.admin.commentaries.update',
                        [...$this->verseRouteParameters, 'commentary' => $commentary],
                    ),
            ))
            ->where('admin.commentaries.sources.0.id', $commentarySource->id)
            ->where('admin.commentaries.sources.0.slug', 'sridhara')
            ->where(
                'cms_regions.0.key',
                "scripture-verse-{$this->firstVerse->id}-supplementary",
            )
            ->where(
                'cms_regions.0.admin.return_to',
                route('scripture.chapters.verses.show', $this->verseRouteParameters, false),
            )
            ->where(
                'cms_regions.0.admin.bootstrap_store_href',
                route('cms.exposed-regions.containers.store', [
                    'regionKey' => "scripture-verse-{$this->firstVerse->id}-supplementary",
                ], false),
            )
            ->where('cms_regions.0.admin.page', null),
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

test('authorized editors can manage verse translations through verse relation admin routes', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();
    $translationSource = TranslationSource::query()->create([
        'slug' => 'gambhirananda',
        'name' => 'Swami Gambhirananda',
        'author_name' => 'Swami Gambhirananda',
        'language_code' => 'en',
        'sort_order' => 1,
        'is_published' => true,
    ]);

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->post($this->translationStoreRoute, [
            'source_key' => 'gambhirananda',
            'source_name' => 'Swami Gambhirananda',
            'translation_source_id' => $translationSource->id,
            'language_code' => 'en',
            'text' => 'First admin-managed translation row.',
            'sort_order' => 1,
        ])
        ->assertRedirect($this->fullEditRoute);

    $translation = $this->firstVerse->fresh()
        ->translations()
        ->where('source_key', 'gambhirananda')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->patch(route('scripture.chapters.verses.admin.translations.update', [
            ...$this->verseRouteParameters,
            'translation' => $translation,
        ]), [
            'source_key' => 'gambhirananda',
            'source_name' => 'Swami Gambhirananda',
            'translation_source_id' => $translationSource->id,
            'language_code' => 'en',
            'text' => 'Updated admin-managed translation row.',
            'sort_order' => 2,
        ])
        ->assertRedirect($this->fullEditRoute);

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin_translations.store_href', $this->translationStoreRoute)
            ->where('admin_translations.next_sort_order', 3)
            ->where('admin_translations.rows', fn ($rows): bool => collect($rows)->contains(
                fn (array $row): bool => $row['id'] === $translation->id
                    && $row['translation_source_id'] === $translationSource->id
                    && $row['text'] === 'Updated admin-managed translation row.'
                    && $row['sort_order'] === 2,
            ))
            ->where('admin_translations.sources.0.slug', 'gambhirananda')
            ->where('admin_translations.fields.source_key.key', 'translation_source_key')
            ->where('admin_translations.fields.source_name.key', 'translation_source_name')
            ->where('admin_translations.fields.translation_source_id.key', 'translation_source_id')
            ->where('admin_translations.fields.language_code.key', 'translation_language_code')
            ->where('admin_translations.fields.text.key', 'translation_text')
            ->where('admin_translations.fields.sort_order.key', 'translation_sort_order'),
        );

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->delete(route('scripture.chapters.verses.admin.translations.destroy', [
            ...$this->verseRouteParameters,
            'translation' => $translation,
        ]))
        ->assertRedirect($this->fullEditRoute);

    expect(VerseTranslation::query()->find($translation->id))->toBeNull();
});

test('authorized editors can manage verse commentaries through verse relation admin routes', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();
    $commentarySource = CommentarySource::query()->create([
        'slug' => 'madhusudana',
        'name' => 'Madhusudana Sarasvati',
        'author_name' => 'Madhusudana Sarasvati',
        'language_code' => 'en',
        'sort_order' => 1,
        'is_published' => true,
    ]);

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->post($this->commentaryStoreRoute, [
            'source_key' => 'madhusudana',
            'source_name' => 'Madhusudana Sarasvati',
            'commentary_source_id' => $commentarySource->id,
            'author_name' => 'Madhusudana Sarasvati',
            'language_code' => 'en',
            'title' => 'Context note',
            'body' => 'First admin-managed commentary row.',
            'sort_order' => 1,
        ])
        ->assertRedirect($this->fullEditRoute);

    $commentary = $this->firstVerse->fresh()
        ->commentaries()
        ->where('source_key', 'madhusudana')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->patch(route('scripture.chapters.verses.admin.commentaries.update', [
            ...$this->verseRouteParameters,
            'commentary' => $commentary,
        ]), [
            'source_key' => 'madhusudana',
            'source_name' => 'Madhusudana Sarasvati',
            'commentary_source_id' => $commentarySource->id,
            'author_name' => 'Updated commentator',
            'language_code' => 'en',
            'title' => 'Updated context note',
            'body' => 'Updated admin-managed commentary row.',
            'sort_order' => 2,
        ])
        ->assertRedirect($this->fullEditRoute);

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('admin_commentaries.store_href', $this->commentaryStoreRoute)
            ->where('admin_commentaries.next_sort_order', 3)
            ->where('admin_commentaries.rows', fn ($rows): bool => collect($rows)->contains(
                fn (array $row): bool => $row['id'] === $commentary->id
                    && $row['commentary_source_id'] === $commentarySource->id
                    && $row['author_name'] === 'Updated commentator'
                    && $row['title'] === 'Updated context note'
                    && $row['body'] === 'Updated admin-managed commentary row.'
                    && $row['sort_order'] === 2,
            ))
            ->where('admin_commentaries.sources.0.slug', 'madhusudana')
            ->where('admin_commentaries.fields.source_key.key', 'commentary_source_key')
            ->where('admin_commentaries.fields.source_name.key', 'commentary_source_name')
            ->where('admin_commentaries.fields.commentary_source_id.key', 'commentary_source_id')
            ->where('admin_commentaries.fields.author_name.key', 'commentary_author_name')
            ->where('admin_commentaries.fields.language_code.key', 'commentary_language_code')
            ->where('admin_commentaries.fields.title.key', 'commentary_title')
            ->where('admin_commentaries.fields.body.key', 'commentary_body')
            ->where('admin_commentaries.fields.sort_order.key', 'commentary_sort_order'),
        );

    $this->actingAs($editor)
        ->from($this->fullEditRoute)
        ->delete(route('scripture.chapters.verses.admin.commentaries.destroy', [
            ...$this->verseRouteParameters,
            'commentary' => $commentary,
        ]))
        ->assertRedirect($this->fullEditRoute);

    expect(VerseCommentary::query()->find($commentary->id))->toBeNull();
});

test('translation and commentary updates hard fail when the rows are not owned by the current verse', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $foreignTranslation = $this->secondVerse->translations()->create([
        'source_key' => 'foreign-translation',
        'source_name' => 'Foreign Translation',
        'language_code' => 'en',
        'text' => 'Not owned by the current verse.',
        'sort_order' => 1,
    ]);
    $foreignCommentary = $this->secondVerse->commentaries()->create([
        'source_key' => 'foreign-commentary',
        'source_name' => 'Foreign Commentary',
        'author_name' => 'Other Author',
        'language_code' => 'en',
        'title' => 'Foreign note',
        'body' => 'Not owned by the current verse.',
        'sort_order' => 1,
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.verses.admin.translations.update', [
            ...$this->verseRouteParameters,
            'translation' => $foreignTranslation,
        ]), [
            'source_key' => 'foreign-translation',
            'source_name' => 'Foreign Translation',
            'language_code' => 'en',
            'text' => 'Should not update.',
            'sort_order' => 1,
        ])
        ->assertNotFound();

    $this->actingAs($editor)
        ->patch(route('scripture.chapters.verses.admin.commentaries.update', [
            ...$this->verseRouteParameters,
            'commentary' => $foreignCommentary,
        ]), [
            'source_key' => 'foreign-commentary',
            'source_name' => 'Foreign Commentary',
            'author_name' => 'Other Author',
            'language_code' => 'en',
            'title' => 'Should stay protected',
            'body' => 'Should not update.',
            'sort_order' => 1,
        ])
        ->assertNotFound();

    expect(VerseTranslation::query()->findOrFail($foreignTranslation->id)->text)
        ->toBe('Not owned by the current verse.');
    expect(VerseCommentary::query()->findOrFail($foreignCommentary->id)->title)
        ->toBe('Foreign note');
});

test('authorized editors can manage verse intro blocks separately from verse identity and notes', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->verseShowRoute)
        ->post($this->contentBlockStoreRoute, [
            'block_type' => 'image',
            'title' => 'Verse intro image',
            'body' => 'Intro caption shown above the canonical verse text.',
            'media_url' => 'https://example.test/verse-intro-image.jpg',
            'alt_text' => 'Verse intro illustration',
            'region' => 'overview',
            'status' => 'published',
            'insertion_mode' => 'start',
        ])
        ->assertRedirect($this->verseShowRoute);

    $introBlock = $this->firstVerse->fresh()
        ->contentBlocks()
        ->where('title', 'Verse intro image')
        ->firstOrFail();

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->verseShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('verse.intro_block.id', $introBlock->id)
            ->where('verse.intro_block.block_type', 'image')
            ->where(
                'verse.intro_block.data_json.url',
                'https://example.test/verse-intro-image.jpg',
            )
            ->where(
                'verse.intro_block.data_json.alt',
                'Verse intro illustration',
            )
            ->missing('content_blocks')
            ->where('admin.intro_store_href', $this->contentBlockStoreRoute)
            ->where('admin.primary_intro_block.id', $introBlock->id)
            ->where(
                'admin.primary_intro_update_href',
                route('scripture.chapters.verses.admin.content-blocks.update', [
                    ...$this->verseRouteParameters,
                    'contentBlock' => $introBlock,
                ]),
            )
            ->where('admin.intro_block_types', ['text', 'quote', 'image'])
            ->where('admin.intro_default_region', 'overview'),
        );
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

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
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
            ->missing('content_blocks'),
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

test('full edit keeps verse note block editing limited to verse owned registered note blocks', function () {
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
                'Only verse-owned registered intro and note blocks (text, quote, and image) are editable in this phase.',
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
