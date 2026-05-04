<?php

namespace App\Admin\Conscious\Policies;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Verse;
use Illuminate\Database\Eloquent\Model;

final class ConsciousProtectedIdentityPolicy
{
    public function assertCanUpdate(
        ConsciousActionDefinition $action,
        Model $entity,
    ): void {
        abort_if(
            $action->schemaFamily !== 'scripture'
                || $action->actionKey !== 'protected_identity.update'
                || $action->policyKey !== 'protected_identity_policy',
            422,
            'This action is not authorized for protected identity updates.',
        );

        abort_unless(
            $entity instanceof Book
                || $entity instanceof BookSection
                || $entity instanceof Chapter
                || $entity instanceof ChapterSection
                || $entity instanceof Verse,
            422,
            'Protected identity is not available for this entity.',
        );
    }
}
