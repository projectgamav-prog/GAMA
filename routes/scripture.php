<?php

use App\Http\Controllers\Scripture\AdminContextVisibilityController;
use App\Http\Controllers\Scripture\BookAdminCreateController;
use App\Http\Controllers\Scripture\BookAdminDeleteController;
use App\Http\Controllers\Scripture\BookCanonicalEditController;
use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\BookSectionAdminCreateController;
use App\Http\Controllers\Scripture\BookSectionAdminDeleteController;
use App\Http\Controllers\Scripture\ChapterAdminCreateController;
use App\Http\Controllers\Scripture\ChapterAdminDeleteController;
use App\Http\Controllers\Scripture\ChapterSectionAdminCreateController;
use App\Http\Controllers\Scripture\ChapterSectionAdminDeleteController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\CharacterController;
use App\Http\Controllers\Scripture\DictionaryEntryController;
use App\Http\Controllers\Scripture\PostponedAdminSurfaceController;
use App\Http\Controllers\Scripture\TopicController;
use App\Http\Controllers\Scripture\VerseAdminCreateController;
use App\Http\Controllers\Scripture\VerseAdminDeleteController;
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
            ->prefix('admin')
            ->name('books.admin.')
            ->group(function () {
                Route::post('/', [BookAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/admin')
            ->name('books.admin.')
            ->group(function () {
                Route::get('canonical-edit', [BookCanonicalEditController::class, 'show'])
                    ->name('canonical-edit');

                Route::delete('', [BookAdminDeleteController::class, 'destroy'])
                    ->name('destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/admin')
            ->name('book-sections.admin.')
            ->group(function () {
                Route::post('/', [BookSectionAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/admin')
            ->name('book-sections.admin.')
            ->group(function () {
                Route::delete('', [BookSectionAdminDeleteController::class, 'destroy'])
                    ->name('destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/chapters/admin')
            ->name('chapters.admin.')
            ->group(function () {
                Route::post('/', [ChapterAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/admin')
            ->name('chapters.admin.')
            ->group(function () {
                Route::delete('', [ChapterAdminDeleteController::class, 'destroy'])
                    ->name('destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/admin',
            )
            ->name('chapter-sections.admin.')
            ->group(function () {
                Route::post('/', [ChapterSectionAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/admin',
            )
            ->name('chapter-sections.admin.')
            ->group(function () {
                Route::delete('', [ChapterSectionAdminDeleteController::class, 'destroy'])
                    ->name('destroy');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}',
            [VerseController::class, 'show'],
        )->name('chapters.verses.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/admin',
            )
            ->name('chapters.verses.admin.')
            ->group(function () {
                Route::post('/', [VerseAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}/admin',
            )
            ->name('chapters.verses.admin.')
            ->group(function () {
                Route::delete('', [VerseAdminDeleteController::class, 'destroy'])
                    ->name('destroy');
            });
    });
