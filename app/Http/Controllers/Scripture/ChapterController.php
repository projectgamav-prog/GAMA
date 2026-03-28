<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\ChapterSectionAdminRouteContext;
use App\Support\Scripture\Admin\ContentBlockCapabilityPayload;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\Admin\VisibleContentBlockSequence;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    /**
     * Display a read-only chapter overview page.
     */
    public function show(
        Request $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        BuildChapterVerseReaderData $buildChapterVerseReaderData,
        PublicScriptureData $publicScriptureData,
    ): Response
    {
        $contentBlocks = $chapter->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $primaryEditableBlock = $this->primaryPublishedEditableBlock(
            $contentBlocks,
            $adminRouteContext,
        );
        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );
        $readerSectionsBySlug = collect($readerData['chapter_sections'])
            ->keyBy('slug');

        return Inertia::render('scripture/chapters/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $this->chapterAdminPayload(
                    $adminRouteContext,
                    $contentBlocks,
                    $primaryEditableBlock,
                )
                : null,
            'chapter_sections' => $this->chapterSectionsPayload(
                $book,
                $bookSection,
                $chapter,
                $chapter->chapterSections,
                $readerSectionsBySlug,
                $publicScriptureData,
                $isAdmin,
            ),
        ]);
    }

    /**
     * Resolve a single clear primary published note block for page-intro editing.
     *
     * @param  Collection<int, ContentBlock>  $contentBlocks
     */
    private function primaryPublishedEditableBlock(
        Collection $contentBlocks,
        ChapterAdminRouteContext $adminRouteContext,
    ): ?ContentBlock {
        return PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableNoteBlock($block),
        );
    }

    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     * @return array<string, mixed>
     */
    private function chapterAdminPayload(
        ChapterAdminRouteContext $adminRouteContext,
        Collection $contentBlocks,
        ?ContentBlock $primaryEditableBlock,
    ): array {
        $visibleSequence = new VisibleContentBlockSequence($contentBlocks);

        return [
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'chapter_section_store_href' => route(
                'scripture.chapter-sections.admin.store',
                $adminRouteContext->routeParameters(),
            ),
            'content_block_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'content_block_types' => $adminRouteContext->contentBlockTypes(),
            'content_block_default_region' => $adminRouteContext->defaultContentBlockRegion(),
            'primary_content_block_id' => $primaryEditableBlock?->id,
            'primary_content_block_update_href' => $primaryEditableBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryEditableBlock)
                : null,
            ...ContentBlockCapabilityPayload::build(
                $contentBlocks,
                $visibleSequence,
                fn (ContentBlock $block): bool => $adminRouteContext->isEditableNoteBlock($block),
                fn (ContentBlock $block): bool => $adminRouteContext->isDuplicableNoteBlock($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockUpdateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveUpHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockMoveDownHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockReorderHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDuplicateHref($block),
                fn (ContentBlock $block): string => $adminRouteContext->contentBlockDestroyHref($block),
            ),
        ];
    }

    /**
     * @param  Collection<int, ChapterSection>  $chapterSections
     * @param  Collection<string, array<string, mixed>>  $readerSectionsBySlug
     * @return list<array<string, mixed>>
     */
    private function chapterSectionsPayload(
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

                return [
                    ...$publicScriptureData->chapterSection(
                        $book,
                        $bookSection,
                        $chapter,
                        $chapterSection,
                        $versesCount,
                    ),
                    'admin' => $isAdmin
                        ? $this->chapterSectionAdminPayload(
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
                            $publicScriptureData,
                        )
                        : null,
                    'cards' => $cards,
                ];
            })
            ->values()
            ->all();
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
    ): array {
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
            'details_update_href' => route(
                'scripture.chapter-sections.admin.details.update',
                [
                    'book' => $book,
                    'bookSection' => $bookSection,
                    'chapter' => $chapter,
                    'chapterSection' => $chapterSection,
                ],
            ),
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? ($publicScriptureData->contentBlocks([$primaryIntroBlock])[0] ?? null)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
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
