<?php

use App\Models\DictionaryEntry;
use Illuminate\Database\QueryException;

test('a valid dictionary entry can be created with generated normalized fields', function () {
    $rootEntry = DictionaryEntry::query()->create([
        'slug' => 'dhr',
        'headword' => "\u{0927}\u{0943}",
        'entry_type' => 'root',
    ]);

    $entry = DictionaryEntry::query()->create([
        'slug' => ' dharma ',
        'headword' => "  \u{0927}\u{0930}\u{094D}\u{092E}   \u{0965} ",
        'transliteration' => '  Dharma   -  ',
        'root_entry_id' => $rootEntry->id,
        'root_headword' => "  \u{0927}\u{0943}  ",
        'short_meaning' => 'duty, law, order',
        'notes' => 'Seed entry for Sanskrit dictionary work.',
    ])->refresh();

    expect($entry->slug)->toBe('dharma');
    expect($entry->headword)->toBe("\u{0927}\u{0930}\u{094D}\u{092E} \u{0965}");
    expect($entry->transliteration)->toBe('Dharma -');
    expect($entry->normalized_headword)->toBe("\u{0927}\u{0930}\u{094D}\u{092E}");
    expect($entry->normalized_transliteration)->toBe('dharma');
    expect($entry->entry_type)->toBe('word');
    expect($entry->root_entry_id)->toBe($rootEntry->id);
    expect($entry->root_headword)->toBe("\u{0927}\u{0943}");
    expect($entry->short_meaning)->toBe('duty, law, order');
    expect($entry->notes)->toBe('Seed entry for Sanskrit dictionary work.');
    expect($entry->is_published)->toBeTrue();
    expect($entry->rootEntry->is($rootEntry))->toBeTrue();
    expect($rootEntry->derivedEntries()->pluck('slug')->all())->toBe(['dharma']);
});

test('dictionary entry slugs remain unique', function () {
    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => "\u{0927}\u{0930}\u{094D}\u{092E}",
    ]);

    expect(fn () => DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => "\u{0927}\u{0930}\u{094D}\u{092E}\u{0903}",
    ]))->toThrow(QueryException::class);
});

test('published scope returns only published entries', function () {
    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => "\u{0927}\u{0930}\u{094D}\u{092E}",
        'is_published' => true,
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'karma',
        'headword' => "\u{0915}\u{0930}\u{094D}\u{092E}",
        'is_published' => false,
    ]);

    expect(DictionaryEntry::query()->published()->pluck('slug')->all())
        ->toBe(['dharma']);
});

test('ordered scope sorts by normalized headword then headword then id', function () {
    DictionaryEntry::query()->create([
        'slug' => 'yoga',
        'headword' => " \u{092F}\u{094B}\u{0917} ",
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'artha',
        'headword' => "\u{0905}\u{0930}\u{094D}\u{0925}",
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => "\u{0927}\u{0930}\u{094D}\u{092E}\u{0965}",
    ]);

    expect(DictionaryEntry::query()->ordered()->pluck('slug')->all())
        ->toBe(['artha', 'dharma', 'yoga']);
});

test('nullable root relation and transliteration remain null when omitted', function () {
    $entry = DictionaryEntry::query()->create([
        'slug' => 'moksha',
        'headword' => "\u{092E}\u{094B}\u{0915}\u{094D}\u{0937}",
        'transliteration' => '   ',
        'root_entry_id' => null,
        'root_headword' => '   ',
    ])->refresh();

    expect($entry->normalized_transliteration)->toBeNull();
    expect($entry->transliteration)->toBeNull();
    expect($entry->root_headword)->toBeNull();
    expect($entry->rootEntry)->toBeNull();
});
