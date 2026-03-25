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
        Schema::create('verse_meta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('verse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('primary_speaker_character_id')
                ->nullable()
                ->constrained('characters')
                ->nullOnDelete();
            $table->foreignId('primary_listener_character_id')
                ->nullable()
                ->constrained('characters')
                ->nullOnDelete();
            $table->string('scene_location')->nullable();
            $table->string('narrative_phase')->nullable();
            $table->string('teaching_mode')->nullable();
            $table->string('difficulty_level')->nullable();
            $table->unsignedSmallInteger('memorization_priority')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->text('summary_short')->nullable();
            $table->json('keywords_json')->nullable();
            $table->json('study_flags_json')->nullable();
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->unique('verse_id', 'verse_meta_verse_id_unique');
            $table->index(
                ['is_featured', 'memorization_priority'],
                'verse_meta_featured_memorization_idx',
            );
            $table->index('difficulty_level');
            $table->index('teaching_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verse_meta');
    }
};
