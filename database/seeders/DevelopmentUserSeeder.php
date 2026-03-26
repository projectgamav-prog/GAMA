<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevelopmentUserSeeder extends Seeder
{
    private const PASSWORD = 'password';

    /**
     * Seed stable local development logins.
     */
    public function run(): void
    {
        $verifiedAt = CarbonImmutable::parse('2024-01-01 00:00:00', 'UTC');

        foreach ($this->users() as $attributes) {
            User::query()->updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'email' => $attributes['email'],
                    'email_verified_at' => $verifiedAt,
                    'password' => Hash::make(self::PASSWORD),
                    'can_access_admin_context' => $attributes['can_access_admin_context'],
                ],
            );
        }
    }

    /**
     * @return list<array{name: string, email: string, can_access_admin_context: bool}>
     */
    private function users(): array
    {
        return [
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'can_access_admin_context' => true,
            ],
            [
                'name' => 'Editor One',
                'email' => 'editor1@example.com',
                'can_access_admin_context' => true,
            ],
            [
                'name' => 'Editor Two',
                'email' => 'editor2@example.com',
                'can_access_admin_context' => true,
            ],
            [
                'name' => 'Editor Three',
                'email' => 'editor3@example.com',
                'can_access_admin_context' => true,
            ],
        ];
    }
}
