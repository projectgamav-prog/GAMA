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
        Schema::create('collection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained()->cascadeOnDelete();
            $table->string('item_type');
            $table->unsignedBigInteger('item_id');
            $table->string('title_override')->nullable();
            $table->text('description_override')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->unique(
                ['collection_id', 'item_type', 'item_id'],
                'collection_items_unique_item',
            );
            $table->index(
                ['collection_id', 'sort_order'],
                'collection_items_collection_sort_idx',
            );
            $table->index(['item_type', 'item_id'], 'collection_items_item_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_items');
    }
};
