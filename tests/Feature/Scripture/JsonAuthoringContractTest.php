<?php

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use App\Support\Scripture\ScriptureJsonImporter;

function scriptureJsonFixture(string $path): array
{
    return json_decode(file_get_contents(base_path($path)), true, 512, JSON_THROW_ON_ERROR);
}

function withMutatedScriptureJson(string $path, callable $mutate, callable $assertions): void
{
    $absolutePath = base_path($path);
    $originalContents = file_get_contents($absolutePath);
    $payload = json_decode($originalContents, true, 512, JSON_THROW_ON_ERROR);
    $mutatedPayload = $mutate($payload);

    file_put_contents(
        $absolutePath,
        json_encode($mutatedPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES).PHP_EOL,
    );

    try {
        $assertions();
    } finally {
        file_put_contents($absolutePath, $originalContents);
    }
}

test('valid book manifest with section imports successfully', function () {
    $rootManifest = scriptureJsonFixture('database/data/scripture/manifest.json');
    $manifest = scriptureJsonFixture('database/data/scripture/books/bhagavad-gita/manifest.json');

    expect($rootManifest['books'][0])->toHaveKey('number');
    expect($manifest)->toHaveKey('section');
    expect($manifest)->not->toHaveKey('sections');
    expect($manifest['book'])->toHaveKey('number');
    expect($manifest['section'])->toBeArray();

    app(ScriptureJsonImporter::class)->import('bhagavad-gita');

    expect(Book::query()->where('slug', 'bhagavad-gita')->exists())->toBeTrue();
    expect(Book::query()->where('slug', 'bhagavad-gita')->value('number'))->toBe('1');
    expect(BookSection::query()->where('slug', 'main')->exists())->toBeTrue();
});

test('book import safely falls back to the root manifest number when book number is omitted', function () {
    withMutatedScriptureJson(
        'database/data/scripture/books/bhagavad-gita/manifest.json',
        function (array $manifest): array {
            unset($manifest['book']['number']);

            return $manifest;
        },
        function (): void {
            app(ScriptureJsonImporter::class)->import('bhagavad-gita');

            expect(Book::query()->where('slug', 'bhagavad-gita')->value('number'))->toBe('1');
        },
    );
});

test('valid chapter file with chapter-section imports successfully', function () {
    $path = 'database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json';
    $chapter = scriptureJsonFixture($path);
    $expectedCounts = app(ScriptureJsonImporter::class)->import($path, true)['counts'];

    expect($chapter)->toHaveKey('chapter-section');
    expect($chapter)->not->toHaveKey('chapter-sections');
    expect($chapter['chapter-section'])->toBeArray();

    app(ScriptureJsonImporter::class)->import($path);

    expect(Chapter::query()->where('slug', 'chapter-1')->exists())->toBeTrue();
    expect(ChapterSection::query()->count())->toBe($expectedCounts['chapter_sections']);
    expect(Verse::query()->count())->toBe($expectedCounts['verses']);
});

test('old key sections is rejected', function () {
    withMutatedScriptureJson(
        'database/data/scripture/books/bhagavad-gita/manifest.json',
        function (array $manifest): array {
            $manifest['sections'] = $manifest['section'];
            unset($manifest['section']);

            return $manifest;
        },
        function (): void {
            expect(fn () => app(ScriptureJsonImporter::class)->import('bhagavad-gita'))
                ->toThrow(RuntimeException::class, 'Invalid scripture book manifest');

            expect(Book::query()->count())->toBe(0);
            expect(BookSection::query()->count())->toBe(0);
        },
    );
});

test('old key chapter-sections is rejected', function () {
    withMutatedScriptureJson(
        'database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json',
        function (array $chapter): array {
            $chapter['chapter-sections'] = $chapter['chapter-section'];
            unset($chapter['chapter-section']);

            return $chapter;
        },
        function (): void {
            expect(fn () => app(ScriptureJsonImporter::class)->import('database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json'))
                ->toThrow(RuntimeException::class, 'Invalid scripture chapter dataset');

            expect(Book::query()->count())->toBe(0);
            expect(Chapter::query()->count())->toBe(0);
            expect(ChapterSection::query()->count())->toBe(0);
        },
    );
});

test('non-array section is rejected', function () {
    withMutatedScriptureJson(
        'database/data/scripture/books/bhagavad-gita/manifest.json',
        fn (array $manifest): array => array_merge($manifest, ['section' => 'main']),
        function (): void {
            expect(fn () => app(ScriptureJsonImporter::class)->import('bhagavad-gita'))
                ->toThrow(RuntimeException::class, 'Invalid scripture book manifest');

            expect(Book::query()->count())->toBe(0);
            expect(BookSection::query()->count())->toBe(0);
        },
    );
});

test('non-array chapter-section is rejected', function () {
    withMutatedScriptureJson(
        'database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json',
        fn (array $chapter): array => array_merge($chapter, ['chapter-section' => 'main']),
        function (): void {
            expect(fn () => app(ScriptureJsonImporter::class)->import('database/data/scripture/books/bhagavad-gita/sections/main/chapters/chapter-01.json'))
                ->toThrow(RuntimeException::class, 'Invalid scripture chapter dataset');

            expect(Book::query()->count())->toBe(0);
            expect(Chapter::query()->count())->toBe(0);
            expect(ChapterSection::query()->count())->toBe(0);
        },
    );
});
