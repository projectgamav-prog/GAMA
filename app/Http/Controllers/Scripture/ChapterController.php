<?php

namespace App\Http\Controllers\Scripture;

use App\Actions\Scripture\BuildChapterVerseReaderData;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\Registry\AdminEntityRegistry;
use App\Support\Scripture\PageData\ChapterPageAdminDataBuilder;
use App\Support\Scripture\PageData\ChapterSectionsPageDataBuilder;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
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
        AdminEntityRegistry $adminEntityRegistry,
        ChapterPageAdminDataBuilder $chapterPageAdminDataBuilder,
        ChapterSectionsPageDataBuilder $chapterSectionsPageDataBuilder,
    ): Response
    {
        $contentBlocks = $chapter->contentBlocks()
            ->published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $isAdmin = AdminContext::canAccess($request->user());
        $adminRouteContext = new ChapterAdminRouteContext($book, $bookSection, $chapter);
        $primaryIntroBlock = $chapterPageAdminDataBuilder->primaryIntroBlock(
            $contentBlocks,
            $adminRouteContext,
        );
        $readerData = $buildChapterVerseReaderData->handle(
            $book,
            $bookSection,
            $chapter,
        );
        $verseAdminDefinition = $adminEntityRegistry->definition('verse');

        if ($isAdmin) {
            $chapter->loadMissing([
                'chapterSections.verses.commentaries',
                'chapterSections.verses.verseMeta',
                'chapterSections.verses.characterAssignments.character',
                'chapterSections.verses.contentBlocks' => fn ($query) => $query
                    ->published()
                    ->orderBy('sort_order')
                    ->orderBy('id'),
            ]);
        }

        $readerSectionsBySlug = collect($readerData['chapter_sections'])
            ->keyBy('slug');

        return Inertia::render('scripture/chapters/show', [
            'book' => $publicScriptureData->book($book),
            'book_section' => $publicScriptureData->bookSection($book, $bookSection),
            'chapter' => [
                ...$publicScriptureData->chapter($book, $bookSection, $chapter),
                'intro_block' => $primaryIntroBlock
                    ? $publicScriptureData->contentBlock($primaryIntroBlock)
                    : null,
            ],
            'reader_languages' => $readerData['reader_languages'],
            'default_language' => $readerData['default_language'],
            'isAdmin' => $isAdmin,
            'admin' => $isAdmin
                ? $chapterPageAdminDataBuilder->adminPayload(
                    $adminRouteContext,
                    $primaryIntroBlock,
                    $publicScriptureData,
                )
                : null,
            'verse_admin_shared' => $isAdmin
                ? $chapterPageAdminDataBuilder->verseAdminSharedPayload($verseAdminDefinition)
                : null,
            'chapter_sections' => $chapterSectionsPageDataBuilder->build(
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
}
