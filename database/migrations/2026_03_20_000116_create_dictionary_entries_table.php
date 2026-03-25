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
        Schema::create('dictionary_entries', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('headword');
            $table->string('transliteration')->nullable();
            $table->string('normalized_headword')->index();
            $table->string('normalized_transliteration')->nullable()->index();
            $table->string('entry_type')->default('word')->index();
            $table->foreignId('root_entry_id')->nullable();
            $table->index(
                'root_entry_id',
                'dictionary_entries_root_entry_id_idx',
            );
            $table->foreign(
                'root_entry_id',
                'dictionary_entries_root_entry_id_fk',
            )->references('id')->on('dictionary_entries')->nullOnDelete();
            $table->string('root_headword')->nullable();
            $table->string('short_meaning')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dictionary_entries');
    }
};
