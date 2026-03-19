<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Chapter extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the book section that owns the chapter.
     */
    public function bookSection(): BelongsTo
    {
        return $this->belongsTo(BookSection::class);
    }

    /**
     * Get the canonical chapter sections within the chapter.
     */
    public function chapterSections(): HasMany
    {
        return $this->hasMany(ChapterSection::class)->orderBy('sort_order');
    }

    /**
     * Get editorial blocks attached to the chapter.
     */
    public function contentBlocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'parent')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the chapter is the source entity.
     */
    public function outgoingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'source')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the chapter is the target entity.
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
