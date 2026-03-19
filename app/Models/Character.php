<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Character extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get editorial blocks attached to the character page.
     */
    public function contentBlocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'parent')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the character is the source entity.
     */
    public function outgoingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'source')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the character is the target entity.
     */
    public function incomingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'target')->orderBy('sort_order');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
