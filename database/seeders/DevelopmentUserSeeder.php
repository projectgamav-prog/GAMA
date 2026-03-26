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
            $user = User::query()->firstOrNew(['email' => $attributes['email']]);

            $user->name = $attributes['name'];
            $user->email = $attributes['email'];
            $user->email_verified_at = $verifiedAt;

            if (! $user->exists || ! Hash::check(self::PASSWORD, (string) $user->password)) {
                $user->password = self::PASSWORD;
            }

            $user->save();
        }
    }

    /**
     * @return list<array{name: string, email: string}>
     */
    private function users(): array
    {
        return [
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
            ],
            [
                'name' => 'Editor One',
                'email' => 'editor1@example.com',
            ],
            [
                'name' => 'Editor Two',
                'email' => 'editor2@example.com',
            ],
            [
                'name' => 'Editor Three',
                'email' => 'editor3@example.com',
            ],
        ];
    }
}
