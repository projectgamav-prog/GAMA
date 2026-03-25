<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Models\DictionaryEntry;
use App\Support\Scripture\PublicScriptureData;
use Inertia\Inertia;
use Inertia\Response;

class DictionaryEntryController extends Controller
{
    /**
     * Display the public dictionary browse page.
     */
    public function index(PublicScriptureData $publicScriptureData): Response
    {
        $dictionaryEntries = DictionaryEntry::query()
            ->published()
            ->ordered()
            ->with('rootEntry')
            ->get();

        return Inertia::render('scripture/dictionary/index', [
            'dictionary_entries' => $publicScriptureData->dictionaryEntries(
                $dictionaryEntries,
            ),
        ]);
    }

    /**
     * Display a public dictionary entry page.
     */
    public function show(
        DictionaryEntry $dictionaryEntry,
        PublicScriptureData $publicScriptureData,
    ): Response {
        abort_unless($dictionaryEntry->is_published, 404);

        $dictionaryEntry->load([
            'rootEntry',
            'verseAssignments' => fn ($query) => $query->with([
                'verse.chapterSection.chapter.bookSection.book',
            ]),
        ]);

        return Inertia::render('scripture/dictionary/show', [
            'dictionary_entry' => $publicScriptureData->dictionaryEntry($dictionaryEntry),
            'related_verses' => $publicScriptureData->dictionaryEntryRelatedVerses(
                $dictionaryEntry->verseAssignments,
            ),
        ]);
    }
}
