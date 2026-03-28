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

    $this->chapter = $this->bookSection->chapters()->create([
        'slug' => 'reader-test-chapter',
        'number' => '99',
        'title' => 'Reader Test Chapter',
    ]);

    $this->chapterSection = $this->chapter->chapterSections()->create([
        'slug' => 'reader-test-main',
        'number' => '1',
        'title' => 'Reader Test Main',
    ]);

    $this->firstVerse = $this->chapterSection->verses()->create([
        'slug' => 'verse-1',
        'number' => '1',
        'text' => 'Reader test verse 1.',
    ]);

    $this->secondVerse = $this->chapterSection->verses()->create([
        'slug' => 'verse-2',
        'number' => '2',
        'text' => 'Reader test verse 2.',
    ]);

    foreach ([$this->firstVerse, $this->secondVerse] as $index => $verse) {
        $verse->translations()->create([
            'source_key' => 'reader-test-en',
            'source_name' => 'Reader Test English',
            'language_code' => 'en',
            'text' => 'Reader English translation '.($index + 1).'.',
            'sort_order' => 1,
        ]);

        $verse->translations()->create([
            'source_key' => 'reader-test-hi',
            'source_name' => 'Reader Test Hindi',
            'language_code' => 'hi',
            'text' => 'Reader Hindi translation '.($index + 1).'.',
            'sort_order' => 2,
        ]);
    }
});

test('reader renders grouped and ungrouped verses as backend-prepared cards', function () {
    $verseThree = $this->chapterSection->verses()->create([
        'slug' => 'verse-3',
        'number' => '3',
        'text' => 'Reader test verse 3.',
    ]);

    $verseFour = $this->chapterSection->verses()->create([
        'slug' => 'verse-4',
        'number' => '4',
        'text' => 'Reader test verse 4.',
    ]);

    $verseFive = $this->chapterSection->verses()->create([
        'slug' => 'verse-5',
        'number' => '5',
        'text' => 'Reader test verse 5.',
    ]);

    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Opening group',
    ]);

    $firstGroup->items()->create(['verse_id' => $this->firstVerse->id]);
    $firstGroup->items()->create(['verse_id' => $this->secondVerse->id]);

    $secondGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Closing group',
    ]);

    $secondGroup->items()->create(['verse_id' => $verseFour->id]);
    $secondGroup->items()->create(['verse_id' => $verseFive->id]);

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->has('chapter_sections.0.cards', 3)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.label', 'Verses 1-2')
            ->has('chapter_sections.0.cards.0.verses', 2)
            ->where('chapter_sections.0.cards.0.verses.0.number', '1')
            ->where('chapter_sections.0.cards.0.verses.1.number', '2')
            ->where('chapter_sections.0.cards.1.type', 'single')
            ->where('chapter_sections.0.cards.1.label', 'Verse 3')
            ->has('chapter_sections.0.cards.1.verses', 1)
            ->where('chapter_sections.0.cards.1.verses.0.number', '3')
            ->where('chapter_sections.0.cards.2.type', 'group')
            ->where('chapter_sections.0.cards.2.label', 'Verses 4-5')
            ->has('chapter_sections.0.cards.2.verses', 2)
            ->where('chapter_sections.0.cards.2.verses.0.number', '4')
            ->where('chapter_sections.0.cards.2.verses.1.number', '5'),
        );
});

test('one malformed group falls back to single cards without breaking other valid groups', function () {
    $verseThree = $this->chapterSection->verses()->create([
        'slug' => 'verse-3',
        'number' => '3',
        'text' => 'Reader test verse 3.',
    ]);

    $verseFour = $this->chapterSection->verses()->create([
        'slug' => 'verse-4',
        'number' => '4',
        'text' => 'Reader test verse 4.',
    ]);

    $verseFive = $this->chapterSection->verses()->create([
        'slug' => 'verse-5',
        'number' => '5',
        'text' => 'Reader test verse 5.',
    ]);

    $validGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Valid group',
    ]);

    $validGroup->items()->create(['verse_id' => $this->firstVerse->id]);
    $validGroup->items()->create(['verse_id' => $this->secondVerse->id]);

    $invalidGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Invalid non-contiguous group',
    ]);

    $invalidGroup->items()->create(['verse_id' => $verseThree->id]);
    $invalidGroup->items()->create(['verse_id' => $verseFive->id]);

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->has('chapter_sections.0.cards', 4)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.verses.0.number', '1')
            ->where('chapter_sections.0.cards.0.verses.1.number', '2')
            ->where('chapter_sections.0.cards.1.type', 'single')
            ->where('chapter_sections.0.cards.1.verses.0.number', '3')
            ->where('chapter_sections.0.cards.2.type', 'single')
            ->where('chapter_sections.0.cards.2.verses.0.number', '4')
            ->where('chapter_sections.0.cards.3.type', 'single')
            ->where('chapter_sections.0.cards.3.verses.0.number', '5'),
        );
});

test('reader builds cards independently for each chapter section', function () {
    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'First section group',
    ]);

    $firstGroup->items()->create(['verse_id' => $this->firstVerse->id]);
    $firstGroup->items()->create(['verse_id' => $this->secondVerse->id]);

    $secondSection = $this->chapter->chapterSections()->create([
        'slug' => 'chapter-2-second',
        'number' => '2',
        'title' => 'Second Passage',
    ]);

    $verseSix = $secondSection->verses()->create([
        'slug' => 'verse-6',
        'number' => '6',
        'text' => 'Reader test verse 6.',
    ]);

    $verseSeven = $secondSection->verses()->create([
        'slug' => 'verse-7',
        'number' => '7',
        'text' => 'Reader test verse 7.',
    ]);

    $secondGroup = $secondSection->verseCardGroups()->create([
        'title' => 'Second section group',
    ]);

    $secondGroup->items()->create(['verse_id' => $verseSix->id]);
    $secondGroup->items()->create(['verse_id' => $verseSeven->id]);

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->has('chapter_sections', 2)
            ->where('chapter_sections.0.cards.0.type', 'group')
            ->where('chapter_sections.0.cards.0.label', 'Verses 1-2')
            ->where('chapter_sections.1.cards.0.type', 'group')
            ->where('chapter_sections.1.cards.0.label', 'Verses 6-7'),
        );
});

test('reader includes a video link only for verses with published video blocks', function () {
    $this->secondVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Verse video',
        'body' => 'A short study video.',
        'data_json' => [
            'url' => 'https://example.test/assets/verse-2.mp4',
        ],
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->secondVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Draft video',
        'body' => 'Should not count.',
        'data_json' => [
            'url' => 'https://example.test/assets/draft-verse-2.mp4',
        ],
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('chapter_sections.0.cards.0.verses.0.video_href', null)
            ->where(
                'chapter_sections.0.cards.1.verses.0.video_href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->secondVerse,
                ]).'#published-notes',
            ),
        );
});

test('reader exposes only languages available in the current chapter', function () {
    $this->chapterSection->verses->each(function ($verse): void {
        $verse->translations()
            ->where('language_code', 'hi')
            ->delete();
    });

    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->has('reader_languages', 1)
            ->where('reader_languages.0', 'en')
            ->where('default_language', 'en'),
        );
});
