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
        if (! Schema::hasColumn('entity_relations', 'relation_type_id')) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->foreignId('relation_type_id')
                    ->nullable()
                    ->after('relation_type');
            });
        }

        if (! Schema::hasIndex('entity_relations', 'entity_relations_relation_type_id_idx')) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->index(
                    'relation_type_id',
                    'entity_relations_relation_type_id_idx',
                );
            });
        }

        $hasForeignKey = collect(Schema::getForeignKeys('entity_relations'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'entity_relations_relation_type_id_fk',
            );

        if (! $hasForeignKey) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->foreign(
                    'relation_type_id',
                    'entity_relations_relation_type_id_fk',
                )->references('id')->on('relation_types')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hasForeignKey = collect(Schema::getForeignKeys('entity_relations'))
            ->contains(
                fn (array $foreignKey): bool => $foreignKey['name'] === 'entity_relations_relation_type_id_fk',
            );

        if ($hasForeignKey) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->dropForeign('entity_relations_relation_type_id_fk');
            });
        }

        if (Schema::hasIndex('entity_relations', 'entity_relations_relation_type_id_idx')) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->dropIndex('entity_relations_relation_type_id_idx');
            });
        }

        if (Schema::hasColumn('entity_relations', 'relation_type_id')) {
            Schema::table('entity_relations', function (Blueprint $table) {
                $table->dropColumn('relation_type_id');
            });
        }
    }
};
