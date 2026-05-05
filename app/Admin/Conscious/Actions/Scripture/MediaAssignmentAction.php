<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousMediaAssignmentPolicy;
use App\Models\MediaAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

final class MediaAssignmentAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousMediaAssignmentPolicy $policy,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): ?RedirectResponse
    {
        match ($action->actionKey) {
            'media_assignment.attach' => $this->attach($request, $entity),
            'media_assignment.replace' => $this->replace($request, $entity),
            'media_assignment.update' => $this->update($request, $entity),
            'media_assignment.detach' => $this->detach($request, $entity),
            default => abort(422, 'This media assignment action is not implemented.'),
        };

        return null;
    }

    private function attach(Request $request, Model $owner): void
    {
        $this->policy->assertOwnerSupported($owner);

        $validated = Validator::make($request->all(), [
            'media_id' => ['required', 'integer', 'exists:media,id'],
            'role' => ['required', 'string', Rule::in($this->policy->allowedRoles())],
            'title_override' => ['sometimes', 'nullable', 'string', 'max:255'],
            'caption_override' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'published'])],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'meta_json' => ['sometimes', 'nullable', 'array'],
            ...$this->blockedOwnerPayloadRules(),
        ])->validate();

        $this->policy->assertCanPersist($owner, $validated);

        $owner->mediaAssignments()->create([
            'media_id' => $validated['media_id'],
            'role' => trim((string) $validated['role']),
            'title_override' => $this->nullableString($validated['title_override'] ?? null),
            'caption_override' => $this->nullableString($validated['caption_override'] ?? null),
            'sort_order' => $validated['sort_order'] ?? $this->nextSortOrder($owner),
            'status' => $validated['status'] ?? 'draft',
            'meta_json' => $validated['meta_json'] ?? null,
        ]);
    }

    private function replace(Request $request, Model $owner): void
    {
        $validated = Validator::make($request->all(), [
            'media_assignment_id' => ['required', 'integer'],
            'media_id' => ['required', 'integer', 'exists:media,id'],
            ...$this->blockedOwnerPayloadRules(),
        ])->validate();

        $assignment = MediaAssignment::query()->findOrFail((int) $validated['media_assignment_id']);
        $this->policy->assertOwnedBy($owner, $assignment);
        $assignment->forceFill(['media_id' => $validated['media_id']])->save();
    }

    private function update(Request $request, Model $owner): void
    {
        $validated = Validator::make($request->all(), [
            'media_assignment_id' => ['required', 'integer'],
            'media_id' => ['sometimes', 'integer', 'exists:media,id'],
            'role' => ['sometimes', 'string', Rule::in($this->policy->allowedRoles())],
            'title_override' => ['sometimes', 'nullable', 'string', 'max:255'],
            'caption_override' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'published'])],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'meta_json' => ['sometimes', 'nullable', 'array'],
            ...$this->blockedOwnerPayloadRules(),
        ])->validate();

        $assignment = MediaAssignment::query()->findOrFail((int) $validated['media_assignment_id']);
        $this->policy->assertOwnedBy($owner, $assignment);

        $updates = [];
        foreach (['media_id', 'role', 'status', 'sort_order', 'meta_json'] as $key) {
            if (array_key_exists($key, $validated)) {
                $updates[$key] = is_string($validated[$key]) ? trim($validated[$key]) : $validated[$key];
            }
        }
        foreach (['title_override', 'caption_override'] as $key) {
            if (array_key_exists($key, $validated)) {
                $updates[$key] = $this->nullableString($validated[$key]);
            }
        }

        $assignment->forceFill($updates)->save();
    }

    private function detach(Request $request, Model $owner): void
    {
        $validated = Validator::make($request->all(), [
            'media_assignment_id' => ['required', 'integer'],
            ...$this->blockedOwnerPayloadRules(),
        ])->validate();

        $assignment = MediaAssignment::query()->findOrFail((int) $validated['media_assignment_id']);
        $this->policy->assertOwnedBy($owner, $assignment);
        $assignment->delete();
    }

    /**
     * @return array<string, list<string>>
     */
    private function blockedOwnerPayloadRules(): array
    {
        return [
            'assignable_type' => ['prohibited'],
            'assignable_id' => ['prohibited'],
            'owner_type' => ['prohibited'],
            'owner_id' => ['prohibited'],
        ];
    }

    private function nextSortOrder(Model $owner): int
    {
        $maxSortOrder = $owner->mediaAssignments()->max('sort_order');

        return $maxSortOrder === null ? 1 : ((int) $maxSortOrder) + 1;
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
