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
        if (! Schema::hasColumn('verse_translations', 'translation_source_id')) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->foreignId('translation_source_id')
                    ->nullable()
                    ->after('source_name');
            });
        }

        if (! Schema::hasIndex('verse_translations', 'verse_translations_translation_source_id_idx')) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->index(
                    'translation_source_id',
                    'verse_translations_translation_source_id_idx',
                );
            });
        }

        $hasForeignKey = collect(Schema::getForeignKeys('verse_translations'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'verse_translations_translation_source_id_fk',
            );

        if (! $hasForeignKey) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->foreign(
                    'translation_source_id',
                    'verse_translations_translation_source_id_fk',
                )->references('id')->on('translation_sources')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hasForeignKey = collect(Schema::getForeignKeys('verse_translations'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'verse_translations_translation_source_id_fk',
            );

        if ($hasForeignKey) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->dropForeign('verse_translations_translation_source_id_fk');
            });
        }

        if (Schema::hasIndex('verse_translations', 'verse_translations_translation_source_id_idx')) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->dropIndex('verse_translations_translation_source_id_idx');
            });
        }

        if (Schema::hasColumn('verse_translations', 'translation_source_id')) {
            Schema::table('verse_translations', function (Blueprint $table) {
                $table->dropColumn('translation_source_id');
            });
        }
    }
};
