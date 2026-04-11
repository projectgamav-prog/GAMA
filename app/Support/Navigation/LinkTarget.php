<?php

namespace App\Support\Navigation;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;

class LinkTarget
{
    /**
     * Normalize a raw link target payload to the shared shape.
     *
     * @param  array<string, mixed>|null  $payload
     * @return array<string, mixed>|null
     */
    public static function normalize(?array $payload): ?array
    {
        if (! is_array($payload)) {
            return null;
        }

        $type = self::normalizedString($payload['type'] ?? null);

        if (! in_array($type, ['url', 'cms_page', 'route', 'scripture'], true)) {
            return null;
        }

        $value = is_array($payload['value'] ?? null) ? $payload['value'] : [];

        return [
            'type' => $type,
            'value' => match ($type) {
                'url' => [
                    'url' => self::normalizedString($value['url'] ?? null),
                ],
                'cms_page' => [
                    'slug' => self::normalizedString($value['slug'] ?? null),
                ],
                'route' => [
                    'key' => self::normalizedString($value['key'] ?? null),
                ],
                'scripture' => [
                    'kind' => self::normalizedString($value['kind'] ?? null),
                    'book_slug' => self::normalizedString($value['book_slug'] ?? null),
                    'book_section_slug' => self::normalizedString($value['book_section_slug'] ?? null),
                    'chapter_slug' => self::normalizedString($value['chapter_slug'] ?? null),
                    'chapter_section_slug' => self::normalizedString($value['chapter_section_slug'] ?? null),
                    'verse_slug' => self::normalizedString($value['verse_slug'] ?? null),
                    'entry_slug' => self::normalizedString($value['entry_slug'] ?? null),
                ],
                default => [],
            },
            'behavior' => [
                'new_tab' => (bool) Arr::get($payload, 'behavior.new_tab', false),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array<int, string>
     */
    public static function validate(?array $payload): array
    {
        $normalized = self::normalize($payload);

        if ($normalized === null) {
            return ['Choose a valid target type.'];
        }

        /** @var array<string, mixed> $value */
        $value = $normalized['value'];

        return match ($normalized['type']) {
            'url' => self::validateUrl($value),
            'cms_page' => self::validateCmsPage($value),
            'route' => self::validateRoute($value),
            'scripture' => self::validateScripture($value),
            default => ['Choose a valid target type.'],
        };
    }

    /**
     * @param  array<string, mixed>|null  $payload
     */
    public static function resolveHref(?array $payload): ?string
    {
        $normalized = self::normalize($payload);

        if ($normalized === null) {
            return null;
        }

        /** @var array<string, mixed> $value */
        $value = $normalized['value'];

        return match ($normalized['type']) {
            'url' => self::normalizedString($value['url'] ?? null),
            'cms_page' => self::resolveCmsPageHref($value),
            'route' => self::resolveRouteHref($value),
            'scripture' => self::resolveScriptureHref($value),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<int, string>
     */
    private static function validateUrl(array $value): array
    {
        $url = self::normalizedString($value['url'] ?? null);

        return $url === null ? ['Enter a URL.'] : [];
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<int, string>
     */
    private static function validateCmsPage(array $value): array
    {
        $slug = self::normalizedString($value['slug'] ?? null);

        if ($slug === null) {
            return ['Choose a CMS page.'];
        }

        return \App\Models\Page::query()->where('slug', $slug)->exists()
            ? []
            : ['Choose an existing CMS page.'];
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<int, string>
     */
    private static function validateRoute(array $value): array
    {
        $key = self::normalizedString($value['key'] ?? null);

        return LinkTargetRegistry::isAllowedRouteKey($key)
            ? []
            : ['Choose a supported internal route.'];
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<int, string>
     */
    private static function validateScripture(array $value): array
    {
        $kind = self::normalizedString($value['kind'] ?? null);

        if (! LinkTargetRegistry::isAllowedScriptureTargetKind($kind)) {
            return ['Choose a supported scripture target.'];
        }

        $missing = match ($kind) {
            'book' => self::requiredFields($value, ['book_slug']),
            'chapter' => self::requiredFields($value, ['book_slug', 'book_section_slug', 'chapter_slug']),
            'verse' => self::requiredFields($value, ['book_slug', 'book_section_slug', 'chapter_slug', 'chapter_section_slug', 'verse_slug']),
            'dictionary_entry', 'topic', 'character' => self::requiredFields($value, ['entry_slug']),
            default => ['Choose a supported scripture target.'],
        };

        return $missing;
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private static function resolveCmsPageHref(array $value): ?string
    {
        $slug = self::normalizedString($value['slug'] ?? null);

        return $slug === null ? null : route('pages.show', ['page' => $slug], false);
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private static function resolveRouteHref(array $value): ?string
    {
        $key = self::normalizedString($value['key'] ?? null);

        if (! LinkTargetRegistry::isAllowedRouteKey($key) || ! is_string($key)) {
            return null;
        }

        return Route::has($key) ? route($key, absolute: false) : null;
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private static function resolveScriptureHref(array $value): ?string
    {
        $kind = self::normalizedString($value['kind'] ?? null);

        return match ($kind) {
            'book' => self::normalizedString($value['book_slug'] ?? null) === null
                ? null
                : route('scripture.books.show', ['book' => $value['book_slug']], false),
            'chapter' => self::hasMissingValues($value, ['book_slug', 'book_section_slug', 'chapter_slug'])
                ? null
                : route('scripture.chapters.show', [
                    'book' => $value['book_slug'],
                    'bookSection' => $value['book_section_slug'],
                    'chapter' => $value['chapter_slug'],
                ], false),
            'verse' => self::hasMissingValues($value, ['book_slug', 'book_section_slug', 'chapter_slug', 'chapter_section_slug', 'verse_slug'])
                ? null
                : route('scripture.chapters.verses.show', [
                    'book' => $value['book_slug'],
                    'bookSection' => $value['book_section_slug'],
                    'chapter' => $value['chapter_slug'],
                    'chapterSection' => $value['chapter_section_slug'],
                    'verse' => $value['verse_slug'],
                ], false),
            'dictionary_entry' => self::normalizedString($value['entry_slug'] ?? null) === null
                ? null
                : route('scripture.dictionary.show', ['dictionaryEntry' => $value['entry_slug']], false),
            'topic' => self::normalizedString($value['entry_slug'] ?? null) === null
                ? null
                : route('scripture.topics.show', ['topic' => $value['entry_slug']], false),
            'character' => self::normalizedString($value['entry_slug'] ?? null) === null
                ? null
                : route('scripture.characters.show', ['character' => $value['entry_slug']], false),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  list<string>  $fields
     * @return array<int, string>
     */
    private static function requiredFields(array $value, array $fields): array
    {
        $missing = [];

        foreach ($fields as $field) {
            if (self::normalizedString($value[$field] ?? null) === null) {
                $missing[] = sprintf('Fill in %s.', str_replace('_', ' ', $field));
            }
        }

        return $missing;
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  list<string>  $fields
     */
    private static function hasMissingValues(array $value, array $fields): bool
    {
        foreach ($fields as $field) {
            if (self::normalizedString($value[$field] ?? null) === null) {
                return true;
            }
        }

        return false;
    }

    private static function normalizedString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
