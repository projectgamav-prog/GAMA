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
        Schema::create('verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_section_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('number')->nullable();
            $table->longText('text');
            $table->timestamps();

            $table->unique(['chapter_section_id', 'slug'], 'verses_section_slug_uniq');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verses');
    }
};
