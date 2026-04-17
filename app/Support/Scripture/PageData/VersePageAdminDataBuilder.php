<?php

namespace App\Support\Scripture\PageData;

use App\Models\CommentarySource;
use App\Models\ContentBlock;
use App\Models\TranslationSource;
use App\Models\Verse;
use App\Models\VerseCommentary;
use App\Models\VerseTranslation;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\VerseAdminRouteContext;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\PublicScriptureData;

class VersePageAdminDataBuilder
{
    /**
     * @return array<string, mixed>
     */
    public function adminPayload(
        Verse $verse,
        VerseAdminRouteContext $adminRouteContext,
        ?ContentBlock $primaryIntroBlock,
        PublicScriptureData $publicScriptureData,
        AdminEntityDefinition $adminEntityDefinition,
    ): array {
        $translationSources = TranslationSource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
        $commentarySources = CommentarySource::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return [
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'meta_update_href' => $adminRouteContext->metaUpdateHref(),
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'translations' => [
                'store_href' => $adminRouteContext->translationStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextTranslationSortOrder(
                    $verse->translations,
                ),
                'rows' => collect($verse->translations)
                    ->map(
                        fn (VerseTranslation $translation) => VerseRelationAdminData::translation(
                            $translation,
                            $adminRouteContext->translationUpdateHref($translation),
                            $adminRouteContext->translationDestroyHref($translation),
                        ),
                    )
                    ->values()
                    ->all(),
                'sources' => VerseRelationAdminData::translationSources($translationSources),
                'fields' => VerseRelationAdminData::translationFields($adminEntityDefinition),
            ],
            'commentaries' => [
                'store_href' => $adminRouteContext->commentaryStoreHref(),
                'next_sort_order' => VerseRelationAdminData::nextCommentarySortOrder(
                    $verse->commentaries,
                ),
                'rows' => collect($verse->commentaries)
                    ->map(
                        fn (VerseCommentary $commentary) => VerseRelationAdminData::commentary(
                            $commentary,
                            $adminRouteContext->commentaryUpdateHref($commentary),
                            $adminRouteContext->commentaryDestroyHref($commentary),
                        ),
                    )
                    ->values()
                    ->all(),
                'sources' => VerseRelationAdminData::commentarySources($commentarySources),
                'fields' => VerseRelationAdminData::commentaryFields($adminEntityDefinition),
            ],
            'intro_store_href' => $adminRouteContext->contentBlockStoreHref(),
            'primary_intro_block' => $primaryIntroBlock
                ? $publicScriptureData->contentBlock($primaryIntroBlock)
                : null,
            'primary_intro_update_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockUpdateHref($primaryIntroBlock)
                : null,
            'primary_intro_destroy_href' => $primaryIntroBlock
                ? $adminRouteContext->contentBlockDestroyHref($primaryIntroBlock)
                : null,
            'intro_block_types' => $adminRouteContext->contentBlockTypes(),
            'intro_default_region' => $adminRouteContext->defaultIntroBlockRegion(),
        ];
    }
}
