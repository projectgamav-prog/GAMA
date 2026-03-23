<?php

use App\Models\Book;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Illuminate\Database\QueryException;

beforeEach(function () {
    $this->seed(BhagavadGitaDevelopmentSeeder::class);

    $this->book = Book::query()
        ->where('slug', 'bhagavad-gita')
        ->firstOrFail();

    $this->bookSection = $this->book->bookSections()
        ->where('slug', 'main')
        ->firstOrFail();

    $this->chapter = $this->bookSection->chapters()->create([
        'slug' => 'verse-card-group-test',
        'number' => '99',
        'title' => 'Verse Card Group Test',
    ]);

    $this->chapterSection = $this->chapter->chapterSections()->create([
        'slug' => 'verse-card-group-test-main',
        'number' => '1',
        'title' => 'Verse Card Group Test Main',
    ]);

    $this->firstVerse = $this->chapterSection->verses()->create([
        'slug' => 'verse-1',
        'number' => '1',
        'text' => 'Verse card group test verse 1.',
    ]);

    $this->secondVerse = $this->chapterSection->verses()->create([
        'slug' => 'verse-2',
        'number' => '2',
        'text' => 'Verse card group test verse 2.',
    ]);
});

test('chapter sections can own presentation-only verse card groups', function () {
    $group = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Karma Yoga Group',
        'description' => 'Verses rendered together inside one verse card.',
    ]);

    $group->items()->create([
        'verse_id' => $this->secondVerse->id,
    ]);

    $group->items()->create([
        'verse_id' => $this->firstVerse->id,
    ]);

    $group->load('verses', 'items.verse');
    $this->firstVerse->load('verseCardGroupItem');

    expect($this->chapterSection->verseCardGroups()->count())->toBe(1);
    expect($group->verses->pluck('number')->all())->toBe(['1', '2']);
    expect($this->firstVerse->verseCardGroupItem)->not->toBeNull();
    expect($this->firstVerse->verseCardGroupItem->verse_card_group_id)->toBe($group->id);
});

test('a verse can belong to at most one verse card group', function () {
    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'First Group',
    ]);

    $secondGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Second Group',
    ]);

    $firstGroup->items()->create([
        'verse_id' => $this->firstVerse->id,
    ]);

    expect(fn () => $secondGroup->items()->create([
        'verse_id' => $this->firstVerse->id,
    ]))->toThrow(QueryException::class);
});
