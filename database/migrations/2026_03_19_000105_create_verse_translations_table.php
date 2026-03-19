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
        Schema::create('verse_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->string('source_key');
            $table->string('source_name');
            $table->string('language_code', 16);
            $table->longText('text');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(
                ['verse_id', 'language_code', 'source_key'],
                'verse_translations_verse_lang_source_uniq',
            );
            $table->index(['verse_id', 'sort_order'], 'verse_translations_verse_sort_idx');
            $table->index('language_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verse_translations');
    }
};
