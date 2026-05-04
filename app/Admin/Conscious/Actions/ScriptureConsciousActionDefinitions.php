<?php

namespace App\Admin\Conscious\Actions;

use App\Admin\Conscious\Actions\Scripture\ProtectedIdentityAction;
use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;

final class ScriptureConsciousActionDefinitions
{
    /**
     * @return list<ConsciousActionDefinition>
     */
    public static function definitions(): array
    {
        $entityTypes = [
            'book' => Book::class,
            'book_section' => BookSection::class,
            'chapter' => Chapter::class,
            'chapter_section' => ChapterSection::class,
            'verse' => Verse::class,
            'content_block' => ContentBlock::class,
        ];
        $actions = [];

        foreach ($entityTypes as $entityType => $modelClass) {
            if ($entityType !== 'content_block') {
                $actions[] = self::protectedIdentity($entityType, $modelClass);
            }

            $actions[] = self::unavailable($entityType, $modelClass, 'create_child', 'Create child', 'create');
            $actions[] = self::unavailable($entityType, $modelClass, 'delete', 'Delete', 'delete');
            $actions[] = self::unavailable($entityType, $modelClass, 'reorder', 'Reorder', 'reorder');
            $actions[] = self::unavailable($entityType, $modelClass, 'reparent', 'Reparent', 'reparent');
        }

        return $actions;
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private static function protectedIdentity(
        string $entityType,
        string $modelClass,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: 'protected_identity.update',
            label: 'Update protected identity',
            actionKind: 'protected_identity',
            riskLevel: 'protected',
            enabled: true,
            requiresExplicitPolicy: true,
            policyKey: 'protected_identity_policy',
            handlerClass: ProtectedIdentityAction::class,
        );
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private static function unavailable(
        string $entityType,
        string $modelClass,
        string $actionKey,
        string $label,
        string $actionKind,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: $actionKey,
            label: $label,
            actionKind: $actionKind,
            riskLevel: 'dangerous',
            enabled: false,
            requiresExplicitPolicy: true,
            policyKey: 'explicit_policy_required',
            disabledReason: 'Registered for awareness only. This action is not enabled until a Conscious policy and service exist.',
        );
    }
}
