<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageBlock extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $guarded = [];

    public function pageContainer(): BelongsTo
    {
        return $this->belongsTo(PageContainer::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data_json' => 'array',
            'config_json' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
