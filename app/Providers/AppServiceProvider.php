<?php

namespace App\Providers;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\Character;
use App\Models\ContentBlock;
use App\Models\Topic;
use App\Models\Verse;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureMorphMap();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure stable aliases for persisted polymorphic types.
     */
    protected function configureMorphMap(): void
    {
        Relation::enforceMorphMap([
            'book' => Book::class,
            'book_section' => BookSection::class,
            'chapter' => Chapter::class,
            'chapter_section' => ChapterSection::class,
            'verse' => Verse::class,
            'character' => Character::class,
            'topic' => Topic::class,
            'content_block' => ContentBlock::class,
        ]);
    }
}
