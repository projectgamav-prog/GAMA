<?php

namespace App\Support\Scripture\Admin;

use App\Models\CommentarySource;
use App\Models\TranslationSource;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;

class VerseRelationAdminData
{
    /**
     * @return array<string, mixed>
     */
    public static function translation(
        VerseTranslation $translation,
        string $updateHref,
        string $destroyHref,
    ): array {
        return [
            'id' => $translation->id,
            'source_key' => $translation->source_key,
            'source_name' => $translation->source_name,
            'translation_source_id' => $translation->translation_source_id,
            'language_code' => $translation->language_code,
            'text' => $translation->text,
            'sort_order' => $translation->sort_order,
            'update_href' => $updateHref,
            'destroy_href' => $destroyHref,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function commentary(
        VerseCommentary $commentary,
        string $updateHref,
        string $destroyHref,
    ): array {
        return [
            'id' => $commentary->id,
            'source_key' => $commentary->source_key,
            'source_name' => $commentary->source_name,
            'commentary_source_id' => $commentary->commentary_source_id,
            'author_name' => $commentary->author_name,
            'language_code' => $commentary->language_code,
            'title' => $commentary->title,
            'body' => $commentary->body,
            'sort_order' => $commentary->sort_order,
            'update_href' => $updateHref,
            'destroy_href' => $destroyHref,
        ];
    }

    /**
     * @param  iterable<int, TranslationSource>  $sources
     * @return list<array<string, mixed>>
     */
    public static function translationSources(iterable $sources): array
    {
        return collect($sources)
            ->map(fn (TranslationSource $source) => self::sourceOption(
                id: $source->id,
                slug: $source->slug,
                name: $source->name,
                shortName: $source->short_name,
                authorName: $source->author_name,
                languageCode: $source->language_code,
                tradition: $source->tradition,
                description: $source->description,
                websiteUrl: $source->website_url,
                sortOrder: $source->sort_order,
                isPublished: $source->is_published,
            ))
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, CommentarySource>  $sources
     * @return list<array<string, mixed>>
     */
    public static function commentarySources(iterable $sources): array
    {
        return collect($sources)
            ->map(fn (CommentarySource $source) => self::sourceOption(
                id: $source->id,
                slug: $source->slug,
                name: $source->name,
                shortName: $source->short_name,
                authorName: $source->author_name,
                languageCode: $source->language_code,
                tradition: $source->tradition,
                description: $source->description,
                websiteUrl: $source->website_url,
                sortOrder: $source->sort_order,
                isPublished: $source->is_published,
            ))
            ->values()
            ->all();
    }

    /**
     * @param  iterable<int, VerseTranslation>  $translations
     */
    public static function nextTranslationSortOrder(iterable $translations): int
    {
        return self::nextSortOrder($translations);
    }

    /**
     * @param  iterable<int, VerseCommentary>  $commentaries
     */
    public static function nextCommentarySortOrder(iterable $commentaries): int
    {
        return self::nextSortOrder($commentaries);
    }

    /**
     * @return array<string, mixed>
     */
    public static function translationFields(AdminEntityDefinition $definition): array
    {
        return [
            'source_key' => $definition->field('translation_source_key')->toArray(),
            'source_name' => $definition->field('translation_source_name')->toArray(),
            'translation_source_id' => $definition->field('translation_source_id')->toArray(),
            'language_code' => $definition->field('translation_language_code')->toArray(),
            'text' => $definition->field('translation_text')->toArray(),
            'sort_order' => $definition->field('translation_sort_order')->toArray(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function commentaryFields(AdminEntityDefinition $definition): array
    {
        return [
            'source_key' => $definition->field('commentary_source_key')->toArray(),
            'source_name' => $definition->field('commentary_source_name')->toArray(),
            'commentary_source_id' => $definition->field('commentary_source_id')->toArray(),
            'author_name' => $definition->field('commentary_author_name')->toArray(),
            'language_code' => $definition->field('commentary_language_code')->toArray(),
            'title' => $definition->field('commentary_title')->toArray(),
            'body' => $definition->field('commentary_body')->toArray(),
            'sort_order' => $definition->field('commentary_sort_order')->toArray(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function sourceOption(
        int $id,
        string $slug,
        string $name,
        ?string $shortName,
        ?string $authorName,
        ?string $languageCode,
        ?string $tradition,
        ?string $description,
        ?string $websiteUrl,
        int $sortOrder,
        bool $isPublished,
    ): array {
        return [
            'id' => $id,
            'slug' => $slug,
            'name' => $name,
            'short_name' => $shortName,
            'author_name' => $authorName,
            'language_code' => $languageCode,
            'tradition' => $tradition,
            'description' => $description,
            'website_url' => $websiteUrl,
            'sort_order' => $sortOrder,
            'is_published' => $isPublished,
        ];
    }

    /**
     * @param  iterable<int, object>  $rows
     */
    private static function nextSortOrder(iterable $rows): int
    {
        $collection = collect($rows);

        if ($collection->isEmpty()) {
            return 1;
        }

        return ((int) $collection->max('sort_order')) + 1;
    }
}
