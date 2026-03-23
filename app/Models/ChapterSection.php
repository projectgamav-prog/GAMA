<?php

namespace App\Models;

use App\Support\Scripture\CanonicalScriptureOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ChapterSection extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the chapter that owns the section.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Get the canonical verses within the section.
     */
    public function verses(): HasMany
    {
        return $this->hasMany(Verse::class)->inCanonicalOrder();
    }

    /**
     * Get presentation-only verse card groupings within the section.
     */
    public function verseCardGroups(): HasMany
    {
        return $this->hasMany(VerseCardGroup::class);
    }

    /**
     * Get editorial blocks attached to the section.
     */
    public function contentBlocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'parent')->orderBy('sort_order');
    }

    /**
     * Scope a query to canonical chapter-section order.
     */
    public function scopeInCanonicalOrder(Builder $query): Builder
    {
        return CanonicalScriptureOrder::applyNumberOrder($query);
    }
}
