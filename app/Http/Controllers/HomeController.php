<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Display the public Inertia homepage.
     */
    public function __invoke(): Response
    {
        $featuredBook = Book::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first();

        return Inertia::render('home', [
            'canRegister' => Features::enabled(Features::registration()),
            'featured_book' => $featuredBook
                ? [
                    'title' => $featuredBook->title,
                    'description' => $featuredBook->description,
                    'href' => route('scripture.books.show', $featuredBook),
                ]
                : null,
        ]);
    }
}
