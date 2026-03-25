<?php

namespace App\Models;

use App\Support\Scripture\CanonicalScriptureOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
     * Get structured metadata for the verse.
     */
    public function verseMeta(): HasOne
    {
        return $this->hasOne(VerseMeta::class);
    }

    /**
     * Get dictionary entries linked to the verse.
     */
    public function dictionaryAssignments(): HasMany
    {
        return $this->hasMany(VerseDictionaryAssignment::class)->orderBy('sort_order');
    }

    /**
     * Get recitations linked to the verse.
     */
    public function recitations(): HasMany
    {
        return $this->hasMany(VerseRecitation::class)->orderBy('sort_order');
    }

    /**
     * Get topic assignments linked to the verse.
     */
    public function topicAssignments(): HasMany
    {
        return $this->hasMany(TopicVerseAssignment::class)->orderBy('sort_order');
    }

    /**
     * Get character assignments linked to the verse.
     */
    public function characterAssignments(): HasMany
    {
        return $this->hasMany(CharacterVerseAssignment::class)->orderBy('sort_order');
    }

    /**
     * Get the presentation-only card group membership row for the verse.
     */
    public function verseCardGroupItem(): HasOne
    {
        return $this->hasOne(VerseCardGroupItem::class);
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
     * Scope a query to canonical verse order.
     */
    public function scopeInCanonicalOrder(Builder $query): Builder
    {
        return CanonicalScriptureOrder::applyNumberOrder($query);
    }
}
