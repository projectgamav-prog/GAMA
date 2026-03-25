<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Media extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get assignments that attach this media to entities.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(MediaAssignment::class)->orderBy('sort_order');
    }

    /**
     * Get verse recitations that use this media.
     */
    public function verseRecitations(): HasMany
    {
        return $this->hasMany(VerseRecitation::class)->orderBy('sort_order');
    }

    /**
     * Get chapter recitations that use this media.
     */
    public function chapterRecitations(): HasMany
    {
        return $this->hasMany(ChapterRecitation::class)->orderBy('sort_order');
    }

    /**
     * Get collections that use this media as their cover.
     */
    public function coveredCollections(): HasMany
    {
        return $this->hasMany(Collection::class, 'cover_media_id')->orderBy('sort_order');
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
