<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\CharacterAdminDetailsUpdateRequest;
use App\Models\Character;
use Illuminate\Http\RedirectResponse;

class CharacterAdminDetailsController extends Controller
{
    /**
     * Update character editorial details.
     */
    public function update(
        CharacterAdminDetailsUpdateRequest $request,
        Character $character,
    ): RedirectResponse {
        $character->update([
            'description' => $this->nullableString($request->validated('description')),
        ]);

        return redirect()->back(status: 303);
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
