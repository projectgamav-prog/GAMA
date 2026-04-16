<?php

namespace App\Support\Scripture\PageData;

use App\Models\CommentarySource;
use App\Models\ContentBlock;
use App\Models\TranslationSource;
use App\Support\Scripture\Admin\ChapterAdminRouteContext;
use App\Support\Scripture\Admin\Registry\AdminEntityDefinition;
use App\Support\Scripture\Admin\VerseRelationAdminData;
use App\Support\Scripture\PublicScriptureData;
use Illuminate\Support\Collection;

class ChapterPageAdminDataBuilder
{
    /**
     * @param  Collection<int, ContentBlock>  $contentBlocks
     */
    public function primaryIntroBlock(
        Collection $contentBlocks,
        ChapterAdminRouteContext $adminRouteContext,
    ): ?ContentBlock {
        return \App\Support\Scripture\Admin\PrimaryPublishedEditableContentBlock::resolve(
            $contentBlocks,
            fn (ContentBlock $block): bool => $adminRouteContext->isEditableIntroBlock($block),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function adminPayload(
        ChapterAdminRouteContext $adminRouteContext,
        ?ContentBlock $primaryIntroBlock,
        PublicScriptureData $publicScriptureData,
    ): array {
        return [
            'full_edit_href' => $adminRouteContext->fullEditHref(),
            'identity_update_href' => $adminRouteContext->identityUpdateHref(),
            'destroy_href' => $adminRouteContext->destroyHref(),
            'chapter_section_store_href' => route(
                'scripture.chapter-sections.admin.store',
                $adminRouteContext->routeParameters(),
            ),
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

    /**
     * @return array<string, mixed>
     */
    public function verseAdminSharedPayload(
        AdminEntityDefinition $verseAdminDefinition,
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
            'translations' => [
                'sources' => VerseRelationAdminData::translationSources($translationSources),
                'fields' => VerseRelationAdminData::translationFields($verseAdminDefinition),
            ],
            'commentaries' => [
                'sources' => VerseRelationAdminData::commentarySources($commentarySources),
                'fields' => VerseRelationAdminData::commentaryFields($verseAdminDefinition),
            ],
        ];
    }
}
