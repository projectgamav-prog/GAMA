<?php

namespace App\Models;

use App\Support\Scripture\CanonicalScriptureOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Book extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the book's canonical sections.
     */
    public function bookSections(): HasMany
    {
        return $this->hasMany(BookSection::class)->inCanonicalOrder();
    }

    /**
     * Get the categories assigned to the book.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BookCategory::class, 'book_category_assignments')
            ->withTimestamps()
            ->orderBy('sort_order');
    }

    /**
     * Get editorial blocks attached to the book.
     */
    public function contentBlocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'parent')->orderBy('sort_order');
    }

    /**
     * Get media assignments attached directly to the book.
     */
    public function mediaAssignments(): MorphMany
    {
        return $this->morphMany(MediaAssignment::class, 'assignable')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the book is the source entity.
     */
    public function outgoingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'source')->orderBy('sort_order');
    }

    /**
     * Get cross-links where the book is the target entity.
     */
    public function incomingEntityRelations(): MorphMany
    {
        return $this->morphMany(EntityRelation::class, 'target')->orderBy('sort_order');
    }

    /**
     * Scope a query to canonical book order by number, then id.
     */
    public function scopeInCanonicalOrder(Builder $query): Builder
    {
        return CanonicalScriptureOrder::applyBookOrder($query);
    }
}
