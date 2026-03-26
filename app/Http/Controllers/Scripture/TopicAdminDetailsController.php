<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\TopicAdminDetailsUpdateRequest;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;

class TopicAdminDetailsController extends Controller
{
    /**
     * Update topic editorial details.
     */
    public function update(
        TopicAdminDetailsUpdateRequest $request,
        Topic $topic,
    ): RedirectResponse {
        $topic->update([
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
