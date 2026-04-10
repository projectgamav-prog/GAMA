<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Support\Cms\Regions\CmsExposedRegionRegistry;
use App\Support\Cms\Regions\CmsExposedRegionResolver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Display the public Inertia homepage.
     */
    public function __invoke(
        Request $request,
        CmsExposedRegionRegistry $regionRegistry,
        CmsExposedRegionResolver $regionResolver,
    ): Response
    {
        $featuredBook = Book::query()
            ->inCanonicalOrder()
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
            'cms_regions' => $regionResolver->resolve([
                $regionRegistry->homePrimary(route('home', absolute: false)),
            ], $request->user()),
        ]);
    }
}
