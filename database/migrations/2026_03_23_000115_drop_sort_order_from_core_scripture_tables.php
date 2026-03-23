<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (['books', 'book_sections', 'chapters', 'chapter_sections', 'verses'] as $tableName) {
            if (! Schema::hasColumn($tableName, 'sort_order')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn('sort_order');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('books', 'sort_order')) {
            Schema::table('books', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0)->after('description');
                $table->index('sort_order');
            });
        }

        if (! Schema::hasColumn('book_sections', 'sort_order')) {
            Schema::table('book_sections', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0)->after('title');
                $table->index(['book_id', 'sort_order'], 'book_sections_book_sort_idx');
            });
        }

        if (! Schema::hasColumn('chapters', 'sort_order')) {
            Schema::table('chapters', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0)->after('title');
                $table->index(['book_section_id', 'sort_order'], 'chapters_section_sort_idx');
            });
        }

        if (! Schema::hasColumn('chapter_sections', 'sort_order')) {
            Schema::table('chapter_sections', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0)->after('title');
                $table->index(['chapter_id', 'sort_order'], 'chapter_sections_chapter_sort_idx');
            });
        }

        if (! Schema::hasColumn('verses', 'sort_order')) {
            Schema::table('verses', function (Blueprint $table): void {
                $table->unsignedInteger('sort_order')->default(0)->after('text');
                $table->index(['chapter_section_id', 'sort_order'], 'verses_section_sort_idx');
            });
        }
    }
};
