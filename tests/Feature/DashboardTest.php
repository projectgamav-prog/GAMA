<?php

use App\Models\User;

test('guests are redirected from dashboard to the public home page', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('home'));
});

test('authenticated users are redirected from dashboard to the public home page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('home'));
});
