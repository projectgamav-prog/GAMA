<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Verse extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the canonical chapter section that owns the verse.
     */
    public function chapterSection(): BelongsTo
    {
        return $this->belongsTo(ChapterSection::class);
    }

    /**
     * Get translations for the verse.
     */
    public function translations(): HasMany
    {
        return $this->hasMany(VerseTranslation::class)->orderBy('sort_order');
    }

    /**
     * Get commentaries for the verse.
     */
    public function commentaries(): HasMany
    {
        return $this->hasMany(VerseCommentary::class)->orderBy('sort_order');
    }

    /**
     * Get editorial blocks attached to the verse.
     */
    public function contentBlocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'parent')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the verse is the source entity.
     */
    public function outgoingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'source')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the verse is the target entity.
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
