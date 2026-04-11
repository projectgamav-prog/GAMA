<?php

use App\Http\Controllers\Navigation\SiteNavigationItemController;
use App\Http\Controllers\Navigation\SiteNavigationWorkspaceController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('admin/navigation')
    ->name('admin.navigation.')
    ->group(function (): void {
        Route::get('/', [SiteNavigationWorkspaceController::class, 'index'])
            ->name('index');

        Route::post('items', [SiteNavigationItemController::class, 'store'])
            ->name('items.store');

        Route::patch('items/{navigationItem}', [SiteNavigationItemController::class, 'update'])
            ->name('items.update');

        Route::delete('items/{navigationItem}', [SiteNavigationItemController::class, 'destroy'])
            ->name('items.destroy');

        Route::post('items/{navigationItem}/move-up', [SiteNavigationItemController::class, 'moveUp'])
            ->name('items.move-up');

        Route::post('items/{navigationItem}/move-down', [SiteNavigationItemController::class, 'moveDown'])
            ->name('items.move-down');
    });
