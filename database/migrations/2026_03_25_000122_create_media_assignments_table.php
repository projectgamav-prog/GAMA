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
        Schema::create('media_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->cascadeOnDelete();
            $table->string('assignable_type');
            $table->unsignedBigInteger('assignable_id');
            $table->string('role');
            $table->string('title_override')->nullable();
            $table->text('caption_override')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('published');
            $table->json('meta_json')->nullable();
            $table->timestamps();

            $table->index(
                ['assignable_type', 'assignable_id'],
                'media_assignments_assignable_idx',
            );
            $table->index(
                ['assignable_type', 'assignable_id', 'role', 'sort_order'],
                'media_assignments_lookup_idx',
            );
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_assignments');
    }
};
