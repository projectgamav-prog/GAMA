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
        $returnTo = $this->returnTo(
            $request->input('return_to'),
            $request->getSchemeAndHttpHost(),
        );

        if ($returnTo !== null) {
            return redirect()->to($returnTo, 303);
        }

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

    private function returnTo(mixed $value, string $currentHost): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

        if (str_starts_with($trimmed, '/')) {
            return str_starts_with($trimmed, '//') ? null : $trimmed;
        }

        if (! str_starts_with($trimmed, $currentHost)) {
            return null;
        }

        $path = parse_url($trimmed, PHP_URL_PATH);
        $query = parse_url($trimmed, PHP_URL_QUERY);

        if (! is_string($path) || $path === '') {
            return null;
        }

        return $query ? sprintf('%s?%s', $path, $query) : $path;
    }
}
