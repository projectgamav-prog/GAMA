<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class DictionaryEntry extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'slug',
        'headword',
        'transliteration',
        'entry_type',
        'root_entry_id',
        'root_headword',
        'short_meaning',
        'notes',
        'is_published',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $entry): void {
            $entry->normalized_headword = self::normalizeForSearch($entry->headword) ?? '';
            $entry->normalized_transliteration = self::normalizeForSearch(
                $entry->transliteration,
                lowercase: true,
            );
        });
    }

    /**
     * Scope a query to published dictionary entries.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Get the linked root entry, when present.
     */
    public function rootEntry(): BelongsTo
    {
        return $this->belongsTo(self::class, 'root_entry_id');
    }

    /**
     * Get entries that derive from this entry.
     */
    public function derivedEntries(): HasMany
    {
        return $this->hasMany(self::class, 'root_entry_id');
    }

    /**
     * Scope a query to dictionary ordering by normalized headword.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        $keyColumn = $query->getModel()->qualifyColumn($query->getModel()->getKeyName());

        return $query
            ->orderBy('normalized_headword')
            ->orderBy('headword')
            ->orderBy($keyColumn);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }

    private static function normalizeForSearch(?string $value, bool $lowercase = false): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = preg_replace('/[\p{Cf}\x{200B}\x{200C}\x{200D}\x{FEFF}]+/u', '', $value) ?? $value;
        $normalized = preg_replace('/[^\p{L}\p{M}\p{N}\s]+/u', ' ', $normalized) ?? $normalized;
        $normalized = Str::squish($normalized);

        if ($lowercase) {
            $normalized = Str::lower($normalized);
        }

        return $normalized === '' ? null : $normalized;
    }
}
