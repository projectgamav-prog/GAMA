<?php

namespace App\Admin\Conscious\Actions\Scripture;

use App\Admin\Conscious\Actions\ConsciousActionDefinition;
use App\Admin\Conscious\Actions\ConsciousActionHandler;
use App\Admin\Conscious\Policies\ConsciousCanonicalHierarchyPolicy;
use App\Admin\Conscious\Services\ConsciousCanonicalDeleteService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class CanonicalDeleteAction implements ConsciousActionHandler
{
    public function __construct(
        private readonly ConsciousCanonicalHierarchyPolicy $policy,
        private readonly ConsciousCanonicalDeleteService $deleteService,
    ) {}

    public function handle(Request $request, ConsciousActionDefinition $action, Model $entity): ?RedirectResponse
    {
        abort_unless($action->actionKey === 'canonical.delete', 422);

        Validator::make($request->all(), [
            'book_id' => ['prohibited'],
            'book_section_id' => ['prohibited'],
            'chapter_id' => ['prohibited'],
            'chapter_section_id' => ['prohibited'],
            'verse_id' => ['prohibited'],
            'parent_type' => ['prohibited'],
            'parent_id' => ['prohibited'],
            'owner_type' => ['prohibited'],
            'owner_id' => ['prohibited'],
            'schema_family' => ['prohibited'],
            'entity_type' => ['prohibited'],
            'entity_id' => ['prohibited'],
        ])->validate();

        $this->policy->assertCanDelete($entity);

        return $this->deleteService->delete($entity);
    }
}
