<?php

namespace Database\Seeders;

use App\Support\Scripture\ScriptureJsonImporter;
use Illuminate\Database\Seeder;

class ScriptureCorpusDevelopmentSeeder extends Seeder
{
    /**
     * Seed the full enabled scripture corpus for local development browsing.
     */
    public function run(): void
    {
        app(ScriptureJsonImporter::class)->import();
    }
}
