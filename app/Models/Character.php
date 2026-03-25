<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Character extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get verse metadata where the character is the primary speaker.
     */
    public function spokenVerseMeta(): HasMany
    {
        return $this->hasMany(VerseMeta::class, 'primary_speaker_character_id');
    }

    /**
     * Get verse metadata where the character is the primary listener.
     */
    public function heardVerseMeta(): HasMany
    {
        return $this->hasMany(VerseMeta::class, 'primary_listener_character_id');
    }

    /**
     * Get direct verse assignments linked to the character.
     */
    public function verseAssignments(): HasMany
    {
        return $this->hasMany(CharacterVerseAssignment::class)->orderBy('sort_order');
    }

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
