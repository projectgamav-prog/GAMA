<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VerseCardGroup extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the canonical chapter section that owns the group.
     */
    public function chapterSection(): BelongsTo
    {
        return $this->belongsTo(ChapterSection::class);
    }

    /**
     * Get the group membership rows.
     */
    public function items(): HasMany
    {
        return $this->hasMany(VerseCardGroupItem::class);
    }

    /**
     * Get the canonical verses included in this card group.
     */
    public function verses(): BelongsToMany
    {
        return $this->belongsToMany(Verse::class, 'verse_card_group_items')
            ->withTimestamps()
            ->inCanonicalOrder();
    }
}
