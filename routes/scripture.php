<?php

use App\Http\Controllers\Scripture\AdminContextVisibilityController;
use App\Http\Controllers\Scripture\BookCanonicalEditController;
use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\CharacterController;
use App\Http\Controllers\Scripture\DictionaryEntryController;
use App\Http\Controllers\Scripture\PostponedAdminSurfaceController;
use App\Http\Controllers\Scripture\TopicController;
use App\Http\Controllers\Scripture\VerseController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::get('characters', [CharacterController::class, 'index'])
    ->name('scripture.characters.index');

Route::get('characters/{character:slug}', [CharacterController::class, 'show'])
    ->name('scripture.characters.show');

// Character admin remains a postponed proof surface. Keep route names stable,
// but disable the workflow while the active CMS scope focuses on scripture pages.
Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('characters/{character:slug}/admin')
    ->name('scripture.characters.admin.')
    ->group(function () {
        Route::get('full-edit', PostponedAdminSurfaceController::class)
            ->name('full-edit');

        Route::patch('details', PostponedAdminSurfaceController::class)
            ->name('details.update');

        Route::post('content-blocks', PostponedAdminSurfaceController::class)
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            PostponedAdminSurfaceController::class,
        )->name('content-blocks.update');
    });

Route::get('dictionary', [DictionaryEntryController::class, 'index'])
    ->name('scripture.dictionary.index');

Route::get('dictionary/{dictionaryEntry:slug}', [DictionaryEntryController::class, 'show'])
    ->name('scripture.dictionary.show');

Route::get('topics', [TopicController::class, 'index'])
    ->name('scripture.topics.index');

Route::get('topics/{topic:slug}', [TopicController::class, 'show'])
    ->name('scripture.topics.show');

// Topic admin remains a postponed proof surface. Keep route names stable,
// but disable the workflow while the active CMS scope focuses on scripture pages.
Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('topics/{topic:slug}/admin')
    ->name('scripture.topics.admin.')
    ->group(function () {
        Route::get('full-edit', PostponedAdminSurfaceController::class)
            ->name('full-edit');

        Route::patch('details', PostponedAdminSurfaceController::class)
            ->name('details.update');

        Route::post('content-blocks', PostponedAdminSurfaceController::class)
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            PostponedAdminSurfaceController::class,
        )->name('content-blocks.update');
    });

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('scripture/admin-context')
    ->name('scripture.admin-context.')
    ->group(function () {
        Route::post('visibility', [AdminContextVisibilityController::class, 'update'])
            ->name('visibility.update');
    });

Route::prefix('books')
    ->name('scripture.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [BookController::class, 'index'])
            ->name('books.index');

        Route::get('{book:slug}', [BookController::class, 'show'])
            ->name('books.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/admin')
            ->name('books.admin.')
            ->group(function () {
                Route::get('canonical-edit', [BookCanonicalEditController::class, 'show'])
                    ->name('canonical-edit');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}',
            [VerseController::class, 'show'],
        )->name('chapters.verses.show');
    });
