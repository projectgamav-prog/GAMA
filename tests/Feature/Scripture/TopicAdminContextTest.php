<?php

use App\Models\Topic;
use App\Models\User;
use App\Support\AdminContext\AdminContext;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\DevelopmentUserSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed([
        DevelopmentUserSeeder::class,
        BhagavadGitaDevelopmentSeeder::class,
    ]);

    $this->topic = Topic::query()
        ->where('slug', 'dharma')
        ->firstOrFail();

    $this->topicShowRoute = route('scripture.topics.show', $this->topic);
    $this->detailsUpdateRoute = route(
        'scripture.topics.admin.details.update',
        $this->topic,
    );
    $this->fullEditRoute = route(
        'scripture.topics.admin.full-edit',
        $this->topic,
    );
    $this->contentBlockStoreRoute = route(
        'scripture.topics.admin.content-blocks.store',
        $this->topic,
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('topic public page no longer exposes topic-specific admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin', null),
        );
});

test('postponed topic admin routes are unavailable while guards still apply', function () {
    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
        ->assertForbidden();

    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertNotFound();

    $this->actingAs($editor)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'This postponed route should stay unavailable.',
        ])
        ->assertNotFound();

    $this->actingAs($editor)
        ->post($this->contentBlockStoreRoute, [
            'title' => 'Postponed topic note',
            'body' => 'This postponed route should stay unavailable.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertNotFound();
});
