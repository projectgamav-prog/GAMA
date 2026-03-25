<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerseMeta extends Model
{
    use HasFactory;

    protected $table = 'verse_meta';

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Get the verse that owns the metadata row.
     */
    public function verse(): BelongsTo
    {
        return $this->belongsTo(Verse::class);
    }

    /**
     * Get the primary speaker for the verse.
     */
    public function primarySpeakerCharacter(): BelongsTo
    {
        return $this->belongsTo(Character::class, 'primary_speaker_character_id');
    }

    /**
     * Get the primary listener for the verse.
     */
    public function primaryListenerCharacter(): BelongsTo
    {
        return $this->belongsTo(Character::class, 'primary_listener_character_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'keywords_json' => 'array',
            'memorization_priority' => 'integer',
            'meta_json' => 'array',
            'study_flags_json' => 'array',
        ];
    }
}
