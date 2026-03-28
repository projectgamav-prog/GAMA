<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ChapterSectionAdminRouteContext;
use App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChapterVerseController extends Controller
{
    /**
     * Display a read-only verse reader for a chapter.
     */
    public function index(
        Request $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
        BuildChapterVerseReaderData $buildChapterVerseReaderData,
        PublicScriptureData $publicScriptureData,
    ): Response
    {
        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );
        $chapterSectionsBySlug = collect($readerData['chapter_sections'])
            ->keyBy('slug');
        $isAdmin = AdminContext::canAccess($request->user());

        return Inertia::render('scripture/chapters/verses/index', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => $publicScriptureData->chapter($book, $bookSection, $chapter),
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'admin' => $isAdmin
                ? [
                    'chapter_section_store_href' => route(
                        'scripture.chapter-sections.admin.store',
                        [
                            'book' => $book,
                            'bookSection' => $bookSection,
                            'chapter' => $chapter,
                        ],
                    ),
                ]
                : null,
            'chapter_sections' => $chapter->chapterSections
                ->map(function (ChapterSection $chapterSection) use (
                    $book,
                    $bookSection,
                    $chapter,
                    $chapterSectionsBySlug,
                    $isAdmin,
                    $publicScriptureData,
                ) {
                    $readerSection = $chapterSectionsBySlug->get($chapterSection->slug);

                    return [
                        ...$publicScriptureData->chapterSection(
                            $book,
                            $bookSection,
                            $chapter,
                            $chapterSection,
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
                        'cards' => is_array($readerSection['cards'] ?? null)
                            ? $readerSection['cards']
                            : [],
                    ];
                })
                ->values()
                ->all(),
        ]);
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
            fn (\App\Models\ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
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
