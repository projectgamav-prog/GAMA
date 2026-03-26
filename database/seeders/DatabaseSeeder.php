<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'development'])) {
            return;
        }

        $this->call([
            DevelopmentUserSeeder::class,
            BhagavadGitaDevelopmentSeeder::class,
        ]);
    }
}
