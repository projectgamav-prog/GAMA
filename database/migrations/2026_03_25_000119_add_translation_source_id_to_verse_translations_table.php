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
        Schema::table('verse_translations', function (Blueprint $table) {
            $table->foreignId('translation_source_id')
                ->nullable()
                ->after('source_name')
                ->constrained('translation_sources')
                ->nullOnDelete()
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('verse_translations', function (Blueprint $table) {
            $table->dropForeign(['translation_source_id']);
            $table->dropIndex(['translation_source_id']);
            $table->dropColumn('translation_source_id');
        });
    }
};
