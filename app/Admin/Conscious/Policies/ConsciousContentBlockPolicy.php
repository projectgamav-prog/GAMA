<?php

namespace App\Admin\Conscious\Policies;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

final class ConsciousContentBlockPolicy
{
    /**
     * @return list<string>
     */
    public function allowedBlockTypes(): array
    {
        return ['text', 'quote', 'image'];
    }

    public function assertOwnerSupported(Model $owner): void
    {
        abort_unless($this->isSupportedOwner($owner), 422, 'Content block actions are not available for this entity.');
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function assertCanPersist(Model $owner, array $payload): void
    {
        $this->assertOwnerSupported($owner);
        $this->assertBlockTypeAllowed($payload['block_type'] ?? null);
        $this->assertRegionAllowed($payload['region'] ?? null);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function assertCanUpdate(
        Model $owner,
        ContentBlock $contentBlock,
        array $payload,
    ): void {
        $this->assertOwnerSupported($owner);
        $this->assertOwnedBy($owner, $contentBlock);

        if (array_key_exists('block_type', $payload)) {
            $this->assertBlockTypeAllowed($payload['block_type']);
        }

        if (array_key_exists('region', $payload)) {
            $this->assertRegionAllowed($payload['region']);
        }
    }

    public function assertCanDelete(Model $owner, ContentBlock $contentBlock): void
    {
        $this->assertOwnerSupported($owner);
        $this->assertOwnedBy($owner, $contentBlock);
    }

    public function assertCanDuplicate(Model $owner, ContentBlock $contentBlock): void
    {
        $this->assertOwnerSupported($owner);
        $this->assertOwnedBy($owner, $contentBlock);
        $this->assertBlockTypeAllowed($contentBlock->block_type);
        $this->assertRegionAllowed($contentBlock->region);
    }

    public function assertCanReorder(
        Model $owner,
        ContentBlock $contentBlock,
        ContentBlock $relativeBlock,
    ): void {
        $this->assertOwnerSupported($owner);
        $this->assertOwnedBy($owner, $contentBlock);
        $this->assertOwnedBy($owner, $relativeBlock);

        abort_if(
            (int) $contentBlock->getKey() === (int) $relativeBlock->getKey(),
            422,
            'A content block cannot be reordered relative to itself.',
        );

        abort_unless(
            $contentBlock->region === $relativeBlock->region,
            422,
            'Content blocks may only be reordered within the same owner and region.',
        );
    }

    private function isSupportedOwner(Model $owner): bool
    {
        return $owner instanceof Book
            || $owner instanceof BookSection
            || $owner instanceof Chapter
            || $owner instanceof ChapterSection
            || $owner instanceof Verse;
    }

    private function assertOwnedBy(Model $owner, ContentBlock $contentBlock): void
    {
        abort_unless(
            $contentBlock->parent_type === $owner->getMorphClass()
                && (int) $contentBlock->parent_id === (int) $owner->getKey(),
            404,
        );
    }

    private function assertBlockTypeAllowed(mixed $value): void
    {
        if (! is_string($value) || ! in_array($value, $this->allowedBlockTypes(), true)) {
            throw ValidationException::withMessages([
                'block_type' => 'The selected block type is not available for Conscious content block actions.',
            ]);
        }
    }

    private function assertRegionAllowed(mixed $value): void
    {
        if (! is_string($value) || trim($value) === '') {
            throw ValidationException::withMessages([
                'region' => 'A content block region is required.',
            ]);
        }

        if (! preg_match('/^[a-z0-9][a-z0-9_-]{0,99}$/', trim($value))) {
            throw ValidationException::withMessages([
                'region' => 'Use a stable region key made from lowercase letters, numbers, underscores, or hyphens.',
            ]);
        }
    }
}
