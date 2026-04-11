<?php

namespace App\Support\Navigation;

use App\Models\Book;
use App\Models\Character;
use App\Models\DictionaryEntry;
use App\Models\Page;
use App\Models\Topic;

class LinkTargetRegistry
{
    /**
     * @return array<string, string>
     */
    public static function routeOptions(): array
    {
        return [
            'home' => 'Home',
            'scripture.books.index' => 'Books library',
            'scripture.dictionary.index' => 'Dictionary',
            'scripture.topics.index' => 'Topics',
            'scripture.characters.index' => 'Characters',
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function scriptureTargetKinds(): array
    {
        return [
            'book' => 'Book',
            'chapter' => 'Chapter',
            'verse' => 'Verse',
            'dictionary_entry' => 'Dictionary entry',
            'topic' => 'Topic',
            'character' => 'Character',
        ];
    }

    public static function isAllowedRouteKey(?string $routeKey): bool
    {
        return is_string($routeKey) && array_key_exists($routeKey, self::routeOptions());
    }

    public static function isAllowedScriptureTargetKind(?string $kind): bool
    {
        return is_string($kind) && array_key_exists($kind, self::scriptureTargetKinds());
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    public static function cmsPageOptions(): array
    {
        return Page::query()
            ->orderBy('title')
            ->get(['slug', 'title'])
            ->map(fn (Page $page): array => [
                'slug' => $page->slug,
                'title' => $page->title,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    public static function bookOptions(): array
    {
        return Book::query()
            ->inCanonicalOrder()
            ->get(['slug', 'title'])
            ->map(fn (Book $book): array => [
                'slug' => $book->slug,
                'title' => $book->title,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    public static function dictionaryEntryOptions(): array
    {
        return DictionaryEntry::query()
            ->published()
            ->ordered()
            ->get(['slug', 'headword'])
            ->map(fn (DictionaryEntry $entry): array => [
                'slug' => $entry->slug,
                'title' => $entry->headword,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    public static function topicOptions(): array
    {
        return Topic::query()
            ->orderBy('name')
            ->get(['slug', 'name'])
            ->map(fn (Topic $topic): array => [
                'slug' => $topic->slug,
                'title' => $topic->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: string}>
     */
    public static function characterOptions(): array
    {
        return Character::query()
            ->orderBy('name')
            ->get(['slug', 'name'])
            ->map(fn (Character $character): array => [
                'slug' => $character->slug,
                'title' => $character->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     route_options: array<string, string>,
     *     scripture_target_kinds: array<string, string>,
     *     cms_pages: array<int, array{slug: string, title: string}>,
     *     books: array<int, array{slug: string, title: string}>,
     *     dictionary_entries: array<int, array{slug: string, title: string}>,
     *     topics: array<int, array{slug: string, title: string}>,
     *     characters: array<int, array{slug: string, title: string}>
     * }
     */
    public static function sharedOptions(): array
    {
        return [
            'route_options' => self::routeOptions(),
            'scripture_target_kinds' => self::scriptureTargetKinds(),
            'cms_pages' => self::cmsPageOptions(),
            'books' => self::bookOptions(),
            'dictionary_entries' => self::dictionaryEntryOptions(),
            'topics' => self::topicOptions(),
            'characters' => self::characterOptions(),
        ];
    }
}
