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
        Schema::create('entity_relations', function (Blueprint $table) {
            $table->id();
            $table->string('source_type');
            $table->unsignedBigInteger('source_id');
            $table->string('target_type');
            $table->unsignedBigInteger('target_id');
            $table->string('relation_type');
            $table->foreignId('relation_type_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->unique(
                ['source_type', 'source_id', 'target_type', 'target_id', 'relation_type'],
                'entity_relations_unique_link',
            );
            $table->index(
                ['source_type', 'source_id', 'relation_type', 'sort_order'],
                'entity_relations_source_sort_idx',
            );
            $table->index(
                ['target_type', 'target_id', 'relation_type'],
                'entity_relations_target_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entity_relations');
    }
};
