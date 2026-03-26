<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Support\AdminContext\AdminContext;
use App\Support\Scripture\Admin\CharacterAdminRouteContext;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CharacterController extends Controller
{
    /**
     * Display the public characters browse page.
     */
    public function index(PublicScriptureData $publicScriptureData): Response
    {
        $characters = Character::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->orderBy('id')
            ->get();

        return Inertia::render('scripture/characters/index', [
            'characters' => $publicScriptureData->characterEntries($characters),
        ]);
    }

    /**
     * Display a public character page.
     */
    public function show(
        Request $request,
        Character $character,
        PublicScriptureData $publicScriptureData,
    ): Response {
        $character->load([
            'verseAssignments' => fn ($query) => $query->with([
                'verse.chapterSection.chapter.bookSection.book',
            ]),
        ]);

        $contentBlocks = $character->contentBlocks()
            ->published()
            ->get();
        $adminVisibilityEnabled = AdminContext::isVisible($request);
        $adminRouteContext = new CharacterAdminRouteContext($character);

        return Inertia::render('scripture/characters/show', [
            'character' => $publicScriptureData->character($character),
            'related_verses' => $publicScriptureData->characterRelatedVerses(
                $character->verseAssignments,
            ),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => $adminVisibilityEnabled
                ? [
                    'details_update_href' => $adminRouteContext->detailsUpdateHref(),
                    'full_edit_href' => $adminRouteContext->fullEditHref(),
                    'content_block_update_hrefs' => $contentBlocks
                        ->filter(fn ($block) => $adminRouteContext->isEditableNoteBlock($block))
                        ->mapWithKeys(fn ($block) => [
                            (string) $block->id => $adminRouteContext->contentBlockUpdateHref($block),
                        ])
                        ->all(),
                ]
                : null,
        ]);
    }
}
