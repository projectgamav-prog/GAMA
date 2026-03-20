<?php

use App\Models\Book;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed(BhagavadGitaDevelopmentSeeder::class);

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
        ->where('slug', 'chapter-2-main')
        ->firstOrFail();
});

test('reader renders grouped and ungrouped verses as backend-prepared cards', function () {
    $verseFortySeven = $this->chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $verseFortyEight = $this->chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $verseFortyNine = $this->chapterSection->verses()->create([
        'slug' => 'verse-49',
        'number' => '49',
        'text' => 'Reader test verse 49.',
        'sort_order' => 3,
    ]);

    $verseFifty = $this->chapterSection->verses()->create([
        'slug' => 'verse-50',
        'number' => '50',
        'text' => 'Reader test verse 50.',
        'sort_order' => 4,
    ]);

    $verseFiftyOne = $this->chapterSection->verses()->create([
        'slug' => 'verse-51',
        'number' => '51',
        'text' => 'Reader test verse 51.',
        'sort_order' => 5,
    ]);

    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Opening group',
    ]);

    $firstGroup->items()->create(['verse_id' => $verseFortySeven->id]);
    $firstGroup->items()->create(['verse_id' => $verseFortyEight->id]);

    $secondGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Closing group',
    ]);

    $secondGroup->items()->create(['verse_id' => $verseFifty->id]);
    $secondGroup->items()->create(['verse_id' => $verseFiftyOne->id]);

    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->has('chapter_sections.0.cards', 3)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.label', 'Verses 47-48')
            ->has('chapter_sections.0.cards.0.verses', 2)
            ->where('chapter_sections.0.cards.0.verses.0.number', '47')
            ->where('chapter_sections.0.cards.0.verses.1.number', '48')
            ->where('chapter_sections.0.cards.1.type', 'single')
            ->where('chapter_sections.0.cards.1.label', 'Verse 49')
            ->has('chapter_sections.0.cards.1.verses', 1)
            ->where('chapter_sections.0.cards.1.verses.0.number', '49')
            ->where('chapter_sections.0.cards.2.type', 'group')
            ->where('chapter_sections.0.cards.2.label', 'Verses 50-51')
            ->has('chapter_sections.0.cards.2.verses', 2)
            ->where('chapter_sections.0.cards.2.verses.0.number', '50')
            ->where('chapter_sections.0.cards.2.verses.1.number', '51'),
        );
});

test('one malformed group falls back to single cards without breaking other valid groups', function () {
    $verseFortySeven = $this->chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $verseFortyEight = $this->chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $verseFortyNine = $this->chapterSection->verses()->create([
        'slug' => 'verse-49',
        'number' => '49',
        'text' => 'Reader test verse 49.',
        'sort_order' => 3,
    ]);

    $verseFifty = $this->chapterSection->verses()->create([
        'slug' => 'verse-50',
        'number' => '50',
        'text' => 'Reader test verse 50.',
        'sort_order' => 4,
    ]);

    $verseFiftyOne = $this->chapterSection->verses()->create([
        'slug' => 'verse-51',
        'number' => '51',
        'text' => 'Reader test verse 51.',
        'sort_order' => 5,
    ]);

    $validGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Valid group',
    ]);

    $validGroup->items()->create(['verse_id' => $verseFortySeven->id]);
    $validGroup->items()->create(['verse_id' => $verseFortyEight->id]);

    $invalidGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Invalid non-contiguous group',
    ]);

    $invalidGroup->items()->create(['verse_id' => $verseFortyNine->id]);
    $invalidGroup->items()->create(['verse_id' => $verseFiftyOne->id]);

    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->has('chapter_sections.0.cards', 4)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.verses.0.number', '47')
            ->where('chapter_sections.0.cards.0.verses.1.number', '48')
            ->where('chapter_sections.0.cards.1.type', 'single')
            ->where('chapter_sections.0.cards.1.verses.0.number', '49')
            ->where('chapter_sections.0.cards.2.type', 'single')
            ->where('chapter_sections.0.cards.2.verses.0.number', '50')
            ->where('chapter_sections.0.cards.3.type', 'single')
            ->where('chapter_sections.0.cards.3.verses.0.number', '51'),
        );
});

test('reader builds cards independently for each chapter section', function () {
    $verseFortySeven = $this->chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $verseFortyEight = $this->chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'First section group',
    ]);

    $firstGroup->items()->create(['verse_id' => $verseFortySeven->id]);
    $firstGroup->items()->create(['verse_id' => $verseFortyEight->id]);

    $secondSection = $this->chapter->chapterSections()->create([
        'slug' => 'chapter-2-second',
        'number' => '2',
        'title' => 'Second Passage',
        'sort_order' => 2,
    ]);

    $verseFiftyTwo = $secondSection->verses()->create([
        'slug' => 'verse-52',
        'number' => '52',
        'text' => 'Reader test verse 52.',
        'sort_order' => 1,
    ]);

    $verseFiftyThree = $secondSection->verses()->create([
        'slug' => 'verse-53',
        'number' => '53',
        'text' => 'Reader test verse 53.',
        'sort_order' => 2,
    ]);

    $secondGroup = $secondSection->verseCardGroups()->create([
        'title' => 'Second section group',
    ]);

    $secondGroup->items()->create(['verse_id' => $verseFiftyTwo->id]);
    $secondGroup->items()->create(['verse_id' => $verseFiftyThree->id]);

    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->has('chapter_sections', 2)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.label', 'Verses 47-48')
            ->where('chapter_sections.1.cards.0.type', 'group')
            ->where('chapter_sections.1.cards.0.label', 'Verses 52-53'),
        );
});

test('reader includes a video link only for verses with published video blocks', function () {
    $verseFortyEight = $this->chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $verseFortyEight->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Verse video',
        'body' => 'A short study video.',
        'data_json' => [
            'url' => 'https://example.test/assets/verse-48.mp4',
        ],
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $verseFortyEight->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Draft video',
        'body' => 'Should not count.',
        'data_json' => [
            'url' => 'https://example.test/assets/draft-verse-48.mp4',
        ],
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('chapter_sections.0.cards.0.verses.0.video_href', null)
            ->where(
                'chapter_sections.0.cards.1.verses.0.video_href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $verseFortyEight,
                ]).'#published-notes',
            ),
        );
});
