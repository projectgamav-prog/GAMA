<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Page extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * Resolve route-model binding with the page slug.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function pageContainers(): HasMany
    {
        return $this->hasMany(PageContainer::class)->orderBy('sort_order');
    }

    public function pageBlocks(): HasManyThrough
    {
        return $this->hasManyThrough(PageBlock::class, PageContainer::class);
    }

    /**
     * Scope the query to published pages.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeExposedRegion(Builder $query): Builder
    {
        return $query->whereNotNull('exposure_key');
    }
}
