<?php

namespace App\Admin\Conscious\Policies;

use App\Models\Book;
use App\Models\MediaAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

final class ConsciousMediaAssignmentPolicy
{
    /**
     * @return list<string>
     */
    public function allowedRoles(): array
    {
        return ['overview_video', 'hero_media', 'supporting_media'];
    }

    public function assertOwnerSupported(Model $owner): void
    {
        abort_unless($owner instanceof Book, 422, 'Media assignment actions are currently available only for books.');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function assertCanPersist(Model $owner, array $payload): void
    {
        $this->assertOwnerSupported($owner);
        $this->assertRoleAllowed($payload['role'] ?? null);
    }

    public function assertOwnedBy(Model $owner, MediaAssignment $assignment): void
    {
        $this->assertOwnerSupported($owner);

        abort_unless(
            $assignment->assignable_type === $owner->getMorphClass()
                && (int) $assignment->assignable_id === (int) $owner->getKey(),
            404,
        );
    }

    private function assertRoleAllowed(mixed $value): void
    {
        if (! is_string($value) || ! in_array($value, $this->allowedRoles(), true)) {
            throw ValidationException::withMessages([
                'role' => 'The selected media assignment role is not available.',
            ]);
        }
    }
}
