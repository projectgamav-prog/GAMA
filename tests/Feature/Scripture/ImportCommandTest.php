<?php

use App\Models\Book;
use App\Models\BookCategory;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use App\Support\Scripture\ScriptureJsonImporter;
use Illuminate\Support\Facades\DB;

test('scripture import command imports all enabled books from the corpus manifest', function () {
    $this->artisan('scripture:import')
        ->assertExitCode(0);

    expect(Book::query()->count())->toBe(6);
    expect(Book::query()->where('slug', 'bhagavad-gita')->value('number'))->toBe('1');
    expect(Book::query()->where('slug', 'sectioned-demo-book')->value('number'))->toBe('6');
    expect(BookCategory::query()->count())->toBe(6);
    expect(DB::table('book_category_assignments')->count())->toBe(13);
    expect(Book::query()->where('slug', 'ramcharitmanas')->exists())->toBeTrue();
    expect(Book::query()->where('slug', 'sectioned-demo-book')->exists())->toBeTrue();
});

test('scripture import command imports one book by slug', function () {
    $expectedCounts = app(ScriptureJsonImporter::class)->import('bhagavad-gita', true)['counts'];

    $this->artisan('scripture:import', [
        'target' => 'bhagavad-gita',
    ])->assertExitCode(0);

    expect(Book::query()->count())->toBe(1);
    expect(BookSection::query()->count())->toBe(1);
    expect(Chapter::query()->count())->toBe($expectedCounts['chapters']);
    expect(ChapterSection::query()->count())->toBe($expectedCounts['chapter_sections']);
    expect(Verse::query()->count())->toBe($expectedCounts['verses']);
    expect(VerseTranslation::query()->count())->toBe($expectedCounts['translations']);
    expect(VerseCommentary::query()->count())->toBe($expectedCounts['commentaries']);
    expect(BookCategory::query()->pluck('slug')->sort()->values()->all())
        ->toBe(['gita', 'philosophy', 'scripture']);
    expect(Book::query()->firstOrFail()->number)->toBe('1');
    expect(Book::query()->firstOrFail()->categories()->pluck('slug')->sort()->values()->all())
        ->toBe(['gita', 'philosophy', 'scripture']);
});

test('scripture import command imports one declared chapter file by path', function () {
    $targetPath = 'database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json';
    $expectedCounts = app(ScriptureJsonImporter::class)->import($targetPath, true)['counts'];

    $this->artisan('scripture:import', [
        'target' => $targetPath,
    ])->assertExitCode(0);

    expect(Book::query()->count())->toBe(1);
    expect(BookSection::query()->where('slug', 'main')->exists())->toBeTrue();
    expect(Chapter::query()->count())->toBe(1);
    expect(Chapter::query()->where('slug', 'chapter-1')->exists())->toBeTrue();
    expect(Chapter::query()->where('slug', 'chapter-2')->exists())->toBeFalse();
    expect(ChapterSection::query()->count())->toBe($expectedCounts['chapter_sections']);
    expect(Verse::query()->count())->toBe($expectedCounts['verses']);
});

test('scripture import command dry run validates without writing to the database', function () {
    $this->artisan('scripture:import', [
        'target' => 'bhagavad-gita',
        '--dry-run' => true,
    ])->assertExitCode(0);

    expect(Book::query()->count())->toBe(0);
    expect(BookCategory::query()->count())->toBe(0);
    expect(BookSection::query()->count())->toBe(0);
    expect(Chapter::query()->count())->toBe(0);
    expect(ChapterSection::query()->count())->toBe(0);
    expect(Verse::query()->count())->toBe(0);
    expect(VerseTranslation::query()->count())->toBe(0);
    expect(VerseCommentary::query()->count())->toBe(0);
});

test('repeated imports remain idempotent and sync book category assignments', function () {
    $this->artisan('scripture:import', [
        'target' => 'bhagavad-gita',
    ])->assertExitCode(0);

    $baselineCounts = [
        'books' => Book::query()->count(),
        'book_sections' => BookSection::query()->count(),
        'chapters' => Chapter::query()->count(),
        'chapter_sections' => ChapterSection::query()->count(),
        'verses' => Verse::query()->count(),
        'translations' => VerseTranslation::query()->count(),
        'commentaries' => VerseCommentary::query()->count(),
    ];

    $book = Book::query()->where('slug', 'bhagavad-gita')->firstOrFail();
    $extraCategory = BookCategory::query()->updateOrCreate(
        ['slug' => 'poetry'],
        [
            'name' => 'Poetry',
            'description' => 'Temporary test category.',
            'sort_order' => 99,
        ],
    );

    $book->categories()->syncWithoutDetaching([$extraCategory->id]);

    expect($book->categories()->pluck('slug')->sort()->values()->all())
        ->toBe(['gita', 'philosophy', 'poetry', 'scripture']);

    $this->artisan('scripture:import', [
        'target' => 'bhagavad-gita',
    ])->assertExitCode(0);

    $book->refresh();

    expect($book->categories()->pluck('slug')->sort()->values()->all())
        ->toBe(['gita', 'philosophy', 'scripture']);
    expect(DB::table('book_category_assignments')->count())->toBe(3);
    expect([
        'books' => Book::query()->count(),
        'book_sections' => BookSection::query()->count(),
        'chapters' => Chapter::query()->count(),
        'chapter_sections' => ChapterSection::query()->count(),
        'verses' => Verse::query()->count(),
        'translations' => VerseTranslation::query()->count(),
        'commentaries' => VerseCommentary::query()->count(),
    ])->toBe($baselineCounts);
});
