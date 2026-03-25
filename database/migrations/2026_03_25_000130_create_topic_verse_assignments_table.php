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
        Schema::create('topic_verse_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->decimal('weight', 8, 3)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(
                ['topic_id', 'verse_id'],
                'topic_verse_assignments_topic_verse_unique',
            );
            $table->index(
                ['topic_id', 'sort_order'],
                'topic_verse_assignments_topic_sort_idx',
            );
            $table->index('verse_id', 'topic_verse_assignments_verse_idx');
            $table->index(
                ['topic_id', 'weight'],
                'topic_verse_assignments_topic_weight_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('topic_verse_assignments');
    }
};
