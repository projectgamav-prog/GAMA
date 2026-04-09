<?php

use App\Http\Controllers\Cms\PageAdminCreateController;
use App\Http\Controllers\Cms\PageAdminUpdateController;
use App\Http\Controllers\Cms\PageController;
use App\Http\Controllers\Cms\PageWorkspaceController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('cms/pages')
    ->name('cms.pages.')
    ->group(function () {
        Route::get('/', [PageWorkspaceController::class, 'index'])
            ->name('index');

        Route::post('/', [PageAdminCreateController::class, 'store'])
            ->name('store');

        Route::get('{page:slug}', [PageWorkspaceController::class, 'show'])
            ->name('show');

        Route::patch('{page:slug}', [PageAdminUpdateController::class, 'update'])
            ->name('update');
    });

Route::get('pages/{page:slug}', [PageController::class, 'show'])
    ->name('pages.show');
