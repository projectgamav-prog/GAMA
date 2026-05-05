<?php

namespace App\Admin\Conscious\Policies;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Database\Eloquent\Model;

final class ConsciousCanonicalHierarchyPolicy
{
    public function assertCanCreate(string $actionKey, Model $routeEntity): void
    {
        $allowed = match ($actionKey) {
            'canonical.create_book' => $routeEntity instanceof Book && ! $routeEntity->exists,
            'canonical.create_book_section' => $routeEntity instanceof Book && $routeEntity->exists,
            'canonical.create_chapter' => $routeEntity instanceof BookSection,
            'canonical.create_chapter_section' => $routeEntity instanceof Chapter,
            'canonical.create_verse' => $routeEntity instanceof ChapterSection,
            default => false,
        };

        abort_unless($allowed, 422, 'This canonical create action is not available for the route entity.');
    }

    public function assertCanDelete(Model $entity): void
    {
        abort_unless(
            $entity instanceof Book
                || $entity instanceof BookSection
                || $entity instanceof Chapter
                || $entity instanceof ChapterSection
                || $entity instanceof Verse,
            422,
            'This canonical delete action is not available for the route entity.',
        );
    }
}
