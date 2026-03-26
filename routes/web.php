<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::redirect('dashboard', '/')->name('dashboard');

require __DIR__.'/scripture.php';
require __DIR__.'/settings.php';
