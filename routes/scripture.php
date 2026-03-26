<?php

use App\Http\Controllers\Scripture\AdminContextVisibilityController;
use App\Http\Controllers\Scripture\BookAdminContentBlockController;
use App\Http\Controllers\Scripture\BookAdminDetailsController;
use App\Http\Controllers\Scripture\BookAdminMediaAssignmentController;
use App\Http\Controllers\Scripture\BookCanonicalEditController;
use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\BookFullEditController;
use App\Http\Controllers\Scripture\ChapterAdminContentBlockController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\ChapterFullEditController;
use App\Http\Controllers\Scripture\ChapterVerseController;
use App\Http\Controllers\Scripture\CharacterAdminContentBlockController;
use App\Http\Controllers\Scripture\CharacterAdminDetailsController;
use App\Http\Controllers\Scripture\CharacterController;
use App\Http\Controllers\Scripture\CharacterFullEditController;
use App\Http\Controllers\Scripture\DictionaryEntryController;
use App\Http\Controllers\Scripture\TopicAdminContentBlockController;
use App\Http\Controllers\Scripture\TopicAdminDetailsController;
use App\Http\Controllers\Scripture\TopicController;
use App\Http\Controllers\Scripture\TopicFullEditController;
use App\Http\Controllers\Scripture\VerseAdminContentBlockController;
use App\Http\Controllers\Scripture\VerseAdminMetaController;
use App\Http\Controllers\Scripture\VerseController;
use App\Http\Controllers\Scripture\VerseFullEditController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::get('characters', [CharacterController::class, 'index'])
    ->name('scripture.characters.index');

Route::get('characters/{character:slug}', [CharacterController::class, 'show'])
    ->name('scripture.characters.show');

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('characters/{character:slug}/admin')
    ->name('scripture.characters.admin.')
    ->group(function () {
        Route::get('full-edit', [CharacterFullEditController::class, 'show'])
            ->name('full-edit');

        Route::patch('details', [CharacterAdminDetailsController::class, 'update'])
            ->name('details.update');

        Route::post('content-blocks', [CharacterAdminContentBlockController::class, 'store'])
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            [CharacterAdminContentBlockController::class, 'update'],
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

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('topics/{topic:slug}/admin')
    ->name('scripture.topics.admin.')
    ->group(function () {
        Route::get('full-edit', [TopicFullEditController::class, 'show'])
            ->name('full-edit');

        Route::patch('details', [TopicAdminDetailsController::class, 'update'])
            ->name('details.update');

        Route::post('content-blocks', [TopicAdminContentBlockController::class, 'store'])
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            [TopicAdminContentBlockController::class, 'update'],
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

        Route::get('{book:slug}/overview', [BookController::class, 'overview'])
            ->name('books.overview');

        Route::get('{book:slug}', [BookController::class, 'show'])
            ->name('books.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/admin')
            ->name('books.admin.')
            ->group(function () {
                Route::get('full-edit', [BookFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::get('canonical-edit', [BookCanonicalEditController::class, 'show'])
                    ->name('canonical-edit');

                Route::patch('details', [BookAdminDetailsController::class, 'update'])
                    ->name('details.update');

                Route::post('content-blocks', [BookAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [BookAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::post(
                    'media-assignments',
                    [BookAdminMediaAssignmentController::class, 'store'],
                )->name('media-assignments.store');

                Route::patch(
                    'media-assignments/{mediaAssignment}',
                    [BookAdminMediaAssignmentController::class, 'update'],
                )->name('media-assignments.update');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/admin')
            ->name('chapters.admin.')
            ->group(function () {
                Route::get('full-edit', [ChapterFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::post('content-blocks', [ChapterAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [ChapterAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/verses',
            [ChapterVerseController::class, 'index'],
        )->name('chapters.verses.index');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}',
            [VerseController::class, 'show'],
        )->name('chapters.verses.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}/admin',
            )
            ->name('chapters.verses.admin.')
            ->group(function () {
                Route::get('full-edit', [VerseFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::patch('meta', [VerseAdminMetaController::class, 'update'])
                    ->name('meta.update');

                Route::post('content-blocks', [VerseAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [VerseAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');
            });
    });
