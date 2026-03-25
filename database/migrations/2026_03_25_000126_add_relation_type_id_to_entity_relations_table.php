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
        Schema::table('entity_relations', function (Blueprint $table) {
            $table->foreignId('relation_type_id')
                ->nullable()
                ->after('relation_type')
                ->constrained('relation_types')
                ->nullOnDelete()
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entity_relations', function (Blueprint $table) {
            $table->dropForeign(['relation_type_id']);
            $table->dropIndex(['relation_type_id']);
            $table->dropColumn('relation_type_id');
        });
    }
};
