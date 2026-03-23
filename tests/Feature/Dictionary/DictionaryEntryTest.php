<?php

use App\Models\DictionaryEntry;
use Illuminate\Database\QueryException;

test('a valid dictionary entry can be created with generated normalized fields', function () {
    $entry = DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => '  धर्म ॥ ',
        'transliteration' => ' Dhárma - ',
        'root_headword' => 'धृ',
        'short_meaning' => 'duty, law, order',
        'notes' => 'Seed entry for Sanskrit dictionary work.',
    ])->refresh();

    expect($entry->slug)->toBe('dharma');
    expect($entry->headword)->toBe('  धर्म ॥ ');
    expect($entry->transliteration)->toBe(' Dhárma - ');
    expect($entry->normalized_headword)->toBe('धर्म');
    expect($entry->normalized_transliteration)->toBe('dhárma');
    expect($entry->entry_type)->toBe('word');
    expect($entry->root_headword)->toBe('धृ');
    expect($entry->short_meaning)->toBe('duty, law, order');
    expect($entry->notes)->toBe('Seed entry for Sanskrit dictionary work.');
    expect($entry->is_published)->toBeTrue();
});

test('dictionary entry slugs remain unique', function () {
    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => 'धर्म',
    ]);

    expect(fn () => DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => 'धर्मः',
    ]))->toThrow(QueryException::class);
});

test('published scope returns only published entries', function () {
    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => 'धर्म',
        'is_published' => true,
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'karma',
        'headword' => 'कर्म',
        'is_published' => false,
    ]);

    expect(DictionaryEntry::query()->published()->pluck('slug')->all())
        ->toBe(['dharma']);
});

test('ordered scope sorts by normalized headword then headword then id', function () {
    DictionaryEntry::query()->create([
        'slug' => 'yoga',
        'headword' => ' योग ',
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'artha',
        'headword' => 'अर्थ',
    ]);

    DictionaryEntry::query()->create([
        'slug' => 'dharma',
        'headword' => 'धर्म॥',
    ]);

    expect(DictionaryEntry::query()->ordered()->pluck('slug')->all())
        ->toBe(['artha', 'dharma', 'yoga']);
});

test('nullable transliteration keeps normalized transliteration null', function () {
    $entry = DictionaryEntry::query()->create([
        'slug' => 'moksha',
        'headword' => 'मोक्ष',
        'transliteration' => null,
    ])->refresh();

    expect($entry->normalized_transliteration)->toBeNull();
});
