<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use App\Models\Topic;

class TopicAdminRouteContext
{
    public function __construct(
        private readonly Topic $topic,
    ) {}

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    public function routeParameters(array $extra = []): array
    {
        return array_merge([
            'topic' => $this->topic,
        ], $extra);
    }

    public function topicHref(): string
    {
        return route('scripture.topics.show', $this->routeParameters());
    }

    public function fullEditHref(): string
    {
        return route('scripture.topics.admin.full-edit', $this->routeParameters());
    }

    public function detailsUpdateHref(): string
    {
        return route('scripture.topics.admin.details.update', $this->routeParameters());
    }

    public function contentBlockStoreHref(): string
    {
        return route('scripture.topics.admin.content-blocks.store', $this->routeParameters());
    }

    public function contentBlockUpdateHref(ContentBlock $contentBlock): string
    {
        return route('scripture.topics.admin.content-blocks.update', $this->routeParameters([
            'contentBlock' => $contentBlock,
        ]));
    }

    public function ownsContentBlock(ContentBlock $contentBlock): bool
    {
        return $contentBlock->parent_type === $this->topic->getMorphClass()
            && (int) $contentBlock->parent_id === (int) $this->topic->getKey();
    }

    public function isEditableNoteBlock(ContentBlock $contentBlock): bool
    {
        return $this->ownsContentBlock($contentBlock)
            && $contentBlock->block_type === 'text';
    }

    public function abortUnlessEditableNoteBlock(ContentBlock $contentBlock): void
    {
        abort_unless($this->isEditableNoteBlock($contentBlock), 404);
    }
}
