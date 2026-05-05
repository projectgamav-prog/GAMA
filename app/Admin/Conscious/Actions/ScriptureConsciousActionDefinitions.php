<?php

namespace App\Admin\Conscious\Actions;

use App\Admin\Conscious\Actions\Scripture\ContentBlockAction;
use App\Admin\Conscious\Actions\Scripture\CanonicalCreateAction;
use App\Admin\Conscious\Actions\Scripture\CanonicalDeleteAction;
use App\Admin\Conscious\Actions\Scripture\MediaAssignmentAction;
use App\Admin\Conscious\Actions\Scripture\ProtectedIdentityAction;
use App\Admin\Conscious\Actions\Scripture\VerseCommentaryAction;
use App\Admin\Conscious\Actions\Scripture\VerseMetaAction;
use App\Admin\Conscious\Actions\Scripture\VerseTranslationAction;
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
                $actions = [
                    ...$actions,
                    ...self::canonicalActions($entityType, $modelClass),
                ];
                $actions[] = self::contentBlock($entityType, $modelClass, 'content_block.create', 'Create content block', 'create', true);
                $actions[] = self::contentBlock($entityType, $modelClass, 'content_block.update', 'Update content block', 'update', true);
                $actions[] = self::contentBlock($entityType, $modelClass, 'content_block.delete', 'Delete content block', 'delete', true);
                $actions[] = self::contentBlock($entityType, $modelClass, 'content_block.duplicate', 'Duplicate content block', 'duplicate', true);
                $actions[] = self::contentBlock($entityType, $modelClass, 'content_block.reorder', 'Reorder content blocks', 'reorder', true);
            }

            if ($entityType === 'book') {
                $actions[] = self::mediaAssignment($entityType, $modelClass, 'media_assignment.attach', 'Attach media assignment', 'attach', true);
                $actions[] = self::mediaAssignment($entityType, $modelClass, 'media_assignment.replace', 'Replace media assignment media', 'replace', true);
                $actions[] = self::mediaAssignment($entityType, $modelClass, 'media_assignment.update', 'Update media assignment', 'update', true);
                $actions[] = self::mediaAssignment($entityType, $modelClass, 'media_assignment.detach', 'Detach media assignment', 'detach', true);
                $actions[] = self::mediaAssignment($entityType, $modelClass, 'media_assignment.reorder', 'Reorder media assignments', 'reorder', false);
            }

            if ($entityType === 'verse') {
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.meta.update', 'Update verse meta', 'meta', VerseMetaAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.translation.create', 'Create verse translation', 'translation_create', VerseTranslationAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.translation.update', 'Update verse translation', 'translation_update', VerseTranslationAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.translation.delete', 'Delete verse translation', 'translation_delete', VerseTranslationAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.translation.reorder', 'Reorder verse translations', 'translation_reorder', VerseTranslationAction::class, false);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.commentary.create', 'Create verse commentary', 'commentary_create', VerseCommentaryAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.commentary.update', 'Update verse commentary', 'commentary_update', VerseCommentaryAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.commentary.delete', 'Delete verse commentary', 'commentary_delete', VerseCommentaryAction::class, true);
                $actions[] = self::verseSupport($entityType, $modelClass, 'verse_support.commentary.reorder', 'Reorder verse commentaries', 'commentary_reorder', VerseCommentaryAction::class, false);
            }

            $actions[] = self::unavailable($entityType, $modelClass, 'canonical.reorder', 'Reorder canonical hierarchy', 'reorder');
            $actions[] = self::unavailable($entityType, $modelClass, 'canonical.move', 'Move canonical entity', 'move');
            $actions[] = self::unavailable($entityType, $modelClass, 'canonical.reparent', 'Reparent canonical entity', 'reparent');
        }

        return $actions;
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     * @return list<ConsciousActionDefinition>
     */
    private static function canonicalActions(
        string $entityType,
        string $modelClass,
    ): array {
        $actions = [];

        $createAction = match ($entityType) {
            'book' => 'canonical.create_book_section',
            'book_section' => 'canonical.create_chapter',
            'chapter' => 'canonical.create_chapter_section',
            'chapter_section' => 'canonical.create_verse',
            default => null,
        };

        if ($entityType === 'book') {
            $actions[] = self::canonicalCreate(
                $entityType,
                $modelClass,
                'canonical.create_book',
                'Create book',
            );
        }

        if ($createAction !== null) {
            $actions[] = self::canonicalCreate(
                $entityType,
                $modelClass,
                $createAction,
                'Create canonical child',
            );
        }

        $actions[] = new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: 'canonical.delete',
            label: 'Delete canonical entity',
            actionKind: 'delete',
            riskLevel: 'dangerous',
            enabled: true,
            requiresExplicitPolicy: true,
            policyKey: 'canonical_hierarchy_policy',
            handlerClass: CanonicalDeleteAction::class,
        );

        return $actions;
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private static function canonicalCreate(
        string $entityType,
        string $modelClass,
        string $actionKey,
        string $label,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: $actionKey,
            label: $label,
            actionKind: 'create',
            riskLevel: 'protected',
            enabled: true,
            requiresExplicitPolicy: true,
            policyKey: 'canonical_hierarchy_policy',
            handlerClass: CanonicalCreateAction::class,
        );
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
    private static function contentBlock(
        string $entityType,
        string $modelClass,
        string $actionKey,
        string $label,
        string $actionKind,
        bool $enabled,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: $actionKey,
            label: $label,
            actionKind: $actionKind,
            riskLevel: $actionKind === 'delete' ? 'destructive' : 'structured',
            enabled: $enabled,
            requiresExplicitPolicy: true,
            policyKey: 'content_block_policy',
            handlerClass: $enabled ? ContentBlockAction::class : null,
            disabledReason: $enabled
                ? null
                : 'Registered for awareness only. This content block action is not enabled until its Conscious service is implemented.',
        );
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    private static function mediaAssignment(
        string $entityType,
        string $modelClass,
        string $actionKey,
        string $label,
        string $actionKind,
        bool $enabled,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: $actionKey,
            label: $label,
            actionKind: $actionKind,
            riskLevel: $actionKind === 'detach' ? 'destructive' : 'structured',
            enabled: $enabled,
            requiresExplicitPolicy: true,
            policyKey: 'media_assignment_policy',
            handlerClass: $enabled ? MediaAssignmentAction::class : null,
            disabledReason: $enabled
                ? null
                : 'Registered for awareness only. Media assignment reorder is disabled until same-role ordering policy and UI contracts are ready.',
        );
    }

    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     * @param  class-string<ConsciousActionHandler>  $handlerClass
     */
    private static function verseSupport(
        string $entityType,
        string $modelClass,
        string $actionKey,
        string $label,
        string $actionKind,
        string $handlerClass,
        bool $enabled,
    ): ConsciousActionDefinition {
        return new ConsciousActionDefinition(
            schemaFamily: 'scripture',
            entityType: $entityType,
            modelClass: $modelClass,
            actionKey: $actionKey,
            label: $label,
            actionKind: $actionKind,
            riskLevel: str_ends_with($actionKey, '.delete') ? 'destructive' : 'structured',
            enabled: $enabled,
            requiresExplicitPolicy: true,
            policyKey: 'verse_support_policy',
            handlerClass: $enabled ? $handlerClass : null,
            disabledReason: $enabled
                ? null
                : 'Registered for awareness only. Verse support reorder is disabled until ordering policy and UI contracts are ready.',
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
