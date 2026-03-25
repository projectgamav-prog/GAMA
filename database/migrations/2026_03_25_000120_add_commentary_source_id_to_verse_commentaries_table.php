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
        if (! Schema::hasColumn('verse_commentaries', 'commentary_source_id')) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->foreignId('commentary_source_id')
                    ->nullable()
                    ->after('source_name');
            });
        }

        if (! Schema::hasIndex('verse_commentaries', 'verse_commentaries_commentary_source_id_idx')) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->index(
                    'commentary_source_id',
                    'verse_commentaries_commentary_source_id_idx',
                );
            });
        }

        $hasForeignKey = collect(Schema::getForeignKeys('verse_commentaries'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'verse_commentaries_commentary_source_id_fk',
            );

        if (! $hasForeignKey) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->foreign(
                    'commentary_source_id',
                    'verse_commentaries_commentary_source_id_fk',
                )->references('id')->on('commentary_sources')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hasForeignKey = collect(Schema::getForeignKeys('verse_commentaries'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'verse_commentaries_commentary_source_id_fk',
            );

        if ($hasForeignKey) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->dropForeign('verse_commentaries_commentary_source_id_fk');
            });
        }

        if (Schema::hasIndex('verse_commentaries', 'verse_commentaries_commentary_source_id_idx')) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->dropIndex('verse_commentaries_commentary_source_id_idx');
            });
        }

        if (Schema::hasColumn('verse_commentaries', 'commentary_source_id')) {
            Schema::table('verse_commentaries', function (Blueprint $table) {
                $table->dropColumn('commentary_source_id');
            });
        }
    }
};
