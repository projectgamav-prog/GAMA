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
        Schema::create('verse_dictionary_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dictionary_entry_id')->constrained()->cascadeOnDelete();
            $table->string('matched_text')->nullable();
            $table->string('matched_normalized_text')->nullable();
            $table->string('match_type')->default('direct');
            $table->string('language_code', 16)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->unique(
                ['verse_id', 'dictionary_entry_id', 'matched_normalized_text'],
                'verse_dictionary_assignments_unique',
            );
            $table->index(
                ['verse_id', 'sort_order'],
                'verse_dictionary_assignments_verse_sort_idx',
            );
            $table->index('dictionary_entry_id', 'verse_dictionary_assignments_entry_idx');
            $table->index(
                'matched_normalized_text',
                'verse_dictionary_assignments_matched_text_idx',
            );
            $table->index('match_type', 'verse_dictionary_assignments_match_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verse_dictionary_assignments');
    }
};
