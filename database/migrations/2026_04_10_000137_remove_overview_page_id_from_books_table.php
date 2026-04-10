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
        if (! Schema::hasColumn('books', 'overview_page_id')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->dropConstrainedForeignId('overview_page_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('books', 'overview_page_id')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->foreignId('overview_page_id')
                ->nullable()
                ->after('description')
                ->constrained('pages')
                ->nullOnDelete();
        });
    }
};
