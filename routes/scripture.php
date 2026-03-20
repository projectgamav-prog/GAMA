<?php

use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\ChapterVerseController;
use App\Http\Controllers\Scripture\VerseController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')
    ->name('scripture.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [BookController::class, 'index'])
            ->name('books.index');

        Route::get('{book:slug}', [BookController::class, 'show'])
            ->name('books.show');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/verses',
            [ChapterVerseController::class, 'index'],
        )->name('chapters.verses.index');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}',
            [VerseController::class, 'show'],
        )->name('chapters.verses.show');
    });
