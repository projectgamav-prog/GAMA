<?php

namespace App\Support\Scripture\Admin;

use App\Models\ContentBlock;
use Illuminate\Support\Collection;

/**
 * Represents the visible public-page block sequence used by block management.
 *
 * The caller provides a pre-filtered block list, usually "published blocks the
 * live page can actually show and manage". That keeps move up/down aligned with
 * editor expectations and prevents hidden or unsupported blocks from becoming
 * accidental reorder anchors.
 */
class VisibleContentBlockSequence
{
    /**
     * @param  Collection<int, ContentBlock>  $blocks
     */
    public function __construct(
        private readonly Collection $blocks,
    ) {}

    public function contains(ContentBlock $contentBlock): bool
    {
        return $this->indexOf($contentBlock) !== null;
    }

    public function previousInSameRegion(ContentBlock $contentBlock): ?ContentBlock
    {
        $index = $this->indexOf($contentBlock);

        if ($index === null || $index === 0) {
            return null;
        }

        $candidate = $this->blocks->values()->get($index - 1);

        return $candidate instanceof ContentBlock
            && $candidate->region === $contentBlock->region
            ? $candidate
            : null;
    }

    public function nextInSameRegion(ContentBlock $contentBlock): ?ContentBlock
    {
        $index = $this->indexOf($contentBlock);

        if ($index === null) {
            return null;
        }

        $candidate = $this->blocks->values()->get($index + 1);

        return $candidate instanceof ContentBlock
            && $candidate->region === $contentBlock->region
            ? $candidate
            : null;
    }

    private function indexOf(ContentBlock $contentBlock): ?int
    {
        $index = $this->blocks
            ->values()
            ->search(
                fn (ContentBlock $candidate): bool => (int) $candidate->getKey() === (int) $contentBlock->getKey(),
            );

        return is_int($index) ? $index : null;
    }
}
