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
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('parent_type');
            $table->unsignedBigInteger('parent_id');
            $table->string('region');
            $table->string('block_type');
            $table->string('title')->nullable();
            $table->longText('body')->nullable();
            $table->json('data_json')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status');
            $table->timestamps();

            $table->index(
                ['parent_type', 'parent_id', 'region', 'sort_order'],
                'content_blocks_parent_region_sort_idx',
            );
            $table->index('block_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
    }
};
