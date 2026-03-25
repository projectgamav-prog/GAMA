<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EntityRelation extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the source entity for the relation.
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the target entity for the relation.
     */
    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the normalized relation type for the link.
     */
    public function relationType(): BelongsTo
    {
        return $this->belongsTo(RelationType::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta_json' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
