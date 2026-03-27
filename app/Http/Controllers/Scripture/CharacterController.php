<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Support\Scripture\PublicScriptureData;
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

        return Inertia::render('scripture/characters/show', [
            'character' => $publicScriptureData->character($character),
            'related_verses' => $publicScriptureData->characterRelatedVerses(
                $character->verseAssignments,
            ),
            'content_blocks' => $publicScriptureData->contentBlocks($contentBlocks),
            'admin' => null,
        ]);
    }
}
