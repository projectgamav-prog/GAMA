<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the authenticated workspace dashboard.
     */
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'bookCount' => Book::query()->count(),
        ]);
    }
}
