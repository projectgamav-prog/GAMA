<?php

namespace App\Support\Scripture\PageData;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use App\Support\Scripture\Admin\ChapterSectionAdminRouteContext;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Support\Collection;

class ChapterSectionsPageDataBuilder
{
    /**
     * @param  Collection<int, ChapterSection>  $chapterSections
     * @param  Collection<string, array<string, mixed>>  $readerSectionsBySlug
     * @return list<array<string, mixed>>
     */
    public function build(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        Collection $chapterSections,
        Collection $readerSectionsBySlug,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        return $chapterSections
            ->map(function (ChapterSection $chapterSection) use (
                $book,
                $bookSection,
                $chapter,
                $readerSectionsBySlug,
                $publicScriptureData,
                $isAdmin,
            ): array {
                $readerSection = $readerSectionsBySlug->get($chapterSection->slug);
                $cards = is_array($readerSection['cards'] ?? null)
                    ? $readerSection['cards']
                    : [];
                $versesCount = collect($cards)
                    ->sum(
                        fn (array $card): int => is_array($card['verses'] ?? null)
                            ? count($card['verses'])
                            : 0,
                    );
                $adminRouteContext = new ChapterSectionAdminRouteContext(
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSection,
                );
                $contentBlocks = $chapterSection->relationLoaded('contentBlocks')
                    ? collect($chapterSection->contentBlocks)
                    : $chapterSection->contentBlocks()
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id')
                        ->get();
                $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
                    $contentBlocks,
                    fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
                );

                return [
                    ...$publicScriptureData->chapterSection(
                        $book,
                        $bookSection,
                        $chapter,
                        $chapterSection,
                        $versesCount,
                    ),
                    'intro_block' => $primaryIntroBlock
                        ? $publicScriptureData->contentBlock($primaryIntroBlock)
                        : null,
                    'admin' => $isAdmin
                        ? $this->chapterSectionAdminPayload(
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
                            $publicScriptureData,
                            $primaryIntroBlock,
                        )
                        : null,
                    'cards' => $this->cards(
                        $book,
                        $bookSection,
                        $chapter,
                        $chapterSection,
                        $cards,
                        $publicScriptureData,
                        $isAdmin,
                    ),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  list<array<string, mixed>>  $cards
     * @return list<array<string, mixed>>
     */
    private function cards(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        array $cards,
        PublicScriptureData $publicScriptureData,
        bool $isAdmin,
    ): array {
        if (! $isAdmin) {
            return $cards;
        }

        $sectionVerses = $chapterSection->relationLoaded('verses')
            ? collect($chapterSection->verses)
            : $chapterSection->verses()
                ->inCanonicalOrder()
                ->with([
                    'translations',
                    'commentaries',
                    'verseMeta',
                    'characterAssignments.character',
                    'contentBlocks' => fn ($query) => $query
                        ->published()
                        ->orderBy('sort_order')
                        ->orderBy('id'),
                ])
                ->get();
        $versesById = $sectionVerses->keyBy('id');

        return collect($cards)
            ->map(function (array $card) use (
                $book,
                $bookSection,
                $chapter,
                $chapterSection,
                $publicScriptureData,
                $versesById,
            ): array {
                $readerVerses = is_array($card['verses'] ?? null)
                    ? $card['verses']
                    : [];

                return [
                    ...$card,
                    'verses' => collect($readerVerses)
                        ->map(function (array $readerVerse) use (
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
                            $publicScriptureData,
                            $versesById,
                        ): array {
                            $verse = $versesById->get($readerVerse['id'] ?? null);

                            if (! $verse instanceof Verse) {
                                return $readerVerse;
                            }

                            return [
                                ...$readerVerse,
                                'verse_meta' => $publicScriptureData->verseMeta($verse->verseMeta),
                                'characters' => $publicScriptureData->characters(
                                    $verse->characterAssignments,
                                ),
                                'admin' => $this->readerVerseAdminPayload(
                                    $book,
                                    $bookSection,
                                    $chapter,
                                    $chapterSection,
                                    $verse,
                                    $publicScriptureData,
                                ),
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function readerVerseAdminPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        Verse $verse,
        PublicScriptureData $publicScriptureData,
    ): array {
        $adminRouteContext = new VerseAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
            $verse,
        );
        $contentBlocks = $verse->relationLoaded('contentBlocks')
            ? collect($verse->contentBlocks)
            : $verse->contentBlocks()
                ->published()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        $primaryIntroBlock = PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );

        return [
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'nearby_create_href' => route(
                'scripture.chapters.verses.admin.store',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultIntroBlockRegion(),
            'translations' => [
                'store_href' => $adminRouteContext->translationStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextTranslationSortOrder(
                    $verse->translations,
                ),
                'rows' => collect($verse->translations)
                    ->map(
                        fn (VerseTranslation $translation) => VerseRelationAdminData::translation(
                            $translation,
                            $adminRouteContext->translationUpdateHref($translation),
                            $adminRouteContext->translationDestroyHref($translation),
                        ),
                    )
                    ->values()
                    ->all(),
            ],
            'commentaries' => [
                'store_href' => $adminRouteContext->commentaryStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextCommentarySortOrder(
                    $verse->commentaries,
                ),
                'rows' => collect($verse->commentaries)
                    ->map(
                        fn (VerseCommentary $commentary) => VerseRelationAdminData::commentary(
                            $commentary,
                            $adminRouteContext->commentaryUpdateHref($commentary),
                            $adminRouteContext->commentaryDestroyHref($commentary),
                        ),
                    )
                    ->values()
                    ->all(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterSectionAdminPayload(
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        ChapterSection $chapterSection,
        PublicScriptureData $publicScriptureData,
        ?ContentBlock $primaryIntroBlock,
    ): array {
        $adminRouteContext = new ChapterSectionAdminRouteContext(
            $book,
            $bookSection,
            $chapter,
            $chapterSection,
        );

        return [
            'details_update_href' => route(
                'scripture.chapter-sections.admin.details.update',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? ($publicScriptureData->contentBlocks([$primaryIntroBlock])[0] ?? null)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            'child_store_href' => route(
                'scripture.chapters.verses.admin.store',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
        ];
    }
}
