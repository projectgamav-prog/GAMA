<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\EditableTextContentBlockStoreRequest;
use App\Http\Requests\Scripture\EditableTextContentBlockUpdateRequest;
use App\Models\Character;
use App\Models\ContentBlock;
use App\Support\Scripture\Admin\CharacterAdminRouteContext;
use App\Support\Scripture\Admin\EditableTextNoteBlock;
use Illuminate\Http\RedirectResponse;

class CharacterAdminContentBlockController extends Controller
{
    /**
     * Create a new character-owned editorial note block.
     */
    public function store(
        EditableTextContentBlockStoreRequest $request,
        Character $character,
    ): RedirectResponse {
        $character->contentBlocks()->create(
            EditableTextNoteBlock::createAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }

    /**
     * Update a character-owned text note block.
     */
    public function update(
        EditableTextContentBlockUpdateRequest $request,
        Character $character,
        ContentBlock $contentBlock,
    ): RedirectResponse {
        $adminRouteContext = new CharacterAdminRouteContext($character);

        $adminRouteContext->abortUnlessEditableNoteBlock($contentBlock);

        $contentBlock->update(
            EditableTextNoteBlock::updateAttributes($request->validated()),
        );

        return redirect()->back(status: 303);
    }
}
