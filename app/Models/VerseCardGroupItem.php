<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerseCardGroupItem extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the verse card group that owns this item.
     */
    public function verseCardGroup(): BelongsTo
    {
        return $this->belongsTo(VerseCardGroup::class);
    }

    /**
     * Get the canonical verse included by this item.
     */
    public function verse(): BelongsTo
    {
        return $this->belongsTo(Verse::class);
    }
}
