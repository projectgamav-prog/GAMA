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
        Schema::create('character_verse_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('character_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->decimal('weight', 8, 3)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(
                ['character_id', 'verse_id'],
                'character_verse_assignments_character_verse_unique',
            );
            $table->index(
                ['character_id', 'sort_order'],
                'character_verse_assignments_character_sort_idx',
            );
            $table->index('verse_id', 'character_verse_assignments_verse_idx');
            $table->index(
                ['character_id', 'weight'],
                'character_verse_assignments_character_weight_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('character_verse_assignments');
    }
};
