<?php

namespace App\Admin\Conscious\Policies;

use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use Illuminate\Database\Eloquent\Model;

final class ConsciousVerseSupportPolicy
{
    public function assertVerseOwner(Model $owner): void
    {
        abort_unless($owner instanceof Verse, 422, 'Verse support actions are available only for verse entities.');
    }

    public function assertTranslationOwnedBy(Verse $verse, VerseTranslation $translation): void
    {
        abort_unless((int) $translation->verse_id === (int) $verse->getKey(), 404);
    }

    public function assertCommentaryOwnedBy(Verse $verse, VerseCommentary $commentary): void
    {
        abort_unless((int) $commentary->verse_id === (int) $verse->getKey(), 404);
    }
}
