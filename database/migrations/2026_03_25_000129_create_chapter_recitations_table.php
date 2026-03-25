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
        Schema::create('chapter_recitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->string('reciter_name');
            $table->string('reciter_slug')->nullable();
            $table->string('language_code', 16)->nullable();
            $table->string('style')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('published');
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->unique(['chapter_id', 'media_id'], 'chapter_recitations_chapter_media_unique');
            $table->index(['chapter_id', 'sort_order'], 'chapter_recitations_chapter_sort_idx');
            $table->index('reciter_slug', 'chapter_recitations_reciter_slug_idx');
            $table->index('status', 'chapter_recitations_status_idx');
            $table->index(['chapter_id', 'status'], 'chapter_recitations_chapter_status_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapter_recitations');
    }
};
