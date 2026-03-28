<?php

namespace App\Http\Controllers\Scripture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scripture\ChapterAdminIdentityUpdateRequest;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use Illuminate\Http\RedirectResponse;

class ChapterAdminIdentityController extends Controller
{
    /**
     * Update the canonical chapter identity fields for the current proof phase.
     */
    public function update(
        ChapterAdminIdentityUpdateRequest $request,
        Book $book,
        BookSection $bookSection,
        Chapter $chapter,
    ): RedirectResponse {
        $validated = $request->validated();

        $chapter->update([
            'slug' => trim($validated['slug']),
            'number' => $this->nullableString($validated['number'] ?? null),
            'title' => $this->nullableString($validated['title'] ?? null),
        ]);

        $chapter = $chapter->fresh();

        $referer = $request->headers->get('referer');
        $routeParameters = [
            'book' => $book,
            'bookSection' => $bookSection,
            'chapter' => $chapter,
        ];

        if (is_string($referer) && str_contains($referer, '/admin/full-edit')) {
            return redirect()->route(
                'scripture.chapters.admin.full-edit',
                $routeParameters,
                303,
            );
        }

        return redirect()->route(
            'scripture.chapters.show',
            $routeParameters,
            303,
        );
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
