<?php

use App\Models\Book;
use App\Models\Verse;
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

    $this->chapter = $this->bookSection->chapters()
        ->where('slug', 'chapter-2')
        ->firstOrFail();

    $this->chapterSection = $this->chapter->chapterSections()
        ->where('slug', 'chapter-2-main')
        ->firstOrFail();
});

test('chapter sections can own presentation-only verse card groups', function () {
    $verseFortySeven = $this->chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $verseFortyEight = $this->chapterSection->verses()
        ->where('slug', 'verse-48')
        ->firstOrFail();

    $group = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Karma Yoga Group',
        'description' => 'Verses rendered together inside one verse card.',
    ]);

    $group->items()->create([
        'verse_id' => $verseFortyEight->id,
    ]);

    $group->items()->create([
        'verse_id' => $verseFortySeven->id,
    ]);

    $group->load('verses', 'items.verse');
    $verseFortySeven->load('verseCardGroupItem');

    expect($this->chapterSection->verseCardGroups()->count())->toBe(1);
    expect($group->verses->pluck('number')->all())->toBe(['47', '48']);
    expect($verseFortySeven->verseCardGroupItem)->not->toBeNull();
    expect($verseFortySeven->verseCardGroupItem->verse_card_group_id)->toBe($group->id);
});

test('a verse can belong to at most one verse card group', function () {
    $verse = $this->chapterSection->verses()
        ->where('slug', 'verse-47')
        ->firstOrFail();

    $firstGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'First Group',
    ]);

    $secondGroup = $this->chapterSection->verseCardGroups()->create([
        'title' => 'Second Group',
    ]);

    $firstGroup->items()->create([
        'verse_id' => $verse->id,
    ]);

    expect(fn () => $secondGroup->items()->create([
        'verse_id' => $verse->id,
    ]))->toThrow(QueryException::class);
});
