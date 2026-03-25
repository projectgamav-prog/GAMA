<?php

use App\Models\Book;
use App\Models\Character;
use App\Models\DictionaryEntry;
use App\Models\Topic;
use App\Support\Scripture\ScriptureJsonImporter;
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
        ->inCanonicalOrder()
        ->firstOrFail();

    $sectionVerses = $this->chapterSection->verses()
        ->inCanonicalOrder()
        ->get()
        ->values();

    $this->firstVerse = $sectionVerses[0];
    $this->secondVerse = $sectionVerses[1];
    $this->penultimateVerse = $sectionVerses[$sectionVerses->count() - 2];
    $this->lastVerse = $sectionVerses[$sectionVerses->count() - 1];
});

test('books page lists available public scripture books', function () {
    app(ScriptureJsonImporter::class)->import('ramcharitmanas');
    $ramcharitmanas = Book::query()
        ->where('slug', 'ramcharitmanas')
        ->firstOrFail();

    $this->book->update(['number' => '2']);
    $ramcharitmanas->update(['number' => '1']);

    $response = $this->get(route('scripture.books.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/index')
            ->has('books', 2)
            ->where('books.0.slug', 'ramcharitmanas')
            ->where('books.0.number', '1')
            ->where('books.0.overview_href', route('scripture.books.overview', $ramcharitmanas))
            ->where('books.0.overview_video', null)
            ->where('books.0.href', route('scripture.books.show', $ramcharitmanas))
            ->where('books.1.slug', 'bhagavad-gita')
            ->where('books.1.number', '2')
            ->where('books.1.overview_href', route('scripture.books.overview', $this->book))
            ->where('books.1.overview_video.block_type', 'video')
            ->where('books.1.overview_video.title', 'Bhagavad Gita Overview')
            ->where(
                'books.1.overview_video.data_json.url',
                'https://example.test/assets/bhagavad-gita-overview.mp4',
            )
            ->where(
                'books.1.href',
                route('scripture.books.show', $this->book),
            ),
        );
});

test('book overview page renders published editorial content separately from canonical browse', function () {
    $response = $this->get(route('scripture.books.overview', $this->book));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/overview')
            ->where('book.number', '1')
            ->where('book.title', 'Bhagavad Gita')
            ->where('book.href', route('scripture.books.show', $this->book))
            ->where('book.overview_href', route('scripture.books.overview', $this->book))
            ->has('content_blocks', 3)
            ->where('content_blocks.0.region', 'overview')
            ->where('content_blocks.0.block_type', 'text')
            ->where('content_blocks.1.block_type', 'quote')
            ->where('content_blocks.2.block_type', 'video'),
        );
});

test('book page is displayed for scripture browsing', function () {
    $response = $this->get(route('scripture.books.show', $this->book));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.number', '1')
            ->where('book.title', 'Bhagavad Gita')
            ->has('content_blocks', 3)
            ->has('book_sections', 1)
            ->where(
                'book_sections.0.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->has('book_sections.0.chapters', $this->bookSection->chapters()->count()),
        );
});

test('chapter page is displayed and supports zero published content blocks', function () {
    $response = $this->get(route('scripture.chapters.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('chapter.title', $this->chapter->title)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('content_blocks', [])
            ->has('chapter_sections', $this->chapter->chapterSections()->count())
            ->where('chapter_sections.0.verses_count', $this->chapterSection->verses()->count()),
        );
});

test('chapter verse reader page is displayed in canonical order', function () {
    $response = $this->get(route('scripture.chapters.verses.index', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('chapter.number', $this->chapter->number)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('default_language', 'en')
            ->where('reader_languages.0', 'en')
            ->where('reader_languages.1', 'hi')
            ->has('chapter_sections', $this->chapter->chapterSections()->count())
            ->where('chapter_sections.0.slug', $this->chapterSection->slug)
            ->where('chapter_sections.0.cards.0.type', 'single')
            ->where('chapter_sections.0.cards.0.verses.0.number', $this->firstVerse->number)
            ->where(
                'chapter_sections.0.cards.0.verses.0.explanation_href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->firstVerse,
                ]),
            )
            ->where('chapter_sections.0.cards.1.verses.0.number', $this->secondVerse->number),
        );
});

test('verse detail page is displayed with translations commentaries and published verse blocks', function () {
    $dictionaryEntry = DictionaryEntry::query()->create([
        'slug' => 'kuru-descendant',
        'headword' => 'Kuru descendant',
        'transliteration' => 'kuru-vamsa',
        'entry_type' => 'term',
        'short_meaning' => 'A descendant of the Kuru line.',
        'notes' => 'A development dictionary entry for verse navigation.',
        'is_published' => true,
    ]);

    $topic = Topic::query()
        ->where('slug', 'dharma')
        ->firstOrFail();

    $character = Character::query()
        ->where('slug', 'arjuna')
        ->firstOrFail();

    $this->firstVerse->dictionaryAssignments()->create([
        'dictionary_entry_id' => $dictionaryEntry->id,
        'matched_text' => 'kuru',
        'matched_normalized_text' => 'kuru',
        'match_type' => 'exact',
        'language_code' => 'sa',
        'sort_order' => 1,
        'meta_json' => null,
    ]);

    $this->firstVerse->topicAssignments()->create([
        'topic_id' => $topic->id,
        'weight' => 0.800,
        'sort_order' => 1,
        'notes' => 'A development topic attached to the verse detail page.',
    ]);

    $this->firstVerse->characterAssignments()->create([
        'character_id' => $character->id,
        'weight' => 0.900,
        'sort_order' => 1,
        'notes' => 'A development character attached to the verse detail page.',
    ]);

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published verse note',
        'body' => 'A published note attached directly to the verse.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $this->firstVerse->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft verse note',
        'body' => 'This should stay hidden on the public page.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $response = $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->firstVerse,
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('verse.number', $this->firstVerse->number)
            ->where(
                'book_section.href',
                route('scripture.books.show', $this->book).'#section-main',
            )
            ->where('chapter_section.slug', $this->chapterSection->slug)
            ->where('previous_verse', null)
            ->where('next_verse.number', $this->secondVerse->number)
            ->has('translations', 2)
            ->where('translations.0.language_code', 'en')
            ->where('translations.1.language_code', 'hi')
            ->has('commentaries', 1)
            ->where('commentaries.0.title', 'Action without attachment')
            ->has('dictionary_terms', 1)
            ->where('dictionary_terms.0.dictionary_entry.slug', 'kuru-descendant')
            ->where(
                'dictionary_terms.0.dictionary_entry.href',
                route('scripture.dictionary.show', $dictionaryEntry),
            )
            ->has('topics', 1)
            ->where('topics.0.topic.slug', 'dharma')
            ->where('topics.0.topic.href', route('scripture.topics.show', $topic))
            ->has('characters', 1)
            ->where('characters.0.character.slug', 'arjuna')
            ->where(
                'characters.0.character.href',
                route('scripture.characters.show', $character),
            )
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published verse note'),
        );
});

test('published dictionary entry page renders entry details and unique related verses', function () {
    $rootEntry = DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => 'dharma-root',
        'transliteration' => 'dharma',
        'entry_type' => 'root',
        'short_meaning' => 'dharma',
        'notes' => 'The root sense of duty and law.',
        'is_published' => true,
    ]);

    $entry = DictionaryEntry::query()->create([
        'slug' => 'svadharma',
        'headword' => 'svadharma',
        'transliteration' => 'svadharma',
        'entry_type' => 'term',
        'root_entry_id' => $rootEntry->id,
        'root_headword' => 'legacy root text',
        'short_meaning' => "one's own duty",
        'notes' => "Used for the duty aligned with one's place and nature.",
        'is_published' => true,
    ]);

    $entry->verseAssignments()->create([
        'verse_id' => $this->firstVerse->id,
        'matched_text' => 'svadharma',
        'matched_normalized_text' => 'svadharma',
        'match_type' => 'exact',
        'language_code' => 'sa',
        'sort_order' => 1,
        'meta_json' => null,
    ]);

    $entry->verseAssignments()->create([
        'verse_id' => $this->firstVerse->id,
        'matched_text' => 'sva dharma',
        'matched_normalized_text' => 'sva dharma',
        'match_type' => 'variant',
        'language_code' => 'sa',
        'sort_order' => 2,
        'meta_json' => null,
    ]);

    $entry->verseAssignments()->create([
        'verse_id' => $this->secondVerse->id,
        'matched_text' => 'svadharmah',
        'matched_normalized_text' => 'svadharmah',
        'match_type' => 'variant',
        'language_code' => 'sa',
        'sort_order' => 3,
        'meta_json' => null,
    ]);

    $response = $this->get(route('scripture.dictionary.show', $entry));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/dictionary/show')
            ->where('dictionary_entry.slug', 'svadharma')
            ->where('dictionary_entry.headword', 'svadharma')
            ->where('dictionary_entry.transliteration', 'svadharma')
            ->where('dictionary_entry.root_headword', 'dharma-root')
            ->where('dictionary_entry.meaning', "one's own duty")
            ->where(
                'dictionary_entry.explanation',
                "Used for the duty aligned with one's place and nature.",
            )
            ->where('dictionary_entry.entry_type', 'term')
            ->where('dictionary_entry.href', route('scripture.dictionary.show', $entry))
            ->has('related_verses', 2)
            ->where('related_verses.0.id', $this->firstVerse->id)
            ->where('related_verses.0.slug', $this->firstVerse->slug)
            ->where('related_verses.0.number', $this->firstVerse->number)
            ->where('related_verses.0.book_slug', $this->book->slug)
            ->where('related_verses.0.chapter_slug', $this->chapter->slug)
            ->where('related_verses.0.chapter_number', $this->chapter->number)
            ->where(
                'related_verses.0.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->firstVerse,
                ]),
            )
            ->where('related_verses.1.id', $this->secondVerse->id),
        );
});

test('dictionary index page lists published entries in dictionary order', function () {
    $rootEntry = DictionaryEntry::query()->create([
        'slug' => 'dharma-root',
        'headword' => 'dharma-root',
        'transliteration' => 'dharma',
        'entry_type' => 'root',
        'short_meaning' => 'root duty term',
        'notes' => 'A private linked root entry for dictionary browsing.',
        'is_published' => false,
    ]);

    $bhakti = DictionaryEntry::query()->create([
        'slug' => 'bhakti',
        'headword' => 'bhakti',
        'transliteration' => 'bhakti',
        'entry_type' => 'term',
        'root_entry_id' => $rootEntry->id,
        'root_headword' => 'legacy root label',
        'short_meaning' => 'devotion and loving participation',
        'notes' => 'A published dictionary entry.',
        'is_published' => true,
    ]);

    $karma = DictionaryEntry::query()->create([
        'slug' => 'karma',
        'headword' => 'karma',
        'transliteration' => 'karma',
        'entry_type' => 'term',
        'short_meaning' => 'action and its moral consequence',
        'notes' => 'Another published dictionary entry.',
        'is_published' => true,
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'avidya',
        'headword' => 'avidya',
        'transliteration' => 'avidya',
        'entry_type' => 'term',
        'short_meaning' => 'hidden ignorance entry',
        'notes' => 'This should stay off the public index.',
        'is_published' => false,
    ]);

    $response = $this->get(route('scripture.dictionary.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/dictionary/index')
            ->has('dictionary_entries', 2)
            ->where('dictionary_entries.0.slug', 'bhakti')
            ->where('dictionary_entries.0.headword', 'bhakti')
            ->where('dictionary_entries.0.transliteration', 'bhakti')
            ->where('dictionary_entries.0.root_headword', 'dharma-root')
            ->where(
                'dictionary_entries.0.short_meaning',
                'devotion and loving participation',
            )
            ->where(
                'dictionary_entries.0.href',
                route('scripture.dictionary.show', $bhakti),
            )
            ->where('dictionary_entries.1.slug', 'karma')
            ->where('dictionary_entries.1.headword', 'karma')
            ->where('dictionary_entries.1.transliteration', 'karma')
            ->where('dictionary_entries.1.root_headword', null)
            ->where(
                'dictionary_entries.1.short_meaning',
                'action and its moral consequence',
            )
            ->where(
                'dictionary_entries.1.href',
                route('scripture.dictionary.show', $karma),
            ),
        );
});

test('topics index page lists topics in stable browse order', function () {
    $atman = Topic::query()->create([
        'slug' => 'atman',
        'name' => 'Atman',
        'description' => 'The self or inner witness in contemplative teaching.',
        'sort_order' => 0,
    ]);

    $karmaYoga = Topic::query()->create([
        'slug' => 'karma-yoga',
        'name' => 'Karma Yoga',
        'description' => 'The discipline of action offered without attachment.',
        'sort_order' => 1,
    ]);

    $dharma = Topic::query()
        ->where('slug', 'dharma')
        ->firstOrFail();

    $response = $this->get(route('scripture.topics.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/topics/index')
            ->has('topics', 3)
            ->where('topics.0.slug', 'atman')
            ->where('topics.0.name', 'Atman')
            ->where(
                'topics.0.description',
                'The self or inner witness in contemplative teaching.',
            )
            ->where('topics.0.href', route('scripture.topics.show', $atman))
            ->where('topics.1.slug', 'dharma')
            ->where('topics.1.name', 'Dharma')
            ->where(
                'topics.1.description',
                'Duty, right action, and moral responsibility in context.',
            )
            ->where('topics.1.href', route('scripture.topics.show', $dharma))
            ->where('topics.2.slug', 'karma-yoga')
            ->where('topics.2.name', 'Karma Yoga')
            ->where(
                'topics.2.description',
                'The discipline of action offered without attachment.',
            )
            ->where(
                'topics.2.href',
                route('scripture.topics.show', $karmaYoga),
            ),
        );
});

test('topic page renders public topic content and related verses in assignment order', function () {
    $topic = Topic::query()
        ->where('slug', 'dharma')
        ->firstOrFail();

    $topic->verseAssignments()->create([
        'verse_id' => $this->secondVerse->id,
        'weight' => 0.900,
        'sort_order' => 1,
        'notes' => 'Primary development topic assignment.',
    ]);

    $topic->verseAssignments()->create([
        'verse_id' => $this->firstVerse->id,
        'weight' => 0.700,
        'sort_order' => 2,
        'notes' => 'Secondary development topic assignment.',
    ]);

    $response = $this->get(route('scripture.topics.show', $topic));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/topics/show')
            ->where('topic.slug', 'dharma')
            ->where('topic.name', 'Dharma')
            ->where(
                'topic.description',
                'Duty, right action, and moral responsibility in context.',
            )
            ->where('topic.href', route('scripture.topics.show', $topic))
            ->has('content_blocks', 1)
            ->where('content_blocks.0.region', 'hero')
            ->where('content_blocks.0.block_type', 'image')
            ->where('content_blocks.0.title', 'Dharma Illustration')
            ->has('related_verses', 2)
            ->where('related_verses.0.id', $this->secondVerse->id)
            ->where('related_verses.0.slug', $this->secondVerse->slug)
            ->where('related_verses.0.number', $this->secondVerse->number)
            ->where('related_verses.0.book_slug', $this->book->slug)
            ->where('related_verses.0.chapter_slug', $this->chapter->slug)
            ->where('related_verses.0.chapter_number', $this->chapter->number)
            ->where(
                'related_verses.0.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->secondVerse,
                ]),
            )
            ->where('related_verses.1.id', $this->firstVerse->id),
        );
});

test('characters index page lists characters in stable browse order', function () {
    $bhishma = Character::query()->create([
        'slug' => 'bhishma',
        'name' => 'Bhishma',
        'description' => 'The elder warrior whose vow shapes the dynastic conflict.',
        'sort_order' => 0,
    ]);

    $krishna = Character::query()->create([
        'slug' => 'krishna',
        'name' => 'Krishna',
        'description' => 'The charioteer-teacher guiding Arjuna through crisis.',
        'sort_order' => 1,
    ]);

    $arjuna = Character::query()
        ->where('slug', 'arjuna')
        ->firstOrFail();

    $response = $this->get(route('scripture.characters.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/characters/index')
            ->has('characters', 3)
            ->where('characters.0.slug', 'bhishma')
            ->where('characters.0.name', 'Bhishma')
            ->where(
                'characters.0.description',
                'The elder warrior whose vow shapes the dynastic conflict.',
            )
            ->where(
                'characters.0.href',
                route('scripture.characters.show', $bhishma),
            )
            ->where('characters.1.slug', 'arjuna')
            ->where('characters.1.name', 'Arjuna')
            ->where(
                'characters.1.description',
                'The warrior disciple whose moral crisis opens the dialogue of the Gita.',
            )
            ->where(
                'characters.1.href',
                route('scripture.characters.show', $arjuna),
            )
            ->where('characters.2.slug', 'krishna')
            ->where('characters.2.name', 'Krishna')
            ->where(
                'characters.2.description',
                'The charioteer-teacher guiding Arjuna through crisis.',
            )
            ->where(
                'characters.2.href',
                route('scripture.characters.show', $krishna),
            ),
        );
});

test('character page renders public character content and related verses in assignment order', function () {
    $character = Character::query()
        ->where('slug', 'arjuna')
        ->firstOrFail();

    $character->verseAssignments()->create([
        'verse_id' => $this->secondVerse->id,
        'weight' => 0.950,
        'sort_order' => 1,
        'notes' => 'Primary development character assignment.',
    ]);

    $character->verseAssignments()->create([
        'verse_id' => $this->firstVerse->id,
        'weight' => 0.800,
        'sort_order' => 2,
        'notes' => 'Secondary development character assignment.',
    ]);

    $response = $this->get(route('scripture.characters.show', $character));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/characters/show')
            ->where('character.slug', 'arjuna')
            ->where('character.name', 'Arjuna')
            ->where(
                'character.description',
                'The warrior disciple whose moral crisis opens the dialogue of the Gita.',
            )
            ->where('character.href', route('scripture.characters.show', $character))
            ->has('content_blocks', 1)
            ->where('content_blocks.0.region', 'media')
            ->where('content_blocks.0.block_type', 'video')
            ->where('content_blocks.0.title', 'Arjuna Context Clip')
            ->has('related_verses', 2)
            ->where('related_verses.0.id', $this->secondVerse->id)
            ->where('related_verses.0.slug', $this->secondVerse->slug)
            ->where('related_verses.0.number', $this->secondVerse->number)
            ->where('related_verses.0.book_slug', $this->book->slug)
            ->where('related_verses.0.chapter_slug', $this->chapter->slug)
            ->where('related_verses.0.chapter_number', $this->chapter->number)
            ->where(
                'related_verses.0.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->secondVerse,
                ]),
            )
            ->where('related_verses.1.id', $this->firstVerse->id),
        );
});

test('character page returns 404 for an unknown character slug', function () {
    $this->get(route('scripture.characters.show', ['character' => 'missing-character']))
        ->assertNotFound();
});

test('topic page returns 404 for an unknown topic slug', function () {
    $this->get(route('scripture.topics.show', ['topic' => 'missing-topic']))
        ->assertNotFound();
});

test('unpublished dictionary entries are not publicly accessible', function () {
    $entry = DictionaryEntry::query()->create([
        'slug' => 'private-term',
        'headword' => 'Private Term',
        'transliteration' => null,
        'entry_type' => 'term',
        'short_meaning' => 'Hidden meaning',
        'notes' => 'This should not be public.',
        'is_published' => false,
    ]);

    $this->get(route('scripture.dictionary.show', $entry))
        ->assertNotFound();
});

test('verse detail page includes adjacent verse navigation inside the current chapter section', function () {
    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->firstVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('previous_verse', null)
            ->where('next_verse.number', $this->secondVerse->number)
            ->where(
                'next_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->secondVerse,
                ]),
            ),
        );

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $this->lastVerse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('next_verse', null)
            ->where('previous_verse.number', $this->penultimateVerse->number)
            ->where(
                'previous_verse.href',
                route('scripture.chapters.verses.show', [
                    'book' => $this->book,
                    'bookSection' => $this->bookSection,
                    'chapter' => $this->chapter,
                    'chapterSection' => $this->chapterSection,
                    'verse' => $this->penultimateVerse,
                ]),
            ),
        );
});

test('verse detail page returns 404 for a mismatched canonical chain', function () {
    $wrongVerse = $this->bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail()
        ->chapterSections()
        ->inCanonicalOrder()
        ->firstOrFail()
        ->verses()
        ->where('slug', 'verse-11')
        ->firstOrFail();

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $this->book,
        'bookSection' => $this->bookSection,
        'chapter' => $this->chapter,
        'chapterSection' => $this->chapterSection,
        'verse' => $wrongVerse,
    ]))->assertNotFound();
});

test('multi-section books browse through the same public canonical flow', function () {
    app(ScriptureJsonImporter::class)->import('ramcharitmanas');

    $book = Book::query()
        ->where('slug', 'ramcharitmanas')
        ->firstOrFail();

    $bookSection = $book->bookSections()
        ->where('slug', 'ayodhya-kanda')
        ->firstOrFail();

    $chapter = $bookSection->chapters()
        ->where('slug', 'chapter-1')
        ->firstOrFail();

    $chapterSection = $chapter->chapterSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $verse = $chapterSection->verses()
        ->where('slug', 'verse-1')
        ->firstOrFail();

    $this->get(route('scripture.books.show', $book))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/books/show')
            ->where('book.number', '2')
            ->where('book.title', 'Ramcharitmanas')
            ->has('book_sections', 2)
            ->where('book_sections.0.slug', 'bala-kanda')
            ->where(
                'book_sections.0.href',
                route('scripture.books.show', $book).'#section-bala-kanda',
            )
            ->where('book_sections.1.slug', 'ayodhya-kanda')
            ->where(
                'book_sections.1.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            ),
        );

    $this->get(route('scripture.chapters.show', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/show')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->where('chapter.title', 'Rama Leaves for the Forest')
            ->has('chapter_sections', 1),
        );

    $this->get(route('scripture.chapters.verses.index', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/index')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->has('chapter_sections', 1)
            ->where(
                'chapter_sections.0.cards.0.verses.0.text',
                'The command to leave the kingdom falls with sudden force.',
            ),
        );

    $this->get(route('scripture.chapters.verses.show', [
        'book' => $book,
        'bookSection' => $bookSection,
        'chapter' => $chapter,
        'chapterSection' => $chapterSection,
        'verse' => $verse,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/chapters/verses/show')
            ->where('book_section.slug', 'ayodhya-kanda')
            ->where(
                'book_section.href',
                route('scripture.books.show', $book).'#section-ayodhya-kanda',
            )
            ->where(
                'chapter_section.href',
                route('scripture.chapters.verses.index', [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                ]).'#main',
            )
            ->where(
                'verse.text',
                'The command to leave the kingdom falls with sudden force.',
            ),
        );
});
