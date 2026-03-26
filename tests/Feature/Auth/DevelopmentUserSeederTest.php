<?php

use App\Models\User;
use Database\Seeders\DevelopmentUserSeeder;
use Illuminate\Support\Facades\Hash;

test('development users are seeded with verified hashed passwords and can authenticate', function () {
    $this->seed(DevelopmentUserSeeder::class);

    $expectedUsers = [
        'admin@example.com' => 'Admin',
        'editor1@example.com' => 'Editor One',
        'editor2@example.com' => 'Editor Two',
        'editor3@example.com' => 'Editor Three',
    ];

    $users = User::query()
        ->whereIn('email', array_keys($expectedUsers))
        ->orderBy('email')
        ->get();

    expect($users)->toHaveCount(4);

    foreach ($users as $user) {
        expect($user->name)->toBe($expectedUsers[$user->email]);
        expect($user->email_verified_at)->not->toBeNull();
        expect(Hash::check('password', $user->password))->toBeTrue();
        expect($user->can_access_admin_context)->toBeTrue();
    }

    $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $response = $this->post(route('login.store'), [
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect(route('home', absolute: false));
    $this->assertAuthenticatedAs($admin);
});
